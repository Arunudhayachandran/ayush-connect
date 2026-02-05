 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 interface CancelBookingRequest {
   booking_id: string;
   reason?: string;
 }
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const authHeader = req.headers.get('Authorization');
     if (!authHeader) {
       return new Response(
         JSON.stringify({ error: 'Missing authorization header' }),
         { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
     const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
       global: { headers: { Authorization: authHeader } }
     });
     const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
     
     if (authError || !user) {
       return new Response(
         JSON.stringify({ error: 'Unauthorized' }),
         { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const body: CancelBookingRequest = await req.json();
     const { booking_id, reason } = body;
 
     if (!booking_id) {
       return new Response(
         JSON.stringify({ error: 'Missing booking_id' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log(`Cancelling booking ${booking_id} for user ${user.id}`);
 
     // Get booking with center info
     const { data: booking, error: fetchError } = await supabase
       .from('bookings')
       .select(`
         *,
         center:centers(cancellation_hours, owner_id)
       `)
       .eq('id', booking_id)
       .single();
 
     if (fetchError || !booking) {
       return new Response(
         JSON.stringify({ error: 'Booking not found' }),
         { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Check if user owns the booking or is center owner
     const isOwner = booking.user_id === user.id;
     const isCenterOwner = booking.center?.owner_id === user.id;
 
     if (!isOwner && !isCenterOwner) {
       return new Response(
         JSON.stringify({ error: 'Not authorized to cancel this booking' }),
         { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Check if booking can be cancelled
     if (booking.status === 'cancelled' || booking.status === 'completed') {
       return new Response(
         JSON.stringify({ error: `Cannot cancel a ${booking.status} booking` }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Check cancellation policy for patients
     if (isOwner && !isCenterOwner) {
       const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
       const now = new Date();
       const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
       const cancellationHours = booking.center?.cancellation_hours || 24;
 
       if (hoursUntilBooking < cancellationHours) {
         console.log(`Cancellation too late: ${hoursUntilBooking} hours until booking, policy requires ${cancellationHours} hours`);
         return new Response(
           JSON.stringify({ 
             error: `Cancellation must be at least ${cancellationHours} hours before the appointment`,
             hours_until_booking: Math.round(hoursUntilBooking),
             cancellation_hours_required: cancellationHours
           }),
           { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       }
     }
 
     // Cancel the booking
     const { error: updateError } = await supabase
       .from('bookings')
       .update({
         status: 'cancelled',
         cancelled_at: new Date().toISOString(),
         cancellation_reason: reason || null,
       })
       .eq('id', booking_id);
 
     if (updateError) {
       console.error('Update error:', updateError);
       return new Response(
         JSON.stringify({ error: updateError.message }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log(`Booking ${booking_id} cancelled successfully`);
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         message: 'Booking cancelled successfully',
         booking_id
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