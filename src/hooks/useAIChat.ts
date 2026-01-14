import { useState, useCallback } from 'react';
import { useAI } from '@/contexts/AIContext';
import { supabase } from '@/integrations/supabase/client';

export interface AIResponse {
  message: string;
  actions?: any[];
  needsConfirmation?: boolean;
}

/**
 * Hook maestro para la comunicación con el "Cerebro" de Gula.
 * Ahora centraliza todas las llamadas a la función unificada ai-chat.
 */
export const useAIChat = (eventId?: string) => {
  const { addMessage, isProcessing } = useAI();
  const [loading, setLoading] = useState(false);

  /**
   * Envía un mensaje a la IA y permite el manejo de streaming opcionalmente.
   * Delega la construcción del contexto al backend para mayor eficiencia.
   */
  const sendMessage = useCallback(async (
    message: string,
    options: { stream?: boolean, onStreamUpdate?: (text: string) => void, executeActions?: boolean } = {}
  ): Promise<AIResponse | null> => {
    if (!message.trim()) return null;

    setLoading(true);
    addMessage('user', message);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      // Detectar si el usuario quiere ejecutar acciones
      const wantsAction = /^(sí|si|yes|ok|dale|hazlo|aplica|ejecuta|confirma)/i.test(message.trim());
      const shouldExecute = options.executeActions || wantsAction;

      // Si es streaming, realizamos una llamada fetch directa (React Query / invoke no soportan streams bien)
      if (options.stream) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message,
            context: { eventId, userId: user?.id, currentPage: window.location.pathname },
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error en la conexión con la IA (${response.status})`);
        }
        if (!response.body) throw new Error("Cuerpo de respuesta vacío");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        // Notificamos al sistema que hay un mensaje del asistente en camino (vacío inicial)
        addMessage('assistant', "");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // El stream puede venir en formato server-sent events o texto plano según Lovable Gateway
          // Simplificamos omitiendo el parseo complejo para el MVP si el gateway lo permite
          fullText += chunk;

          if (options.onStreamUpdate) options.onStreamUpdate(fullText);
        }

        return { message: fullText };
      }

      // Si no es streaming (acciones JSON), usamos invoke normal
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          context: { eventId, userId: user?.id, currentPage: window.location.pathname, wantsAction: shouldExecute },
          stream: false,
        },
      });

      if (error) throw error;

      const response: AIResponse = data;
      addMessage('assistant', response.message, response.actions);

      return response;
    } catch (error) {
      console.error('Error al enviar mensaje a la IA:', error);
      addMessage('assistant', 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [eventId, addMessage]);

  /**
   * Analiza un archivo usando la función especializada (manteniéndola por su complejidad específica).
   */
  const uploadAndAnalyzeFile = useCallback(async (file: File): Promise<any> => {
    setLoading(true);
    addMessage('user', `Analizando archivo: ${file.name}`);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `ai-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-files')
        .getPublicUrl(filePath);

      const { data, error } = await supabase.functions.invoke('ai-file-analyzer', {
        body: {
          fileUrl: publicUrl,
          fileName: file.name,
          fileType: fileExt,
          eventId,
        },
      });

      if (error) throw error;

      addMessage('assistant', `He analizado el archivo "${file.name}". Encontré ${data.itemsFound || 0} elementos.`, [
        {
          type: 'analyze_file',
          data: data.extractedData,
          status: 'pending',
          needsConfirmation: true,
        },
      ]);

      return data;
    } catch (error) {
      console.error('Error al analizar archivo:', error);
      addMessage('assistant', 'Lo siento, hubo un error al analizar el archivo.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [eventId, addMessage]);

  return {
    sendMessage,
    uploadAndAnalyzeFile,
    loading: loading || isProcessing,
  };
};
