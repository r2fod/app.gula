import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message?: string; // Para mensajes simples
  messages?: any[]; // Para historial completo (asistente)
  context?: {
    eventId?: string;
    userId?: string;
    currentPage?: string;
  };
  stream?: boolean; // Si queremos respuesta fluida
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, messages, context, stream = false }: ChatRequest = await req.json();

    const userId = context?.userId;
    const eventId = context?.eventId;

    // --- RECOPILACIÓN DE CONTEXTO PROFUNDO ---
    let dbContext = "";

    // 1. Datos del evento actual (si existe)
    if (eventId) {
      const { data: event } = await supabase
        .from('events')
        .select(`*, event_timings(*), event_staff(*), beverages(*), menu_items(*)`)
        .eq('id', eventId)
        .single();

      if (event) {
        dbContext += `\nEVENTO ACTUAL (${event.venue}):\n- Tipo: ${event.event_type}\n- PAX: ${event.total_guests}\n- Fecha: ${event.event_date}\n`;
        if (event.menu_items?.length) dbContext += `- Menú actual: ${event.menu_items.map((m: any) => m.name).join(', ')}\n`;
      }
    }

    // 2. Resumen de Escandallos (Recetas)
    const { data: recipes } = await supabase.from('recipes').select('name, category, base_cost, margin_percent').limit(20);
    if (recipes?.length) {
      dbContext += `\nRECETAS/ESCANDALLOS DISPONIBLES:\n${recipes.map(r => `- ${r.name} (${r.category}): Coste ${r.base_cost}€, Margen ${r.margin_percent}%`).join('\n')}\n`;
    }

    // 3. Ratios de Bebida Estándar
    dbContext += `\nRATIOS GULA (por 100 PAX): Verdejo(40 bot), Rioja(29 bot), Cerveza(350 ud), Agua(100 bot).\n`;

    // --- CONFIGURACIÓN DEL PROMPT ---
    const systemPrompt = `Eres el "Cerebro" de Gula Catering. Eres un experto en planificación de eventos y escandallos.
    
    INFORMACIÓN DE NAVEGACIÓN:
    - El usuario está actualmente en la página: ${context?.currentPage ?? 'Desconocida'}
    
    CAPACIDADES DE AUDITORÍA:
    - Si el usuario pregunta por "rendimiento", "análisis" o "auditoría", analiza los costes cruzados.
    - Identifica desviaciones: Food Cost > 30%, Staff > 25% o margen bruto < 20%.
    - Sugiere acciones de compensación: "En el próximo evento de este tipo, reduce el staff en 2 personas para compensar la pérdida de este".

    TAREAS:
    - Responder dudas sobre eventos y recetas relativas a la página donde está el usuario.
    - Sugerir cantidades basadas en los RATIOS GULA.
    - Proporcionar auditoría financiera proactiva de eventos.
    - Generar acciones estructuradas si el usuario pide "crear", "añadir" o "calcular".

    CONTEXTO DE LA BASE DE DATOS:
    ${dbContext}

    REGLAS DE RESPUESTA:
    1. Si stream=false: Responde SIEMPRE en JSON válido con este formato:
       { "message": "Texto amigable explicando qué vas a hacer", 
         "actions": [{ "type": "update_event_field|add_recipe_item|set_menu_data", "data": {...} }] }
    2. Si el usuario dice "pon x piezas", "cambia el pax", o "añade 2 camareros", incluye la acción correspondiente en el JSON.
    3. Si stream=true: Responde de forma natural. Si detectas una acción necesaria, menciona que el usuario puede pedir un resumen para "aplicar los cambios".
    4. Idioma: Español. Profesionial pero cercano.`;

    const chatMessages = messages || [{ role: 'user', content: message }];

    // --- SELECCIÓN DE MODELO Y LLAMADA ---
    // Preferencia: Lovable (Gemini) para streaming, OpenAI para JSON.
    // Fallback: Si falta una clave, usar la otra si está disponible.

    const canUseLovable = !!lovableApiKey;
    const canUseOpenAI = !!openaiApiKey;

    if (!canUseLovable && !canUseOpenAI) {
      throw new Error('No hay ninguna clave de IA configurada (OPENAI_API_KEY o LOVABLE_API_KEY)');
    }

    // Caso 1: Streaming solicitado
    if (stream) {
      const useLovable = canUseLovable; // Siempre preferir Lovable para stream si está disponible

      if (useLovable) {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash",
            messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
            stream: true,
          }),
        });
        return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      } else {
        // Fallback a OpenAI para stream
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
            stream: true,
          }),
        });
        return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }
    }

    // Caso 2: JSON solicitado (stream=false)
    else {
      const useOpenAI = canUseOpenAI; // Preferir OpenAI para JSON
      const endpoint = useOpenAI ? 'https://api.openai.com/v1/chat/completions' : 'https://ai.gateway.lovable.dev/v1/chat/completions';
      const key = useOpenAI ? openaiApiKey : lovableApiKey;
      const model = useOpenAI ? 'gpt-4o' : 'google/gemini-2.0-flash';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(`Error de IA: ${data.error.message || JSON.stringify(data.error)}`);

      const content = data.choices[0].message.content;
      return new Response(content, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error('Error en Master Brain:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
