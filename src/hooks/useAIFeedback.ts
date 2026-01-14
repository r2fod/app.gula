import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackData {
  interactionId: string;
  rating?: number;
  wasHelpful?: boolean;
  feedback?: string;
  executionSuccess?: boolean;
}

export function useAIFeedback() {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitFeedback = useCallback(async (data: FeedbackData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('ai_interactions' as any)
        .update({
          rating: data.rating,
          was_helpful: data.wasHelpful,
          feedback: data.feedback,
          execution_success: data.executionSuccess,
        })
        .eq('id', data.interactionId);

      if (error) throw error;

      // Si la interacción fue exitosa, aprender del patrón
      if (data.executionSuccess && data.wasHelpful) {
        await learnFromSuccess(data.interactionId);
      }

      toast({
        title: "¡Gracias por tu feedback!",
        description: "Esto me ayuda a mejorar mis respuestas 🧠",
      });
    } catch (error) {
      console.error('Error al enviar feedback:', error);
      toast({
        title: "Error",
        description: "No pude guardar tu feedback",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }, [toast]);

  const extractPattern = (aiResponse: string): string | null => {
    try {
      // Intentar extraer JSON del response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return jsonMatch[0];
      }
      return null;
    } catch {
      return null;
    }
  };

  const learnFromSuccess = async (interactionId: string) => {
    try {
      // Obtener la interacción exitosa
      const { data: interaction, error } = await supabase
        .from('ai_interactions' as any)
        .select('*')
        .eq('id', interactionId)
        .single();

      if (error || !interaction) return;

      const aiResponse = (interaction as any).ai_response;

      // Extraer el patrón exitoso
      const pattern = extractPattern(aiResponse);

      if (pattern) {
        const contextData = (interaction as any).context_data || {};
        // Guardar en ai_knowledge
        await supabase
          .from('ai_knowledge' as any)
          .insert({
            user_id: (interaction as any).user_id,
            knowledge_type: contextData.event_type || 'general',
            pattern: pattern,
            confidence_score: 0.8,
            times_applied: 1,
            success_rate: 1.0,
          });
      }
    } catch (error) {
      console.error('Error al aprender del patrón:', error);
    }
  };

  return {
    submitFeedback,
    submitting,
  };
}
