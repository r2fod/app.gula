import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface RequirementItem {
  id?: string;
  event_id?: string;
  [key: string]: any;
}

// Hook para gestionar requisitos especiales (alergias, mobiliario, etc) usando React Query.
export const useRequirements = (eventId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingSave, setLoadingSave] = useState(false);

  // --- FETCHER FUNCTIONS ---

  const getAllergies = async () => {
    const { data, error } = await supabase.from("allergies").select("*").eq("event_id", eventId);
    if (error) throw error;
    return data as RequirementItem[];
  };

  const getFurniture = async () => {
    const { data, error } = await supabase.from("furniture").select("*").eq("event_id", eventId);
    if (error) throw error;
    return data as RequirementItem[];
  };

  const getOther = async () => {
    const { data, error } = await supabase.from("other_requirements").select("*").eq("event_id", eventId);
    if (error) throw error;
    return data as RequirementItem[];
  };

  // --- QUERIES ---
  // Realizamos las peticiones en paralelo y caché automático

  const { data: allergies = [], isLoading: loadingAllergies } = useQuery({
    queryKey: ['requirements', 'allergies', eventId],
    queryFn: getAllergies,
  });

  const { data: furniture = [], isLoading: loadingFurniture } = useQuery({
    queryKey: ['requirements', 'furniture', eventId],
    queryFn: getFurniture,
  });

  const { data: other = [], isLoading: loadingOther } = useQuery({
    queryKey: ['requirements', 'other', eventId],
    queryFn: getOther,
  });

  const loading = loadingAllergies || loadingFurniture || loadingOther || loadingSave;

  // --- ACTIONS ---

  /**
   * Sincroniza una categoría específica con la base de datos.
   * Estrategia:
   * 1. Detectar y borrar items eliminados.
   * 2. Actualizar items existentes.
   * 3. Insertar nuevos items.
   */
  const syncCategory = async (
    table: "allergies" | "furniture" | "other_requirements",
    currentItems: RequirementItem[],
    originalItems: RequirementItem[]
  ) => {
    // 1. Borrar items que estaban en original pero no en current (por ID)
    const currentIds = currentItems.filter(item => item.id).map(item => item.id);
    const toDelete = originalItems.filter(item => item.id && !currentIds.includes(item.id));

    if (toDelete.length > 0) {
      const { error } = await supabase
        .from(table)
        .delete()
        .in("id", toDelete.map(item => item.id));
      if (error) throw error;
    }

    // 2. Actualizar items existentes (con ID) e Insertar nuevos (sin ID)
    for (const item of currentItems) {
      if (item.id) {
        // Update
        const { error } = await supabase.from(table).update(item as any).eq("id", item.id);
        if (error) throw error;
      } else {
        // Insert
        // Ensure event_id is present
        const { error } = await supabase.from(table).insert({ ...item, event_id: eventId } as any);
        if (error) throw error;
      }
    }
  };

  /**
   * Guarda todos los cambios en todas las categorías.
   */
  const saveAll = async (
    newAllergies: RequirementItem[],
    newFurniture: RequirementItem[],
    newOther: RequirementItem[]
  ) => {
    try {
      setLoadingSave(true);
      await Promise.all([
        syncCategory("allergies", newAllergies, allergies),
        syncCategory("furniture", newFurniture, furniture),
        syncCategory("other_requirements", newOther, other),
      ]);

      toast({ title: "Guardado", description: "Requisitos actualizados correctamente" });

      // Invalidar todas las queries de requisitos para este evento para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['requirements', 'allergies', eventId] });
      queryClient.invalidateQueries({ queryKey: ['requirements', 'furniture', eventId] });
      queryClient.invalidateQueries({ queryKey: ['requirements', 'other', eventId] });

      return true;
    } catch (error) {
      console.error("Error saving requirements:", error);
      toast({ title: "Error", description: "No se pudieron guardar los cambios", variant: "destructive" });
      return false;
    } finally {
      setLoadingSave(false);
    }
  };

  return {
    allergies,
    furniture,
    other,
    loading,
    saveAll,
    // La función refetch ahora invalida todas las categorías para recargar
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'allergies', eventId] });
      queryClient.invalidateQueries({ queryKey: ['requirements', 'furniture', eventId] });
      queryClient.invalidateQueries({ queryKey: ['requirements', 'other', eventId] });
    }
  };
};
