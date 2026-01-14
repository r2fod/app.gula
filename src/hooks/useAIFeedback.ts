import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
        .from('ai_interactions')
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

  const learnFromSuccess = async (interactionId: string) => {
    try {
      const { data: interaction } = await supabase
        .from('ai_interactions')
        .select('user_message, ai_response, context_data, event_id')
        .eq('id', interactionId)
        .single();

      if (!interaction) return;

      const aiResponse = JSON.parse(interaction.ai_response);
      
      // Extraer patrones de la respuesta exitosa
      if (aiResponse.actions && aiResponse.actions.length > 0) {
        const actionTypes = aiResponse.actions.map((a: any) => a.type);
        const knowledgeData = {
          summary: `Acciones exitosas: ${actionTypes.join(', ')}`,
          actions: aiResponse.actions,
          context: interaction.context_data,
        };

        await supabase.from('ai_knowledge').insert({
          user_id: interaction.context_data?.userId,
          knowledge_type: 'successful_action_pattern',
          knowledge_data: knowledgeData,
          confidence_score: 0.7,
          source_interaction_id: interactionId,
        });
      }
    } catch (error) {
      console.error('Error al aprender del éxito:', error);
    }
  };

  return {
    submitFeedback,
    submitting,
  };
}
