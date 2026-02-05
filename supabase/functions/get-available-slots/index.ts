 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const url = new URL(req.url);
     const center_id = url.searchParams.get('center_id');
     const date = url.searchParams.get('date');
     const doctor_id = url.searchParams.get('doctor_id');
     const service_id = url.searchParams.get('service_id');
 
     if (!center_id || !date) {
       return new Response(
         JSON.stringify({ error: 'Missing required parameters: center_id, date' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
     const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     console.log(`Fetching available slots for center ${center_id} on ${date}`);
 
     // Get the day of week (0 = Sunday, 1 = Monday, etc.)
     const dateObj = new Date(date);
     const dayOfWeek = dateObj.getDay();
 
     // Check if date is blocked
     const { data: blockedDate } = await supabase
       .from('blocked_dates')
       .select('id')
       .eq('center_id', center_id)
       .eq('blocked_date', date)
       .maybeSingle();
 
     if (blockedDate) {
       return new Response(
         JSON.stringify({ 
           available_slots: [],
           is_blocked: true,
           message: 'This date is blocked'
         }),
         { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Get time slots for this day
     let slotsQuery = supabase
       .from('time_slots')
       .select('*')
       .eq('center_id', center_id)
       .eq('day_of_week', dayOfWeek)
       .eq('is_active', true);
 
     if (doctor_id) {
       slotsQuery = slotsQuery.or(`doctor_id.is.null,doctor_id.eq.${doctor_id}`);
     }
 
     const { data: timeSlots, error: slotsError } = await slotsQuery;
 
     if (slotsError) {
       console.error('Error fetching time slots:', slotsError);
       return new Response(
         JSON.stringify({ error: 'Failed to fetch time slots' }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     if (!timeSlots || timeSlots.length === 0) {
       return new Response(
         JSON.stringify({ 
           available_slots: [],
           is_blocked: false,
           message: 'No slots available for this day'
         }),
         { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Get existing bookings for this date
     let bookingsQuery = supabase
       .from('bookings')
       .select('booking_time, doctor_id')
       .eq('center_id', center_id)
       .eq('booking_date', date)
       .not('status', 'in', '("cancelled","refunded")');
 
     if (doctor_id) {
       bookingsQuery = bookingsQuery.eq('doctor_id', doctor_id);
     }
 
     const { data: existingBookings } = await bookingsQuery;
 
     // Get existing slot locks
     let locksQuery = supabase
       .from('slot_locks')
       .select('slot_time, doctor_id')
       .eq('center_id', center_id)
       .eq('slot_date', date)
       .gt('expires_at', new Date().toISOString());
 
     if (doctor_id) {
       locksQuery = locksQuery.eq('doctor_id', doctor_id);
     }
 
     const { data: activeLocks } = await locksQuery;
 
     // Generate available slots
     const availableSlots: { time: string; available: boolean }[] = [];
     const now = new Date();
     const today = now.toISOString().split('T')[0];
 
     for (const slot of timeSlots) {
       // Generate 30-minute intervals within the slot
       const startParts = slot.start_time.split(':');
       const endParts = slot.end_time.split(':');
       let currentHour = parseInt(startParts[0]);
       let currentMin = parseInt(startParts[1]);
       const endHour = parseInt(endParts[0]);
       const endMin = parseInt(endParts[1]);
 
       while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
         const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}:00`;
         
         // Check if this time is in the past
         if (date === today) {
           const slotDateTime = new Date(`${date}T${timeStr}`);
           if (slotDateTime <= now) {
             currentMin += 30;
             if (currentMin >= 60) {
               currentHour += 1;
               currentMin -= 60;
             }
             continue;
           }
         }
 
         // Check if slot is booked
         const isBooked = existingBookings?.some(b => b.booking_time === timeStr);
         const isLocked = activeLocks?.some(l => l.slot_time === timeStr);
 
         availableSlots.push({
           time: timeStr.slice(0, 5),
           available: !isBooked && !isLocked,
         });
 
         currentMin += 30;
         if (currentMin >= 60) {
           currentHour += 1;
           currentMin -= 60;
         }
       }
     }
 
     return new Response(
       JSON.stringify({ 
         available_slots: availableSlots,
         is_blocked: false,
         date,
         center_id
       }),
       { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
 
   } catch (error: unknown) {
     console.error('Unexpected error:', error);
     const message = error instanceof Error ? error.message : 'Internal server error';
     return new Response(
       JSON.stringify({ error: message }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });