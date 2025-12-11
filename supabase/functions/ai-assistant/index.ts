import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase config missing');

    const { messages, userId, action, eventId } = await req.json();
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Obtener contexto de la base de datos
    let context = "";

    // Obtener eventos del usuario
    const { data: events } = await supabase
      .from('events')
      .select(`
        *,
        event_timings(*),
        event_staff(*),
        beverages(*),
        corners(*),
        tables(*),
        menu_items(*),
        allergies(*),
        supplies(*),
        rentals(*)
      `)
      .eq('user_id', userId)
      .order('event_date', { ascending: false })
      .limit(20);

    if (events && events.length > 0) {
      context += `\n\n=== EVENTOS DEL USUARIO ===\n`;
      events.forEach((event: any) => {
        context += `\n--- Evento: ${event.venue} (${event.event_type}) ---\n`;
        context += `Fecha: ${event.event_date}\n`;
        context += `Total invitados: ${event.total_guests} (Adultos: ${event.adults}, Niños: ${event.children})\n`;
        context += `Canapés por persona: ${event.canapes_per_person}\n`;
        
        if (event.event_timings?.length > 0) {
          const t = event.event_timings[0];
          context += `Horarios: Llegada ${t.guest_arrival}, Ceremonia ${t.ceremony}, Cocktail ${t.cocktail_start}, Banquete ${t.banquet_start}\n`;
        }
        
        if (event.beverages?.length > 0) {
          context += `Bebidas: ${event.beverages.map((b: any) => `${b.item_name}(${b.quantity}ud)`).join(', ')}\n`;
        }
        
        if (event.event_staff?.length > 0) {
          context += `Personal: ${event.event_staff.map((s: any) => `${s.role}(${s.staff_count})`).join(', ')}\n`;
        }

        if (event.menu_items?.length > 0) {
          context += `Menú: ${event.menu_items.map((m: any) => m.name).join(', ')}\n`;
        }

        if (event.corners?.length > 0) {
          const activeCorners = event.corners.filter((c: any) => c.is_enabled);
          if (activeCorners.length > 0) {
            context += `Corners activos: ${activeCorners.map((c: any) => `${c.corner_type}(${c.pax_count || 'todos'} pax)`).join(', ')}\n`;
          }
        }

        if (event.allergies?.length > 0) {
          context += `Alergias: ${event.allergies.map((a: any) => `${a.guest_name}: ${a.allergy}`).join('; ')}\n`;
        }
      });
    }

    // Obtener menús disponibles
    const { data: menus } = await supabase
      .from('menus')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (menus && menus.length > 0) {
      context += `\n\n=== MENÚS DISPONIBLES ===\n`;
      menus.forEach((menu: any) => {
        context += `- ${menu.name} (${menu.menu_type}): ${menu.description || 'Sin descripción'}\n`;
        if (menu.items && menu.items.length > 0) {
          context += `  Platos: ${menu.items.map((i: any) => i.name).join(', ')}\n`;
        }
      });
    }

    // Ratios de bebidas estándar de Gula Catering (por PAX para 100 invitados)
    const beverageRatios = `
=== RATIOS ESTÁNDAR BEBIDAS GULA CATERING (por cada 100 PAX) ===
APERITIVO/COMIDA:
- Nebla Verdejo: 40 botellas (5.22€/ud)
- Raiza Rioja Tinto: 29 botellas (4.33€/ud)
- Botella Cava: 13 botellas (3.59€/ud)
- Agua Solán 1.5L: 100 botellas (0.65€/ud)
- Botellín cerveza: 350 ud (0.49€/ud)
- Coca-Cola: 25 latas (0.569€/ud)
- Cerveza 0,0: 15 ud (0.89€/ud)
- Vermut Izaguirre: 10 botellas (6.30€/ud)

BARRA COPAS:
- Ginebra Tanqueray: 8 botellas (12.18€/ud)
- Ginebra Seagrams: 8 botellas (13.05€/ud)
- Ron Barceló: 6 botellas (12€/ud)
- Ron Brugal: 6 botellas (11.15€/ud)
- Ballentines: 7 botellas (11.20€/ud)
- Tónica: 33 ud (2.01€/ud)

REFRESCOS BARRA:
- Coca-Cola: 120 latas (0.569€/ud)
- Coca-Cola Zero: 100 latas (0.5629€/ud)
- Fanta: 150 latas naranja+limón (0.528€/ud)
- Hielo: 67 bolsas (0.763€/ud)
`;

    context += beverageRatios;

    const systemPrompt = `Eres el asistente de IA de Gula Catering, una empresa de catering de Valencia especializada en bodas y eventos. Tu trabajo es ayudar con:

1. **Consultas sobre eventos**: Responder preguntas sobre eventos específicos, invitados, menús, bebidas, horarios, etc.
2. **Sugerencias de cantidades**: Calcular cantidades de bebidas, material y personal según el número de PAX y tipo de evento.
3. **Búsqueda de eventos similares**: Encontrar eventos pasados con características similares.
4. **Informes y resúmenes**: Generar resúmenes de costes, comparativas entre eventos.
5. **Análisis de rendimiento**: Analizar eventos para identificar mejoras, eficiencias y áreas de optimización.

Datos importantes:
- Los precios de bebidas son SIN IVA
- Para calcular cantidades, usa los ratios estándar y ajusta según el tipo de evento
- Las bodas suelen requerir más bebida que otros eventos
- Eventos con "cerveceros" pueden necesitar +40% de cerveza extra
- Para eventos de verano, aumentar agua y refrescos un 20%

${context}

Responde siempre en español, de forma profesional pero cercana. Si no tienes información suficiente, pregunta para poder ayudar mejor.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de peticiones excedido. Espera un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Contacta con soporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
