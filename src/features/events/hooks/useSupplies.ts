import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export interface Supply {
  id?: string;
  item_name: string;
  item_type: string;
  quantity: number;
  notes?: string;
  photo_url?: string;
  unit_price?: number;
}

// Ratios de cristalería y menaje por PAX (basados en Excel ORDEN_MODELO)
export const SUPPLY_RATIOS: { item_name: string; item_type: string; ratio_per_pax: number; bar_hours_multiplier?: number; notes?: string }[] = [
  // Cristalería
  { item_name: "Vaso Agua", item_type: "Cristalería", ratio_per_pax: 3.5 },
  { item_name: "Copa Vino", item_type: "Cristalería", ratio_per_pax: 4.2 },
  { item_name: "Copa Cava", item_type: "Cristalería", ratio_per_pax: 2.2 },
  { item_name: "Vaso Cubata", item_type: "Cristalería", ratio_per_pax: 2.5, bar_hours_multiplier: 2.5 },
  { item_name: "Vaso Chupito", item_type: "Cristalería", ratio_per_pax: 2.0 },
  // Vajilla
  { item_name: "Plato Mediano", item_type: "Vajilla", ratio_per_pax: 3.1 },
  { item_name: "Plato Grande", item_type: "Vajilla", ratio_per_pax: 1.5 },
  { item_name: "Plato Postre", item_type: "Vajilla", ratio_per_pax: 3.1 },
  // Cubertería
  { item_name: "Tenedor", item_type: "Cubertería", ratio_per_pax: 3.4 },
  { item_name: "Cuchillo", item_type: "Cubertería", ratio_per_pax: 3.4 },
  { item_name: "Cuchara", item_type: "Cubertería", ratio_per_pax: 1.6 },
  { item_name: "Cuchara Postre", item_type: "Cubertería", ratio_per_pax: 1.0, notes: "Sumar 100 si llevan tarta" },
  // Café
  { item_name: "Taza Café con Leche", item_type: "Café", ratio_per_pax: 0.4 },
  { item_name: "Plato Café con Leche", item_type: "Café", ratio_per_pax: 0.4 },
  { item_name: "Taza Café Solo", item_type: "Café", ratio_per_pax: 1.2 },
  { item_name: "Plato Café Solo", item_type: "Café", ratio_per_pax: 1.2 },
  { item_name: "Cucharita Café", item_type: "Café", ratio_per_pax: 1.0 },
  { item_name: "Jarrita", item_type: "Café", ratio_per_pax: 0.04 },
];

export const useSupplies = (eventId: string, totalGuests: number) => {
  const { isDemo, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Supply[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [barHours, setBarHours] = useState(4);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // --- QUERIES ---

  const { data: supplies = [], isLoading: loadingSupplies } = useQuery({
    queryKey: ['supplies', eventId, isDemo],
    queryFn: async () => {
      if (isDemo) {
        const saved = localStorage.getItem(`gula_demo_supplies_${eventId}`);
        return saved ? JSON.parse(saved) : [];
      }

      if (!user) return [];

      const { data, error } = await supabase
        .from("supplies")
        .select("*")
        .eq("event_id", eventId)
        .order("item_name");
      if (error) throw error;
      return data as Supply[];
    },
  });

  const { data: timings } = useQuery({
    queryKey: ['timings', eventId, isDemo],
    queryFn: async () => {
      if (isDemo) {
        const savedEvents = localStorage.getItem("gula_demo_events");
        if (savedEvents) {
          const events = JSON.parse(savedEvents);
          const event = events.find((e: any) => e.id === eventId);
          if (event) return { bar_hours: event.bar_hours || 4 };
        }
        return { bar_hours: 4 };
      }

      if (!user) return null;

      const { data, error } = await supabase
        .from("event_timings")
        .select("bar_hours")
        .eq("event_id", eventId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // --- EFFECTS ---

  useEffect(() => {
    if (supplies && !isEditing) {
      setFormData(supplies);
    }
  }, [supplies, isEditing]);

  useEffect(() => {
    if (timings?.bar_hours) {
      setBarHours(timings.bar_hours);
    }
  }, [timings]);

  // Real-time subscription
  useEffect(() => {
    if (isDemo || !user) return;

    const channel = supabase
      .channel(`supplies-changes-${eventId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'supplies', filter: `event_id=eq.${eventId}` },
        () => queryClient.invalidateQueries({ queryKey: ['supplies', eventId, isDemo] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient, isDemo, user]);

  // --- ACTIONS ---

  const recalculateQuantities = () => {
    if (totalGuests === 0 || formData.length === 0) return;

    const updatedSupplies = formData.map(supply => {
      const ratio = SUPPLY_RATIOS.find(r => r.item_name === supply.item_name);
      if (ratio) {
        let quantity = Math.ceil(totalGuests * ratio.ratio_per_pax);
        if (ratio.bar_hours_multiplier) {
          quantity = Math.ceil(totalGuests * ratio.ratio_per_pax * barHours / 4);
        }
        return { ...supply, quantity };
      }
      return supply;
    });

    setFormData(updatedSupplies);
    toast({ title: "Recalculado", description: `Cantidades actualizadas para ${totalGuests} PAX (No guardado aún)` });
  };

  const generateSupplies = async () => {
    if (totalGuests === 0) {
      toast({ title: "Error", description: "No hay invitados definidos", variant: "destructive" });
      return;
    }

    const generatedSupplies: Supply[] = SUPPLY_RATIOS.map(item => {
      let quantity = Math.ceil(totalGuests * item.ratio_per_pax);
      if (item.bar_hours_multiplier) {
        quantity = Math.ceil(totalGuests * item.ratio_per_pax * barHours / 4);
      }
      return {
        item_name: item.item_name,
        item_type: item.item_type,
        quantity,
        notes: item.notes || "",
        unit_price: 0
      };
    });

    setFormData(generatedSupplies);

    // Si no estamos editando, guardamos directamente (comportamiento "Generar de cero")
    if (!isEditing) {
      await saveToDb(generatedSupplies);
    }
  };

  const saveToDb = async (dataToSave: Supply[]) => {
    try {
      if (isDemo) {
        localStorage.setItem(`gula_demo_supplies_${eventId}`, JSON.stringify(dataToSave));
        toast({ title: "Guardado (Modo Demo)", description: "Suministros actualizados localmente" });
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ['supplies', eventId, isDemo] });
        return;
      }

      if (!user) throw new Error("Debes iniciar sesión para guardar permanentemente.");

      await supabase.from("supplies").delete().eq("event_id", eventId);

      if (dataToSave.length > 0) {
        const { error } = await supabase.from("supplies").insert(
          dataToSave.map(item => ({
            event_id: eventId,
            item_name: item.item_name,
            item_type: item.item_type,
            quantity: item.quantity,
            notes: item.notes || null,
            photo_url: item.photo_url || null,
            unit_price: item.unit_price || 0
          }))
        );
        if (error) throw error;
      }

      toast({ title: "Guardado", description: "Suministros actualizados correctamente" });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['supplies', eventId, isDemo] });
    } catch (error) {
      console.error("Error saving supplies:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudieron guardar los cambios", variant: "destructive" });
    }
  };

  const handleSave = () => saveToDb(formData);

  const handlePhotoUpload = async (index: number, file: File) => {
    if (isDemo) {
      toast({ title: "Simulación de subida", description: "Imagen previsualizada localmente." });
      const localUrl = URL.createObjectURL(file);
      const updated = [...formData];
      updated[index] = { ...updated[index], photo_url: localUrl };
      setFormData(updated);
      return;
    }

    setUploadingIndex(index);
    const fileExt = file.name.split('.').pop();
    const fileName = `supply-${eventId}-${Date.now()}.${fileExt}`;

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
    supplies,
    formData,
    setFormData,
    loading: loadingSupplies,
    isEditing,
    setIsEditing,
    barHours,
    uploadingIndex,
    recalculateQuantities,
    generateSupplies,
    handleSave,
    handlePhotoUpload
  };
};
