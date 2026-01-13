import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export interface MenuItem {
  id?: string;
  name: string;
  description: string;
  category: string;
  sort_order?: number;
}

/**
 * Hook para gestionar los platos del menú de un evento.
 * Estandariza el fetching con React Query y maneja la persistencia.
 */
export const useMenu = (eventId: string) => {
  const { isDemo, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MenuItem[]>([]);

  // --- CONSULTAS ---

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ['menu_items', eventId, isDemo],
    queryFn: async () => {
      if (isDemo) {
        const saved = localStorage.getItem(`gula_demo_menu_${eventId}`);
        return saved ? JSON.parse(saved) : [];
      }

      if (!user) return [];

      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order");

      if (error) throw error;
      return data as MenuItem[];
    }
  });

  // Sincronizar formData cuando los datos cargan o dejamos de editar
  useEffect(() => {
    if (items && !isEditing) {
      setFormData(items);
    }
  }, [items, isEditing]);

  // Suscripción en tiempo real (solo si no es modo demo)
  useEffect(() => {
    if (isDemo || !user) return;

    const channel = supabase
      .channel(`menu-items-realtime-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['menu_items', eventId, isDemo] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient, isDemo, user]);

  // --- MUTACIONES ---

  const saveMutation = useMutation({
    mutationFn: async (newData: MenuItem[]) => {
      if (isDemo) {
        localStorage.setItem(`gula_demo_menu_${eventId}`, JSON.stringify(newData));
        return;
      }

      if (!user) throw new Error("Debes estar autenticado para guardar.");

      // Lógica de sincronización:
      // 1. Identificar qué borrar
      const currentIds = newData.filter(i => i.id).map(i => i.id);
      const toDelete = items.filter(i => i.id && !currentIds.includes(i.id));

      if (toDelete.length > 0) {
        const { error: delError } = await supabase
          .from("menu_items")
          .delete()
          .in("id", toDelete.map(i => i.id!));
        if (delError) throw delError;
      }

      // 2. Upsert (Actualizar o Insertar)
      for (const item of newData) {
        if (item.id) {
          const { error: updError } = await supabase
            .from("menu_items")
            .update({
              name: item.name,
              description: item.description,
              category: item.category,
              sort_order: item.sort_order
            })
            .eq("id", item.id);
          if (updError) throw updError;
        } else {
          const { error: insError } = await supabase
            .from("menu_items")
            .insert({
              ...item,
              event_id: eventId
            });
          if (insError) throw insError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items', eventId, isDemo] });
      toast({ title: "Guardado", description: "Menú actualizado correctamente" });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message
      });
    }
  });

  // --- ACCIONES DE UI ---

  const addItem = (category: string) => {
    setFormData(prev => [...prev, { name: "", description: "", category }]);
  };

  const removeItem = (index: number) => {
    setFormData(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof MenuItem, value: string) => {
    setFormData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return {
    items,
    formData,
    loading,
    isEditing,
    setIsEditing,
    addItem,
    removeItem,
    updateItem,
    handleSave: () => saveMutation.mutate(formData),
    isSaving: saveMutation.isPending
  };
};
