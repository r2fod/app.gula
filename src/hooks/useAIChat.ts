import { useState, useCallback } from 'react';
import { useAI } from '@/contexts/AIContext';
import { supabase } from '@/integrations/supabase/client';

export interface AIResponse {
  message: string;
  actions?: any[];
  needsConfirmation?: boolean;
}

export const useAIChat = (eventId?: string) => {
  const { addMessage, setCurrentEventId, isProcessing } = useAI();
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (message: string): Promise<AIResponse | null> => {
    if (!message.trim()) return null;

    setLoading(true);
    addMessage('user', message);

    try {
      // Obtener contexto actual
      const { data: { user } } = await supabase.auth.getUser();

      let eventContext = null;
      if (eventId) {
        const { data: event } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
        eventContext = event;
      }

      // Llamar a la Edge Function de IA
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          context: {
            eventId,
            eventData: eventContext,
            userId: user?.id,
            currentPage: window.location.pathname,
          },
        },
      });

      if (error) throw error;

      const response: AIResponse = data;
      addMessage('assistant', response.message, response.actions);

      return response;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      addMessage('assistant', 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [eventId, addMessage]);

  const uploadAndAnalyzeFile = useCallback(async (file: File): Promise<any> => {
    setLoading(true);
    addMessage('user', `Analizando archivo: ${file.name}`);

    try {
      // Subir archivo a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `ai-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('event-files')
        .getPublicUrl(filePath);

      // Llamar a la Edge Function de análisis
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
      console.error('Error analyzing file:', error);
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
