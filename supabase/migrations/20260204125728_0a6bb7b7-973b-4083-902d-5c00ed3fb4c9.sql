-- Create AYUSH service type enum
CREATE TYPE public.ayush_service_type AS ENUM (
  'ayurveda', 'yoga', 'naturopathy', 'unani', 'siddha', 'homeopathy'
);

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM (
  'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
);

-- Create app role enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'center', 'admin');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create centers table
CREATE TABLE public.centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'India',
  pincode TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  service_types ayush_service_type[] NOT NULL DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  opening_time TIME DEFAULT '09:00',
  closing_time TIME DEFAULT '18:00',
  working_days INTEGER[] DEFAULT '{1,2,3,4,5,6}',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  average_rating DECIMAL(2, 1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  specialization ayush_service_type NOT NULL,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  bio TEXT,
  photo_url TEXT,
  consultation_fee DECIMAL(10, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  service_type ayush_service_type NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create time slots table
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_bookings INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create blocked dates table
CREATE TABLE public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status booking_status DEFAULT 'pending' NOT NULL,
  notes TEXT,
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, center_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's own role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role during signup" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for centers (public read, owner write)
CREATE POLICY "Anyone can view active centers" ON public.centers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage their centers" ON public.centers
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all centers" ON public.centers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for doctors (public read)
CREATE POLICY "Anyone can view doctors" ON public.doctors
  FOR SELECT USING (true);

CREATE POLICY "Center owners can manage doctors" ON public.doctors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.centers WHERE id = center_id AND owner_id = auth.uid())
  );

-- RLS Policies for services (public read)
CREATE POLICY "Anyone can view services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Center owners can manage services" ON public.services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.centers WHERE id = center_id AND owner_id = auth.uid())
  );

-- RLS Policies for time_slots (public read)
CREATE POLICY "Anyone can view time slots" ON public.time_slots
  FOR SELECT USING (true);

CREATE POLICY "Center owners can manage time slots" ON public.time_slots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.centers WHERE id = center_id AND owner_id = auth.uid())
  );

-- RLS Policies for blocked_dates
CREATE POLICY "Anyone can view blocked dates" ON public.blocked_dates
  FOR SELECT USING (true);

CREATE POLICY "Center owners can manage blocked dates" ON public.blocked_dates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.centers WHERE id = center_id AND owner_id = auth.uid())
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Center owners can view their bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.centers WHERE id = center_id AND owner_id = auth.uid())
  );

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Center owners can update bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.centers WHERE id = center_id AND owner_id = auth.uid())
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_centers_updated_at BEFORE UPDATE ON public.centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update center ratings
CREATE OR REPLACE FUNCTION public.update_center_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.centers
  SET 
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE center_id = COALESCE(NEW.center_id, OLD.center_id)),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE center_id = COALESCE(NEW.center_id, OLD.center_id))
  WHERE id = COALESCE(NEW.center_id, OLD.center_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_center_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_center_rating();

-- Create indexes for better performance
CREATE INDEX idx_centers_location ON public.centers(location_lat, location_lng);
CREATE INDEX idx_centers_city ON public.centers(city);
CREATE INDEX idx_centers_service_types ON public.centers USING GIN(service_types);
CREATE INDEX idx_doctors_center ON public.doctors(center_id);
CREATE INDEX idx_services_center ON public.services(center_id);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_center ON public.bookings(center_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_reviews_center ON public.reviews(center_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);