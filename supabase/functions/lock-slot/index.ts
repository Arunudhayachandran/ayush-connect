 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 interface LockSlotRequest {
   center_id: string;
   service_id: string;
   doctor_id?: string;
   slot_date: string;
   slot_time: string;
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
 
     const body: LockSlotRequest = await req.json();
     const { center_id, service_id, doctor_id, slot_date, slot_time } = body;
 
     if (!center_id || !service_id || !slot_date || !slot_time) {
       return new Response(
         JSON.stringify({ error: 'Missing required fields' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log(`Locking slot for user ${user.id}: ${slot_date} ${slot_time}`);
 
     // Call the lock_slot function
     const { data: lockId, error: lockError } = await supabase.rpc('lock_slot', {
       p_center_id: center_id,
       p_doctor_id: doctor_id || null,
       p_service_id: service_id,
       p_user_id: user.id,
       p_slot_date: slot_date,
       p_slot_time: slot_time,
     });
 
     if (lockError) {
       console.error('Lock error:', lockError);
       return new Response(
         JSON.stringify({ error: lockError.message }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     if (!lockId) {
       return new Response(
         JSON.stringify({ 
           success: false, 
           error: 'Slot is not available',
           available: false 
         }),
         { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log(`Slot locked: ${lockId}`);
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         lock_id: lockId,
         expires_in_minutes: 10,
         message: 'Slot locked for 10 minutes'
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