import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { StorageFactory } from "@/lib/storage";
import { z } from "zod";

/**
 * Configuración para el hook useEntityManager
 */
export interface EntityConfig<T> {
  /** Nombre de la tabla en la base de datos */
  tableName: string;
  
  /** ID del evento al que pertenecen las entidades */
  eventId: string;
  
  /** Schema de validación Zod (opcional) */
  validator?: z.ZodSchema<T>;
  
  /** Función para generar datos por defecto */
  defaultGenerator?: () => T[];
  
  /** Opciones de ordenamiento */
  orderBy?: { column: string; ascending?: boolean };
  
  /** Mensajes personalizados */
  messages?: {
    saveSuccess?: string;
    saveError?: string;
    deleteSuccess?: string;
    deleteError?: string;
  };

  /** Callbacks personalizados */
  callbacks?: {
    beforeSave?: (data: T[]) => T[] | Promise<T[]>;
    afterSave?: (data: T[]) => void | Promise<void>;
    beforeDelete?: (ids: string[]) => boolean | Promise<boolean>;
    afterDelete?: () => void | Promise<void>;
  };
}

/**
 * Resultado del hook useEntityManager
 */
export interface EntityManagerResult<T> {
  // Estado
  data: T[];
  formData: T[];
  loading: boolean;
  saving: boolean;
  isEditing: boolean;

  // Setters
  setFormData: (data: T[]) => void;
  setIsEditing: (editing: boolean) => void;

  // Operaciones CRUD
  handleSave: () => Promise<void>;
  handleAdd: (item: Partial<T>) => void;
  handleUpdate: (index: number, field: keyof T, value: any) => void;
  handleRemove: (index: number) => void;
  handleCancel: () => void;

  // Utilidades
  generateDefaults: () => void;
  refresh: () => Promise<void>;
}

/**
 * Hook genérico para gestión de entidades con CRUD completo
 * Elimina la duplicación de código entre diferentes secciones
 * 
 * @example
 * ```tsx
 * const beverages = useEntityManager<Beverage>({
 *   tableName: 'beverages',
 *   eventId: eventId,
 *   validator: beverageSchema,
 *   defaultGenerator: () => generateDefaultBeverages(totalGuests, barHours),
 * });
 * ```
 */
export function useEntityManager<T extends { id?: string }>(
  config: EntityConfig<T>
): EntityManagerResult<T> {
  const { isDemo, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    tableName,
    eventId,
    validator,
    defaultGenerator,
    orderBy,
    messages = {},
    callbacks = {},
  } = config;

  // Estado local
  const [formData, setFormData] = useState<T[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Obtener el adaptador de storage apropiado
  const storage = StorageFactory.getAdapter(isDemo, user?.id);

  // Query key para React Query
  const queryKey = [tableName, eventId, isDemo];

  // Fetch data con React Query
  const {
    data = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await storage.get<T>(tableName, { event_id: eventId });

      // Aplicar ordenamiento si está configurado
      if (orderBy) {
        return result.sort((a: any, b: any) => {
          const aVal = (a as any)[orderBy.column];
          const bVal = (b as any)[orderBy.column];
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return orderBy.ascending ? comparison : -comparison;
        });
      }

      return result;
    },
    enabled: !!eventId,
  });

  // Sincronizar formData con data cuando no está editando
  useEffect(() => {
    if (!isEditing && data) {
      setFormData(data);
    }
  }, [data, isEditing]);

  // Mutation para guardar
  const saveMutation = useMutation({
    mutationFn: async (items: T[]) => {
      // Callback antes de guardar
      let processedItems = items;
      if (callbacks.beforeSave) {
        processedItems = await callbacks.beforeSave(items);
      }

      // Validar si hay schema
      if (validator) {
        processedItems = processedItems.map((item) => validator.parse(item));
      }

      // Identificar operaciones
      const existingIds = data.map((d) => d.id).filter(Boolean) as string[];
      const newIds = processedItems.map((d) => d.id).filter(Boolean) as string[];

      // Eliminar items que ya no están
      const toDelete = existingIds.filter((id) => !newIds.includes(id));
      if (toDelete.length > 0) {
        await storage.deleteMany(tableName, toDelete);
      }

      // Insertar o actualizar cada item
      const results: T[] = [];
      for (const item of processedItems) {
        const record = {
          ...item,
          event_id: eventId,
        } as any;

        if (item.id) {
          // Actualizar existente
          const updated = await storage.update<T>(tableName, item.id, record);
          results.push(updated);
        } else {
          // Insertar nuevo
          const inserted = await storage.insert<T>(tableName, record);
          results.push(inserted);
        }
      }

      return results;
    },
    onSuccess: async (savedData) => {
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey });

      // Callback después de guardar
      if (callbacks.afterSave) {
        await callbacks.afterSave(savedData);
      }

      toast({
        title: messages.saveSuccess || "Guardado correctamente",
        description: `Se han guardado ${savedData.length} elementos.`,
      });

      setIsEditing(false);
    },
    onError: (error) => {
      console.error(`Error saving ${tableName}:`, error);
      toast({
        title: messages.saveError || "Error al guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Callback antes de eliminar
      if (callbacks.beforeDelete) {
        const shouldDelete = await callbacks.beforeDelete(ids);
        if (!shouldDelete) return;
      }

      await storage.deleteMany(tableName, ids);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey });

      if (callbacks.afterDelete) {
        await callbacks.afterDelete();
      }

      toast({
        title: messages.deleteSuccess || "Eliminado correctamente",
      });
    },
    onError: (error) => {
      console.error(`Error deleting from ${tableName}:`, error);
      toast({
        title: messages.deleteError || "Error al eliminar",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleSave = useCallback(async () => {
    await saveMutation.mutateAsync(formData);
  }, [formData, saveMutation]);

  const handleAdd = useCallback(
    (item: Partial<T>) => {
      setFormData([...formData, item as T]);
    },
    [formData]
  );

  const handleUpdate = useCallback(
    (index: number, field: keyof T, value: any) => {
      const updated = [...formData];
      updated[index] = { ...updated[index], [field]: value };
      setFormData(updated);
    },
    [formData]
  );

  const handleRemove = useCallback(
    (index: number) => {
      setFormData(formData.filter((_, i) => i !== index));
    },
    [formData]
  );

  const handleCancel = useCallback(() => {
    setFormData(data);
    setIsEditing(false);
  }, [data]);

  const generateDefaults = useCallback(() => {
    if (defaultGenerator) {
      const defaults = defaultGenerator();
      setFormData(defaults);
      setIsEditing(true);
    }
  }, [defaultGenerator]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    // Estado
    data,
    formData,
    loading,
    saving: saveMutation.isPending,
    isEditing,

    // Setters
    setFormData,
    setIsEditing,

    // Operaciones
    handleSave,
    handleAdd,
    handleUpdate,
    handleRemove,
    handleCancel,

    // Utilidades
    generateDefaults,
    refresh,
  };
}
