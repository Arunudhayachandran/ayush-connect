 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 interface CreateBookingRequest {
   center_id: string;
   service_id: string;
   doctor_id?: string;
   booking_date: string;
   booking_time: string;
   notes?: string;
 }
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     // Get auth token
     const authHeader = req.headers.get('Authorization');
     if (!authHeader) {
       return new Response(
         JSON.stringify({ error: 'Missing authorization header' }),
         { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Initialize Supabase client
     const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
     const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     // Verify user
     const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
       global: { headers: { Authorization: authHeader } }
     });
     const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
     
     if (authError || !user) {
       console.error('Auth error:', authError);
       return new Response(
         JSON.stringify({ error: 'Unauthorized' }),
         { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Parse request body
     const body: CreateBookingRequest = await req.json();
     const { center_id, service_id, doctor_id, booking_date, booking_time, notes } = body;
 
     // Validate required fields
     if (!center_id || !service_id || !booking_date || !booking_time) {
       return new Response(
         JSON.stringify({ error: 'Missing required fields: center_id, service_id, booking_date, booking_time' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log(`Creating booking for user ${user.id} at center ${center_id}`);
 
     // Get service price
     const { data: service, error: serviceError } = await supabase
       .from('services')
       .select('price, is_available')
       .eq('id', service_id)
       .single();
 
     if (serviceError || !service) {
       console.error('Service not found:', serviceError);
       return new Response(
         JSON.stringify({ error: 'Service not found' }),
         { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     if (!service.is_available) {
       return new Response(
         JSON.stringify({ error: 'Service is not available' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Call the atomic booking function
     const { data: bookingId, error: bookingError } = await supabase.rpc('create_booking_atomic', {
       p_user_id: user.id,
       p_center_id: center_id,
       p_service_id: service_id,
       p_doctor_id: doctor_id || null,
       p_booking_date: booking_date,
       p_booking_time: booking_time,
       p_notes: notes || null,
       p_total_amount: service.price,
     });
 
     if (bookingError) {
       console.error('Booking error:', bookingError);
       return new Response(
         JSON.stringify({ error: bookingError.message || 'Failed to create booking' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log(`Booking created successfully: ${bookingId}`);
 
     // Fetch the created booking
     const { data: booking, error: fetchError } = await supabase
       .from('bookings')
       .select(`
         *,
         center:centers(name, address, phone),
         service:services(name, duration_minutes),
         doctor:doctors(name)
       `)
       .eq('id', bookingId)
       .single();
 
     if (fetchError) {
       console.error('Error fetching booking:', fetchError);
     }
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         booking_id: bookingId,
         booking: booking || null,
         message: 'Booking created successfully'
       }),
       { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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