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
  const { user, isDemo } = useAuth();
  const queryClient = useQueryClient();

  // Función de fetch para React Query
  const getEvents = async () => {
    // Si estamos en modo demo, recuperamos los eventos del localStorage
    if (isDemo) {
      const savedEvents = localStorage.getItem("gula_demo_events");
      return savedEvents ? JSON.parse(savedEvents) : [];
    }

    // Si no hay usuario ni es demo, devolvemos lista vacía
    if (!user) return [];

    // Consulta a Supabase para obtener los eventos del usuario real
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
   * - enabled asegura que solo se ejecute si hay usuario o estamos en modo demo.
   */
  const { data: events = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['events', user?.id, isDemo],
    queryFn: getEvents,
    enabled: !!user || isDemo,
  });

  useEffect(() => {
    // Suscripción en tiempo real solo para usuarios reales
    if (user && !isDemo) {
      // Suscripción en tiempo real con Supabase
      // Cuando hay cambios, invalidamos la cache para que React Query refresque los datos automáticamente.
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
            queryClient.invalidateQueries({ queryKey: ['events', user.id, isDemo] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isDemo, queryClient]);

  return {
    events,
    loading,
    refreshEvents: refetch
  };
}
