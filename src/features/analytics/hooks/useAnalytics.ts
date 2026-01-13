import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PerformanceMetrics {
  totalRevenue: number;
  totalCost: number;
  grossMargin: number;
  eventPerformance: EventPerformance[];
}

export interface EventPerformance {
  id: string;
  name: string;
  date: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number;
  breakdown: {
    food: number;
    beverage: number;
    staff: number;
    rentals: number;
  };
  status: 'high' | 'medium' | 'low';
}

/**
 * Hook para obtener y calcular métricas de rendimiento de eventos.
 */
export const useAnalytics = () => {
  return useQuery({
    queryKey: ['event-performance'],
    queryFn: async (): Promise<PerformanceMetrics> => {
      // Obtenemos eventos con sus relaciones
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          id, 
          venue, 
          event_date,
          event_type,
          total_guests,
          beverages(total_price),
          event_staff(staff_count, role),
          recipe_ingredients(calculated_quantity, base_quantity)
        `);

      if (error) throw error;

      // En un entorno real, aquí haríamos cálculos complejos cruzando con precios de ingredientes
      // Para el MVP/Demo, simulamos el cálculo basado en los datos disponibles
      const eventPerformance: EventPerformance[] = events.map(event => {
        // Cálculo simplificado de costes
        const bevCost = event.beverages?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
        const staffCost = (event.event_staff?.reduce((sum, s) => sum + (s.staff_count || 0), 0) || 0) * 150; // 150€ de media por staff

        // Estimación de food cost basada en recetas (si hubiera precios)
        // Aquí usamos un valor base por invitados para la demo si no hay datos precisos
        const foodCost = event.total_guests * 25;
        const rentalCost = 500; // Valor fijo base alquileres

        const totalCost = foodCost + bevCost + staffCost + rentalCost;
        const revenue = event.total_guests * 85; // PVP estimado 85€/persona
        const margin = revenue - totalCost;
        const marginPercent = (margin / revenue) * 100;

        return {
          id: event.id,
          name: event.venue,
          date: event.event_date,
          revenue,
          cost: totalCost,
          margin,
          marginPercent,
          breakdown: {
            food: foodCost,
            beverage: bevCost,
            staff: staffCost,
            rentals: rentalCost
          },
          status: marginPercent > 30 ? 'high' : marginPercent > 15 ? 'medium' : 'low'
        };
      });

      const totalRevenue = eventPerformance.reduce((sum, e) => sum + e.revenue, 0);
      const totalCost = eventPerformance.reduce((sum, e) => sum + e.cost, 0);
      const grossMargin = totalRevenue - totalCost;

      return {
        totalRevenue,
        totalCost,
        grossMargin,
        eventPerformance
      };
    }
  });
};
