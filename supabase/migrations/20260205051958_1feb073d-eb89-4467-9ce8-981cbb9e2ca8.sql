-- Add new booking statuses to the enum
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending_payment';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'no_show';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'refunded';

-- Create slot_locks table for temporary slot reservation
CREATE TABLE public.slot_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on slot_locks
ALTER TABLE public.slot_locks ENABLE ROW LEVEL SECURITY;

-- Users can view their own locks
CREATE POLICY "Users can view own slot locks"
ON public.slot_locks FOR SELECT
USING (auth.uid() = user_id);

-- Users can create slot locks
CREATE POLICY "Users can create slot locks"
ON public.slot_locks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own locks
CREATE POLICY "Users can delete own slot locks"
ON public.slot_locks FOR DELETE
USING (auth.uid() = user_id);

-- Center owners can view locks for their centers
CREATE POLICY "Center owners can view slot locks"
ON public.slot_locks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM centers WHERE centers.id = slot_locks.center_id AND centers.owner_id = auth.uid()
));

-- Create audit_logs table for tracking changes
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create notification_logs table
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('booking_confirmation', 'reminder_24h', 'reminder_2h', 'cancellation', 'reschedule', 'review_request')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'push')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification logs
CREATE POLICY "Users can view own notifications"
ON public.notification_logs FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all notification logs
CREATE POLICY "Admins can view all notifications"
ON public.notification_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add cancellation_policy to centers
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS cancellation_hours INTEGER DEFAULT 24;
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS cancellation_fee_percent INTEGER DEFAULT 0;

-- Add rescheduled_from to bookings for tracking reschedules
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS rescheduled_from UUID REFERENCES public.bookings(id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Create index for faster slot availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_center_date_time ON public.bookings(center_id, booking_date, booking_time);
CREATE INDEX IF NOT EXISTS idx_slot_locks_center_date_time ON public.slot_locks(center_id, slot_date, slot_time);
CREATE INDEX IF NOT EXISTS idx_slot_locks_expires_at ON public.slot_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_center_date ON public.blocked_dates(center_id, blocked_date);

-- Function to clean up expired slot locks
CREATE OR REPLACE FUNCTION public.cleanup_expired_slot_locks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.slot_locks WHERE expires_at < now();
END;
$$;

-- Function to check slot availability atomically
CREATE OR REPLACE FUNCTION public.check_slot_availability(
  p_center_id UUID,
  p_doctor_id UUID,
  p_slot_date DATE,
  p_slot_time TIME,
  p_exclude_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_blocked BOOLEAN;
  v_existing_booking BOOLEAN;
  v_existing_lock BOOLEAN;
  v_time_slot_exists BOOLEAN;
  v_day_of_week INTEGER;
BEGIN
  -- Check if date is blocked
  SELECT EXISTS (
    SELECT 1 FROM blocked_dates 
    WHERE center_id = p_center_id 
    AND blocked_date = p_slot_date
    AND (doctor_id IS NULL OR doctor_id = p_doctor_id)
  ) INTO v_is_blocked;
  
  IF v_is_blocked THEN
    RETURN FALSE;
  END IF;
  
  -- Check day of week
  v_day_of_week := EXTRACT(DOW FROM p_slot_date)::INTEGER;
  
  -- Check if time slot exists for this day
  SELECT EXISTS (
    SELECT 1 FROM time_slots 
    WHERE center_id = p_center_id 
    AND day_of_week = v_day_of_week
    AND is_active = true
    AND p_slot_time >= start_time 
    AND p_slot_time < end_time
    AND (doctor_id IS NULL OR doctor_id = p_doctor_id)
  ) INTO v_time_slot_exists;
  
  IF NOT v_time_slot_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check for existing confirmed bookings
  SELECT EXISTS (
    SELECT 1 FROM bookings 
    WHERE center_id = p_center_id 
    AND booking_date = p_slot_date 
    AND booking_time = p_slot_time
    AND status NOT IN ('cancelled', 'refunded')
    AND (p_doctor_id IS NULL OR doctor_id = p_doctor_id)
  ) INTO v_existing_booking;
  
  IF v_existing_booking THEN
    RETURN FALSE;
  END IF;
  
  -- Check for active slot locks (excluding current user if provided)
  SELECT EXISTS (
    SELECT 1 FROM slot_locks 
    WHERE center_id = p_center_id 
    AND slot_date = p_slot_date 
    AND slot_time = p_slot_time
    AND expires_at > now()
    AND (p_exclude_user_id IS NULL OR user_id != p_exclude_user_id)
    AND (p_doctor_id IS NULL OR doctor_id = p_doctor_id)
  ) INTO v_existing_lock;
  
  IF v_existing_lock THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to lock a slot atomically
CREATE OR REPLACE FUNCTION public.lock_slot(
  p_center_id UUID,
  p_doctor_id UUID,
  p_service_id UUID,
  p_user_id UUID,
  p_slot_date DATE,
  p_slot_time TIME
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lock_id UUID;
  v_is_available BOOLEAN;
BEGIN
  -- Clean up expired locks first
  PERFORM cleanup_expired_slot_locks();
  
  -- Delete any existing lock by this user for this slot
  DELETE FROM slot_locks 
  WHERE user_id = p_user_id 
  AND center_id = p_center_id 
  AND slot_date = p_slot_date 
  AND slot_time = p_slot_time;
  
  -- Check availability
  v_is_available := check_slot_availability(p_center_id, p_doctor_id, p_slot_date, p_slot_time, p_user_id);
  
  IF NOT v_is_available THEN
    RETURN NULL;
  END IF;
  
  -- Create the lock
  INSERT INTO slot_locks (center_id, doctor_id, service_id, user_id, slot_date, slot_time)
  VALUES (p_center_id, p_doctor_id, p_service_id, p_user_id, p_slot_date, p_slot_time)
  RETURNING id INTO v_lock_id;
  
  RETURN v_lock_id;
END;
$$;

-- Function to create booking atomically
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_user_id UUID,
  p_center_id UUID,
  p_service_id UUID,
  p_doctor_id UUID,
  p_booking_date DATE,
  p_booking_time TIME,
  p_notes TEXT DEFAULT NULL,
  p_total_amount NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
  v_is_available BOOLEAN;
BEGIN
  -- Clean up expired locks
  PERFORM cleanup_expired_slot_locks();
  
  -- Check availability (excluding this user's lock)
  v_is_available := check_slot_availability(p_center_id, p_doctor_id, p_booking_date, p_booking_time, p_user_id);
  
  IF NOT v_is_available THEN
    RAISE EXCEPTION 'Slot is no longer available';
  END IF;
  
  -- Create the booking
  INSERT INTO bookings (
    user_id, center_id, service_id, doctor_id, 
    booking_date, booking_time, notes, total_amount, status
  )
  VALUES (
    p_user_id, p_center_id, p_service_id, p_doctor_id,
    p_booking_date, p_booking_time, p_notes, p_total_amount, 'pending'
  )
  RETURNING id INTO v_booking_id;
  
  -- Remove the user's slot lock if it exists
  DELETE FROM slot_locks 
  WHERE user_id = p_user_id 
  AND center_id = p_center_id 
  AND slot_date = p_booking_date 
  AND slot_time = p_booking_time;
  
  -- Update center's total bookings
  UPDATE centers 
  SET total_bookings = COALESCE(total_bookings, 0) + 1 
  WHERE id = p_center_id;
  
  RETURN v_booking_id;
END;
$$;