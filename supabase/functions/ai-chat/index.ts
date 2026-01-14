import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message?: string;
  messages?: any[];
  context?: {
    eventId?: string;
    userId?: string;
    currentPage?: string;
  };
  stream?: boolean;
}

// --- FUNCIONES DE APRENDIZAJE ---
async function getLearnedKnowledge(supabase: any, userId: string) {
  const { data } = await supabase
    .from('ai_knowledge')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('confidence_score', { ascending: false })
    .limit(10);

  return data || [];
}

async function getEventPatterns(supabase: any, eventType?: string) {
  let query = supabase
    .from('ai_event_patterns')
    .select('*')
    .eq('is_active', true)
    .order('success_count', { ascending: false })
    .limit(5);

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  const { data } = await query;
  return data || [];
}

async function saveInteraction(
  supabase: any,
  userId: string,
  eventId: string | undefined,
  userMessage: string,
  aiResponse: string,
  contextData: any,
  startTime: number
) {
  const responseTime = Date.now() - startTime;

  await supabase.from('ai_interactions').insert({
    user_id: userId,
    event_id: eventId,
    user_message: userMessage,
    ai_response: aiResponse,
    context_data: contextData,
    response_time_ms: responseTime,
  });
}

async function learnFromSuccessfulPattern(
  supabase: any,
  userId: string,
  eventId: string,
  patternType: string,
  patternData: any
) {
  const { data: event } = await supabase
    .from('events')
    .select('event_type, total_guests, total_cost, profit_margin')
    .eq('id', eventId)
    .single();

  if (!event) return;

  // Guardar patrón exitoso
  await supabase.from('ai_event_patterns').upsert({
    user_id: userId,
    event_type: event.event_type,
    pattern_type: patternType,
    pattern_data: patternData,
    success_count: 1,
    avg_profit_margin: event.profit_margin || 0,
  }, {
    onConflict: 'user_id,event_type,pattern_type',
    ignoreDuplicates: false,
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, messages, context, stream = false }: ChatRequest = await req.json();

    const userId = context?.userId;
    const eventId = context?.eventId;

    if (!userId) {
      throw new Error('userId es requerido para el sistema de aprendizaje');
    }

    // --- APRENDIZAJE: Consultar conocimiento previo ---
    const learnedKnowledge = await getLearnedKnowledge(supabase, userId);
    let knowledgeContext = "";

    if (learnedKnowledge.length > 0) {
      knowledgeContext = "\n🧠 CONOCIMIENTO APRENDIDO DE TUS INTERACCIONES:\n";
      learnedKnowledge.forEach((k: any) => {
        knowledgeContext += `- ${k.knowledge_type}: ${k.knowledge_data.summary || JSON.stringify(k.knowledge_data)} (Confianza: ${Math.round(k.confidence_score * 100)}%)\n`;
      });
    }

    // --- RECOPILACIÓN DE CONTEXTO PROFUNDO ---
    let dbContext = "";

    // 1. Datos del evento actual
    if (eventId) {
      const { data: event } = await supabase
        .from('events')
        .select(`*, event_timings(*), event_staff(*), beverages(*), menu_items(*)`)
        .eq('id', eventId)
        .single();

      if (event) {
        dbContext += `\nEVENTO ACTUAL (${event.venue}):\n- Tipo: ${event.event_type}\n- PAX: ${event.total_guests}\n- Fecha: ${event.event_date}\n`;
        if (event.menu_items?.length) dbContext += `- Menú actual: ${event.menu_items.map((m: any) => m.name).join(', ')}\n`;

        // Consultar patrones exitosos para este tipo de evento
        const patterns = await getEventPatterns(supabase, event.event_type);
        if (patterns.length > 0) {
          dbContext += `\n📊 PATRONES EXITOSOS PARA ${event.event_type.toUpperCase()}:\n`;
          patterns.forEach((p: any) => {
            dbContext += `- ${p.pattern_type}: ${JSON.stringify(p.pattern_data)} (${p.success_count} veces exitoso, margen promedio: ${p.avg_profit_margin}%)\n`;
          });
        }
      }
    }

    // 2. Resumen de Escandallos
    const { data: recipes } = await supabase.from('recipes').select('name, category, base_cost, margin_percent').limit(20);
    if (recipes?.length) {
      dbContext += `\nRECETAS/ESCANDALLOS DISPONIBLES:\n${recipes.map(r => `- ${r.name} (${r.category}): Coste ${r.base_cost}€, Margen ${r.margin_percent}%`).join('\n')}\n`;
    }

    // 3. Ratios de Bebida Estándar
    dbContext += `\nRATIOS GULA (por 100 PAX): Verdejo(40 bot), Rioja(29 bot), Cerveza(350 ud), Agua(100 bot).\n`;

    // --- CONFIGURACIÓN DEL PROMPT CON APRENDIZAJE ---
    const systemPrompt = `Eres el "Cerebro" de Gula Catering con MEMORIA Y APRENDIZAJE CONTINUO. Eres un experto en planificación de eventos y escandallos.

    INFORMACIÓN DE NAVEGACIÓN:
    - El usuario está actualmente en la página: ${context?.currentPage ?? 'Desconocida'}

    CAPACIDADES:
    - Responder dudas sobre eventos, recetas, ingredientes y planificación
    - Sugerir cantidades basadas en los RATIOS GULA
    - Analizar costes y proporcionar auditoría financiera
    - Crear, modificar y actualizar datos de eventos cuando el usuario lo solicite
    - Identificar desviaciones: Food Cost > 30%, Staff > 25% o margen bruto < 20%
    - 🧠 APRENDER de cada interacción y aplicar conocimiento previo
    - 📊 RECORDAR patrones exitosos y sugerirlos en contextos similares

    ${knowledgeContext}

    CONTEXTO DE LA BASE DE DATOS:
    ${dbContext}

    RATIOS GULA ESTÁNDAR (por 100 PAX):
    - Vino Verdejo: 40 botellas
    - Vino Rioja: 29 botellas
    - Cerveza: 350 unidades
    - Agua: 100 botellas
    - Refrescos: 80 latas
    - Bebidas por persona/hora: 1.5 (con margen de seguridad 15%)

    MODO DE RESPUESTA:
    ${stream ? `
    MODO CONVERSACIONAL (Stream activo):
    - Responde de forma NATURAL, AMIGABLE y CONVERSACIONAL en español
    - NO uses formato JSON, responde como un asistente humano
    - Si el usuario pide crear/modificar algo, explica qué harías y pregunta si quiere que lo ejecutes
    - Usa emojis ocasionalmente para ser más cercano (📊 💡 ✅ 🎯 🧠)
    - Sé conciso pero informativo
    - Si detectas que el usuario quiere una acción, di: "¿Quieres que lo aplique ahora? Dime 'sí' y lo haré"
    - Si tienes conocimiento previo relevante, menciónalo: "Recuerdo que en eventos similares..."
    ` : `
    MODO ACCIÓN (JSON):
    - Responde SIEMPRE en JSON válido con este formato exacto:
      {
        "message": "Texto amigable explicando qué vas a hacer",
        "actions": [
          {
            "type": "update_event_field|add_beverage|add_menu_item|add_staff|update_guests",
            "data": { campo: valor },
            "description": "Descripción de la acción"
          }
        ],
        "learned_pattern": {
          "type": "beverage_ratio|menu_composition|staff_distribution",
          "data": { ... },
          "confidence": 0.8
        }
      }
    - Si el usuario dice "pon", "cambia", "añade", "actualiza", incluye la acción correspondiente
    - Si detectas un patrón exitoso, inclúyelo en "learned_pattern" para aprendizaje futuro
    `}

    Idioma: Español profesional pero cercano.`;

    const chatMessages = messages || [{ role: 'user', content: message }];
    const userMessage = message || chatMessages[chatMessages.length - 1]?.content || '';

    // --- SELECCIÓN DE MODELO Y LLAMADA ---
    const canUseLovable = !!lovableApiKey;
    const canUseOpenAI = !!openaiApiKey;

    if (!canUseLovable && !canUseOpenAI) {
      throw new Error('No hay ninguna clave de IA configurada (OPENAI_API_KEY o LOVABLE_API_KEY)');
    }

    // Caso 1: Streaming solicitado
    if (stream) {
      const useLovable = canUseLovable;

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

        // Guardar interacción (sin esperar respuesta completa en stream)
        const aiResponsePreview = "Respuesta en streaming...";
        saveInteraction(supabase, userId, eventId, userMessage, aiResponsePreview, context, startTime);

        return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      } else {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
            stream: true,
          }),
        });

        const aiResponsePreview = "Respuesta en streaming...";
        saveInteraction(supabase, userId, eventId, userMessage, aiResponsePreview, context, startTime);

        return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }
    }

    // Caso 2: JSON solicitado (stream=false)
    else {
      const useOpenAI = canUseOpenAI;
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
      const parsedResponse = JSON.parse(content);

      // --- APRENDIZAJE: Guardar interacción ---
      await saveInteraction(supabase, userId, eventId, userMessage, content, context, startTime);

      // --- APRENDIZAJE: Si hay patrón aprendido, guardarlo ---
      if (parsedResponse.learned_pattern && eventId) {
        await learnFromSuccessfulPattern(
          supabase,
          userId,
          eventId,
          parsedResponse.learned_pattern.type,
          parsedResponse.learned_pattern.data
        );
      }

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
