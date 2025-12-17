import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

// Hook para gestionar la lista de eventos del usuario de forma reactiva usando React Query.
export function useEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Función de fetch para React Query
  const getEvents = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) {
      throw error;
    }

    return data as Event[];
  };

  /**
   * Uso de useQuery:
   * - 'events' es la key de la caché.
   * - getEvents es la función que hace la petición.
   * - enabled: !!user asegura que solo se ejecute si hay usuario logueado.
   */
  const { data: events = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: getEvents,
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      // Suscripción en tiempo real con Supabase
      // Cuando hay cambios, invalidamos la cache para que React Query refesque los datos automáticamente.
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
            console.log('🔄 Sincronizando eventos...');
            queryClient.invalidateQueries({ queryKey: ['events', user.id] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, queryClient]);

  return {
    events,
    loading,
    refreshEvents: refetch
  };
}
