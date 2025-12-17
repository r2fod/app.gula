import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { beverageSchema } from "@/lib/validations";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Beverage {
  id?: string;
  category: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  is_extra?: boolean;
  photo_url?: string;
}

// Lista de bebidas predefinidas con sus ratios por persona y precios.
// ratio_per_pax: Cantidad estimada por persona.
// per_bar_hour: Si true, el ratio se multiplica por las horas de barra libre.
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

/**
 * Hook personalizado para gestión de bebidas con React Query.
 * Maneja fetching, caché, actualizaciones en tiempo real y cálculos.
 */
export const useBeverages = (eventId: string, totalGuests: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Beverage[]>([]);
  const [barHours, setBarHours] = useState(2);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // --- FETCHER FUNCTIONS ---

  const getBeverages = async () => {
    const { data, error } = await supabase
      .from("beverages")
      .select("*")
      .eq("event_id", eventId);

    if (error) throw error;
    // @ts-ignore: Assuming photo_url exists in DB or will exist
    return data as Beverage[];
  };

  const getTimings = async () => {
    const { data, error } = await supabase
      .from("event_timings")
      .select("bar_hours, bar_start, bar_end")
      .eq("event_id", eventId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  };

  // --- QUERIES ---

  const { data: beverages = [], isLoading: loadingBeverages } = useQuery({
    queryKey: ['beverages', eventId],
    queryFn: getBeverages,
  });

  const { data: timings } = useQuery({
    queryKey: ['timings', eventId],
    queryFn: getTimings,
  });

  // --- EFFECTS ---

  useEffect(() => {
    if (beverages && !isEditing) {
      setFormData(beverages);
    }
  }, [beverages, isEditing]);

  useEffect(() => {
    if (timings) {
      if (timings.bar_hours) setBarHours(timings.bar_hours);
      else if (timings.bar_start && timings.bar_end) calculateAndSetBarHours(timings);
    }
  }, [timings]);

  useEffect(() => {
    const beveragesChannel = supabase
      .channel('beverages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beverages', filter: `event_id=eq.${eventId}` },
        () => queryClient.invalidateQueries({ queryKey: ['beverages', eventId] })
      )
      .subscribe();

    const timingsChannel = supabase
      .channel('event-timings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_timings', filter: `event_id=eq.${eventId}` },
        () => queryClient.invalidateQueries({ queryKey: ['timings', eventId] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(beveragesChannel);
      supabase.removeChannel(timingsChannel);
    };
  }, [eventId, queryClient]);

  // --- HELPERS ---

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

  // --- ACTIONS ---

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
          photo_url: item.photo_url || null,
        }));

        const { error: insertError } = await supabase.from("beverages").insert(recordsToInsert);
        if (insertError) throw insertError;
      }

      toast({ title: "✅ Bebidas guardadas correctamente" });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['beverages', eventId] });
    } catch (err) {
      console.error('Error saving beverages:', err);
      const errorMessage = err instanceof Error ? err.message : "Error al guardar las bebidas";
      toast({ title: "Error de validación", description: errorMessage, variant: "destructive" });
    }
  };

  const handlePhotoUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    const fileExt = file.name.split('.').pop();
    const fileName = `beverage-${eventId}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('menus').upload(fileName, file);

    if (error) {
      toast({ title: "Error", description: "No se pudo subir la imagen", variant: "destructive" });
      setUploadingIndex(null);
      return;
    }

    const { data: urlData } = supabase.storage.from('menus').getPublicUrl(fileName);

    // Actualizar solo localmente en formData
    const updated = [...formData];
    updated[index] = { ...updated[index], photo_url: urlData.publicUrl };
    setFormData(updated);

    setUploadingIndex(null);
  };

  return {
    beverages,
    formData,
    setFormData,
    loading: loadingBeverages,
    barHours,
    isEditing,
    setIsEditing,
    uploadingIndex,
    generateDefaultBeverages,
    recalculateQuantities,
    handleSave,
    handlePhotoUpload
  };
};
