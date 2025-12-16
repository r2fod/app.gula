import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  user_id: string;
  event_type: string;
  event_date: string;
  venue: string;
  total_guests: number;
  adults?: number;
  children?: number;
  staff?: number;
  created_at?: string;
}

// Hook para gestionar la lista de eventos del usuario de forma reactiva.
export function useEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEvents();

      // Suscripción en tiempo real para mantener la lista de eventos actualizada
      // Escucha cualquier cambio (INSERT, UPDATE, DELETE) en la tabla 'events' para el usuario actual
      const channel = supabase
        .channel('events-list-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchEvents();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  /**
   * Obtiene los eventos desde Supabase, ordenados por fecha (más recientes primero).
   */
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    refreshEvents: fetchEvents
  };
}
