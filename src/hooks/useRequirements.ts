import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RequirementItem {
  id?: string;
  event_id?: string;
  [key: string]: any;
}

export const useRequirements = (eventId: string) => {
  const [allergies, setAllergies] = useState<RequirementItem[]>([]);
  const [furniture, setFurniture] = useState<RequirementItem[]>([]);
  const [other, setOther] = useState<RequirementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [allergiesRes, furnitureRes, otherRes] = await Promise.all([
        supabase.from("allergies").select("*").eq("event_id", eventId),
        supabase.from("furniture").select("*").eq("event_id", eventId),
        supabase.from("other_requirements").select("*").eq("event_id", eventId),
      ]);

      if (allergiesRes.error) throw allergiesRes.error;
      if (furnitureRes.error) throw furnitureRes.error;
      if (otherRes.error) throw otherRes.error;

      setAllergies(allergiesRes.data || []);
      setFurniture(furnitureRes.data || []);
      setOther(otherRes.data || []);
    } catch (error) {
      console.error("Error fetching requirements:", error);
      toast({ title: "Error", description: "Error al cargar requisitos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const syncCategory = async (
    table: "allergies" | "furniture" | "other_requirements",
    currentItems: RequirementItem[],
    originalItems: RequirementItem[]
  ) => {
    // 1. Delete items that are in original but not in current (by ID)
    const currentIds = currentItems.filter(item => item.id).map(item => item.id);
    const toDelete = originalItems.filter(item => item.id && !currentIds.includes(item.id));

    if (toDelete.length > 0) {
      const { error } = await supabase
        .from(table)
        .delete()
        .in("id", toDelete.map(item => item.id));
      if (error) throw error;
    }

    // 2. Update existing items (with ID) and Insert new items (without ID)
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

  const saveAll = async (
    newAllergies: RequirementItem[],
    newFurniture: RequirementItem[],
    newOther: RequirementItem[]
  ) => {
    try {
      await Promise.all([
        syncCategory("allergies", newAllergies, allergies),
        syncCategory("furniture", newFurniture, furniture),
        syncCategory("other_requirements", newOther, other),
      ]);

      toast({ title: "Guardado", description: "Requisitos actualizados correctamente" });
      fetchAll(); // Refresh state
      return true;
    } catch (error) {
      console.error("Error saving requirements:", error);
      toast({ title: "Error", description: "No se pudieron guardar los cambios", variant: "destructive" });
      return false;
    }
  };

  return {
    allergies,
    furniture,
    other,
    loading,
    saveAll,
    refetch: fetchAll
  };
};
