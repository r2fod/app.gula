import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    const registrationCode = Deno.env.get('REGISTRATION_CODE');

    console.log('Verifying registration code...');

    if (!registrationCode) {
      console.error('REGISTRATION_CODE not configured');
      return new Response(
        JSON.stringify({ valid: false, error: 'Código de registro no configurado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const isValid = code === registrationCode;
    console.log('Code verification result:', isValid);

    return new Response(
      JSON.stringify({ valid: isValid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error verifying registration code:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Error al verificar el código' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
