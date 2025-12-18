import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileAnalysisRequest {
  fileUrl: string;
  fileName: string;
  fileType: string;
  eventId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName, fileType, eventId }: FileAnalysisRequest = await req.json();

    // Descargar el archivo
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file');
    }

    let extractedText = '';

    // Extraer texto según el tipo de archivo
    if (fileType === 'pdf') {
      // Para PDFs, usaríamos una librería de OCR o API
      // Por ahora, simulamos la extracción
      const arrayBuffer = await fileResponse.arrayBuffer();
      // TODO: Implementar extracción real de PDF con pdf-parse o similar
      extractedText = 'Texto extraído del PDF...';
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      // Para Excel, usaríamos una librería como xlsx
      const arrayBuffer = await fileResponse.arrayBuffer();
      // TODO: Implementar lectura de Excel
      extractedText = 'Datos extraídos de Excel...';
    } else if (['jpg', 'jpeg', 'png'].includes(fileType)) {
      // Para imágenes, usaríamos OCR (Google Vision API, Tesseract, etc.)
      // TODO: Implementar OCR
      extractedText = 'Texto extraído de la imagen...';
    } else {
      // Para archivos de texto plano
      extractedText = await fileResponse.text();
    }

    // Analizar el texto con IA
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const systemPrompt = `Analiza el siguiente documento y extrae información estructurada para un evento.

Busca y extrae:
1. Bebidas (nombre, categoría, cantidad, precio si está disponible)
2. Platos del menú (categoría: cocktail, primer_plato, segundo_plato, postre, etc.)
3. Personal (rol, cantidad, horarios)
4. Número de invitados (adultos, niños)
5. Fecha y lugar del evento
6. Cualquier otra información relevante

Retorna JSON estructurado siguiendo este schema:
{
  "beverages": [
    {
      "category": "aperitivo" | "copas" | "refrescos",
      "item_name": string,
      "quantity": number,
      "unit_price": number (opcional),
      "notes": string (opcional)
    }
  ],
  "menuItems": [
    {
      "category": "cocktail" | "primer_plato" | "segundo_plato" | "postre" | "sorbete" | "resopon" | "infantil",
      "name": string,
      "description": string (opcional)
    }
  ],
  "staff": [
    {
      "role": string,
      "staff_count": number,
      "arrival_time": string (HH:MM),
      "departure_time": string (HH:MM)
    }
  ],
  "eventInfo": {
    "adults": number,
    "children": number,
    "venue": string,
    "event_date": string (YYYY-MM-DD)
  },
  "itemsFound": number,
  "confidence": number (0-1)
}

Si no encuentras información para alguna categoría, omítela del JSON.`;

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
          { role: 'user', content: `Documento: ${fileName}\n\nContenido:\n${extractedText}` },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisResult = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({
      extractedData: analysisResult,
      itemsFound: analysisResult.itemsFound || 0,
      confidence: analysisResult.confidence || 0.8,
      fileName,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-file-analyzer function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        extractedData: {},
        itemsFound: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
