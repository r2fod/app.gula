import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { beverageSchema } from "@/lib/validations";
import { z } from "zod";

export interface Beverage {
  id?: string;
  category: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  is_extra?: boolean;
}

// Bebidas predefinidas
export const DEFAULT_BEVERAGES: { category: string; item_name: string; ratio_per_pax: number; unit_price: number; per_bar_hour?: boolean }[] = [
  // APERITIVO/COMIDA
  { category: 'aperitivo', item_name: 'Nebla Verdejo', ratio_per_pax: 0.40, unit_price: 5.22 },
  { category: 'aperitivo', item_name: 'Raiza Rioja Tinto', ratio_per_pax: 0.29, unit_price: 4.33 },
  { category: 'aperitivo', item_name: 'Botella Cava', ratio_per_pax: 0.13, unit_price: 3.59 },
  { category: 'aperitivo', item_name: 'Agua Solán de Cabras 1.5L', ratio_per_pax: 1.00, unit_price: 0.65 },
  { category: 'aperitivo', item_name: 'Agua con gas', ratio_per_pax: 0.25, unit_price: 0.789 },
  { category: 'aperitivo', item_name: 'Botellín cerveza', ratio_per_pax: 3.50, unit_price: 0.49 },
  { category: 'aperitivo', item_name: 'Cerveza 0,0', ratio_per_pax: 0.15, unit_price: 0.89 },
  { category: 'aperitivo', item_name: 'Cerveza sin gluten', ratio_per_pax: 0.05, unit_price: 1.14 },
  { category: 'aperitivo', item_name: 'Coca-Cola', ratio_per_pax: 0.25, unit_price: 0.569 },
  { category: 'aperitivo', item_name: 'Coca-Cola Zero', ratio_per_pax: 0.25, unit_price: 0.5629 },
  { category: 'aperitivo', item_name: 'Aquarius', ratio_per_pax: 0.30, unit_price: 0.6629 },
  { category: 'aperitivo', item_name: 'Nestea', ratio_per_pax: 0.20, unit_price: 0.715 },
  { category: 'aperitivo', item_name: 'Fanta Naranja', ratio_per_pax: 0.30, unit_price: 0.528 },
  { category: 'aperitivo', item_name: 'Fanta Limón', ratio_per_pax: 0.30, unit_price: 0.528 },
  { category: 'aperitivo', item_name: 'Vermut Izaguirre Rojo', ratio_per_pax: 0.07, unit_price: 6.30 },
  { category: 'aperitivo', item_name: 'Vermut Izaguirre Blanco', ratio_per_pax: 0.03, unit_price: 6.30 },
  // BARRA COPAS
  { category: 'copas', item_name: 'Ginebra Tanqueray', ratio_per_pax: 0.035, unit_price: 12.18, per_bar_hour: true },
  { category: 'copas', item_name: 'Ginebra Seagrams', ratio_per_pax: 0.035, unit_price: 13.05, per_bar_hour: true },
  { category: 'copas', item_name: 'Ginebra Larios', ratio_per_pax: 0.01, unit_price: 10.00, per_bar_hour: true },
  { category: 'copas', item_name: 'Puerto de Indias', ratio_per_pax: 0.015, unit_price: 13.00, per_bar_hour: true },
  { category: 'copas', item_name: 'Ron Barceló', ratio_per_pax: 0.03, unit_price: 12.00, per_bar_hour: true },
  { category: 'copas', item_name: 'Ron Brugal', ratio_per_pax: 0.03, unit_price: 11.15, per_bar_hour: true },
  { category: 'copas', item_name: 'Ballentines', ratio_per_pax: 0.035, unit_price: 11.20, per_bar_hour: true },
  { category: 'copas', item_name: 'Vodka', ratio_per_pax: 0.02, unit_price: 10.90, per_bar_hour: true },
  { category: 'copas', item_name: 'Tequila', ratio_per_pax: 0.005, unit_price: 12.87, per_bar_hour: true },
  { category: 'copas', item_name: 'Tequila Rosa', ratio_per_pax: 0.01, unit_price: 6.70, per_bar_hour: true },
  { category: 'copas', item_name: 'Cazalla', ratio_per_pax: 0.005, unit_price: 8.45, per_bar_hour: true },
  { category: 'copas', item_name: 'Baileys', ratio_per_pax: 0.005, unit_price: 10.20, per_bar_hour: true },
  { category: 'copas', item_name: 'Mistela', ratio_per_pax: 0.005, unit_price: 3.12, per_bar_hour: true },
  { category: 'copas', item_name: 'Tónica', ratio_per_pax: 0.28, unit_price: 2.01, per_bar_hour: true },
  { category: 'copas', item_name: 'Hielo', ratio_per_pax: 0.335, unit_price: 0.763, per_bar_hour: true },
  // REFRESCOS (Barra Copas)
  { category: 'refrescos', item_name: 'Seven Up Lata', ratio_per_pax: 0.125, unit_price: 0.972, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Agua con gas (Copas)', ratio_per_pax: 0.125, unit_price: 0.80, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Coca-Cola (Copas)', ratio_per_pax: 0.35, unit_price: 0.569, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Coca-Cola Zero (Copas)', ratio_per_pax: 0.30, unit_price: 0.5629, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Fanta Naranja (Copas)', ratio_per_pax: 0.25, unit_price: 0.528, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Fanta Limón (Copas)', ratio_per_pax: 0.25, unit_price: 0.528, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Limones', ratio_per_pax: 0.025, unit_price: 2.50, per_bar_hour: true },
];

export const useBeverages = (eventId: string, totalGuests: number) => {
  const { toast } = useToast();
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [formData, setFormData] = useState<Beverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [barHours, setBarHours] = useState(2);
  const [isEditing, setIsEditing] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchBeverages();
    fetchBarHours();
  }, [eventId]);

  // Real-time subscriptions
  useEffect(() => {
    const beveragesChannel = supabase
      .channel('beverages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beverages', filter: `event_id=eq.${eventId}` },
        () => fetchBeverages()
      )
      .subscribe();

    const timingsChannel = supabase
      .channel('event-timings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_timings', filter: `event_id=eq.${eventId}` },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as any;
            if (newData.bar_hours) setBarHours(newData.bar_hours);
            else if (newData.bar_start && newData.bar_end) calculateAndSetBarHours(newData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(beveragesChannel);
      supabase.removeChannel(timingsChannel);
    };
  }, [eventId]);

  const fetchBeverages = async () => {
    try {
      const { data, error } = await supabase
        .from("beverages")
        .select("*")
        .eq("event_id", eventId);

      if (error) throw error;

      if (data) {
        setBeverages(data);
        if (!isEditing) setFormData(data);
      }
    } catch (err) {
      console.error('Error fetching beverages:', err);
      toast({ title: "Error", description: "No se pudieron cargar las bebidas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchBarHours = async () => {
    const { data, error } = await supabase
      .from("event_timings")
      .select("bar_hours, bar_start, bar_end")
      .eq("event_id", eventId)
      .single();

    if (!error && data) {
      if (data.bar_hours) setBarHours(data.bar_hours);
      else if (data.bar_start && data.bar_end) calculateAndSetBarHours(data);
    }
  };

  const calculateAndSetBarHours = (data: any) => {
    const start = data.bar_start.split(':');
    const end = data.bar_end.split(':');
    const startHours = parseInt(start[0]) + parseInt(start[1]) / 60;
    let endHours = parseInt(end[0]) + parseInt(end[1]) / 60;
    if (endHours < startHours) endHours += 24;
    setBarHours(Math.max(1, Math.round(endHours - startHours)));
  };

  const calculateQuantity = (item: { ratio_per_pax: number; per_bar_hour?: boolean }) => {
    if (item.per_bar_hour) {
      return Math.ceil(item.ratio_per_pax * totalGuests * barHours);
    }
    return Math.ceil(item.ratio_per_pax * totalGuests);
  };

  const generateDefaultBeverages = () => {
    const defaultItems: Beverage[] = DEFAULT_BEVERAGES.map(item => ({
      category: item.category,
      item_name: item.item_name,
      quantity: calculateQuantity(item),
      unit_price: item.unit_price,
      is_extra: false,
    }));
    setFormData(defaultItems);
    toast({
      title: "Bebidas generadas",
      description: `Cantidades calculadas para ${totalGuests} invitados y ${barHours}h de barra libre`
    });
  };

  const recalculateQuantities = () => {
    const updated = formData.map(item => {
      const defaultItem = DEFAULT_BEVERAGES.find(d => d.item_name === item.item_name && d.category === item.category);
      if (defaultItem && !item.is_extra) {
        return { ...item, quantity: calculateQuantity(defaultItem) };
      }
      return item;
    });
    setFormData(updated);
    toast({ title: "Cantidades actualizadas", description: "Basado en los nuevos datos del evento" });
  };

  const handleSave = async () => {
    try {
      const validatedData = formData.map((item, index) => {
        try {
          return beverageSchema.parse({
            ...item,
            quantity: item.quantity || 0,
            unit_price: item.unit_price || 0,
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            const firstError = error.errors[0];
            throw new Error(`Fila ${index + 1} (${item.item_name || 'Sin nombre'}): ${firstError.message}`);
          }
          throw error;
        }
      });

      const { error: deleteError } = await supabase.from("beverages").delete().eq("event_id", eventId);
      if (deleteError) throw deleteError;

      if (validatedData.length > 0) {
        const recordsToInsert = validatedData.map(item => ({
          event_id: eventId,
          category: item.category,
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          notes: item.notes || null,
          is_extra: item.is_extra || false,
        }));

        const { error: insertError } = await supabase.from("beverages").insert(recordsToInsert);
        if (insertError) throw insertError;
      }

      toast({ title: "✅ Bebidas guardadas correctamente" });
      setIsEditing(false);
      fetchBeverages();
    } catch (err) {
      console.error('Error saving beverages:', err);
      const errorMessage = err instanceof Error ? err.message : "Error al guardar las bebidas";
      toast({ title: "Error de validación", description: errorMessage, variant: "destructive" });
    }
  };

  return {
    beverages,
    formData,
    setFormData,
    loading,
    barHours,
    isEditing,
    setIsEditing,
    generateDefaultBeverages,
    recalculateQuantities,
    handleSave,
  };
};
