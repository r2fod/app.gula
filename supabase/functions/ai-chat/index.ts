import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  context?: {
    eventId?: string;
    eventData?: any;
    userId?: string;
    currentPage?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, context }: ChatRequest = await req.json();

    // Construir el prompt del sistema con contexto
    const systemPrompt = `Eres un asistente especializado en planificación de eventos para la aplicación Gula.

Tu objetivo es ayudar a los usuarios a planificar eventos de forma eficiente y proactiva.

Capacidades:
1. Generar listas de bebidas apropiadas según el tipo de evento y número de invitados
2. Crear menús típicos para diferentes tipos de eventos (bodas, comuniones, etc.)
3. Calcular personal necesario basado en el número de invitados
4. Sugerir distribución de mesas
5. Analizar archivos subidos y extraer información relevante

${context?.eventData ? `
Contexto del evento actual:
- Tipo: ${context.eventData.event_type}
- Invitados: ${context.eventData.total_guests || 0} (${context.eventData.adults || 0} adultos, ${context.eventData.children || 0} niños)
- Lugar: ${context.eventData.venue}
- Fecha: ${context.eventData.event_date}
` : ''}

Cuando el usuario te pida generar algo, responde con:
1. Un mensaje amigable confirmando la acción
2. Un array de acciones a ejecutar en formato JSON

Formato de respuesta OBLIGATORIO (JSON válido):
{
  "message": "Mensaje amigable para el usuario",
  "actions": [
    {
      "type": "create_beverages" | "create_menu" | "calculate_staff" | "suggest_tables",
      "data": { ... datos estructurados ... }
    }
  ],
  "needsConfirmation": true
}

IMPORTANTE: Tu respuesta DEBE ser JSON válido. No incluyas texto adicional fuera del JSON.`;

    const userPrompt = message;

    // Llamar a OpenAI (o cualquier LLM)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);

    // Guardar la interacción en la base de datos
    if (context?.userId && context?.eventId) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      );

      await supabaseClient.from('ai_interactions').insert({
        user_id: context.userId,
        event_id: context.eventId,
        message: message,
        response: aiResponse.message,
        actions: aiResponse.actions || [],
      });
    }

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({
        message: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
