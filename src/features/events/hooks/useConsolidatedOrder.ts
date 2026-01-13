// ------------------------------------------------------------------
// Archivo: useConsolidatedOrder.ts
// Descripción: Hook personalizado que recupera todos los ingredientes necesarios
// para un evento completo, agregándolos y consolidándolos por proveedor.
// ------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ConsolidatedItem {
  ingredient_name: string;
  total_quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  supplier: string;
  waste_percentage: number;
}

export interface SupplierOrder {
  supplier: string;
  items: ConsolidatedItem[];
  total_supplier_cost: number;
}

export const useConsolidatedOrder = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ["consolidated-order", eventId],
    queryFn: async (): Promise<SupplierOrder[]> => {
      if (!eventId) return [];

      // 2. Obtener los ingredientes calculados para el evento (view/tabla calculada)
      const { data: recipeIngredients, error: riError } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .eq("event_id", eventId);

      if (riError) {
        console.error("Error fetching recipe_ingredients", riError);
        throw riError;
      }

      if (!recipeIngredients || recipeIngredients.length === 0) return [];

      // 3. Obtener metadatos de ingredientes (Proveedor, Coste, Mermas)
      // Como no hay FK directa fiable, buscamos por nombre (best effort) o si añadimos ID sería mejor.
      // Asumiremos que ingredient_name es único o usamos el name para lookup.
      const ingredientNames = recipeIngredients.map(i => i.ingredient_name);

      const { data: ingredientsMeta, error: metaError } = await supabase
        .from("ingredients")
        .select("name, supplier, cost_per_unit, waste_percentage, unit_cost")
        .in("name", ingredientNames);

      if (metaError) {
        console.error("Error fetching ingredients metadata", metaError);
        throw metaError;
      }

      // Crear mapa de metadatos para acceso rápido
      const metaMap = new Map(ingredientsMeta?.map(i => [i.name, i]));

      // 4. Agrupar por Proveedor
      const itemsMap = new Map<string, ConsolidatedItem>();

      recipeIngredients.forEach(ri => {
        const meta = metaMap.get(ri.ingredient_name);
        const supplier = meta?.supplier || "Sin Proveedor";
        const quantity = ri.calculated_quantity || ri.base_quantity || 0;

        // Clave única: Proveedor + Ingrediente
        const key = `${supplier}|${ri.ingredient_name}`;

        if (!itemsMap.has(key)) {
          itemsMap.set(key, {
            ingredient_name: ri.ingredient_name,
            total_quantity: 0,
            unit: ri.unit,
            unit_cost: meta?.cost_per_unit || meta?.unit_cost || 0,
            total_cost: 0,
            supplier: supplier,
            waste_percentage: meta?.waste_percentage || 0,
          });
        }

        const current = itemsMap.get(key)!;
        current.total_quantity += quantity;
        current.total_cost += quantity * current.unit_cost;
      });

      // 5. Estructurar para el Frontend (Array de Proveedores)
      const suppliersMap = new Map<string, SupplierOrder>();

      Array.from(itemsMap.values()).forEach(item => {
        if (!suppliersMap.has(item.supplier)) {
          suppliersMap.set(item.supplier, {
            supplier: item.supplier,
            items: [],
            total_supplier_cost: 0
          });
        }
        const supplierGroup = suppliersMap.get(item.supplier)!;
        supplierGroup.items.push(item);
        supplierGroup.total_supplier_cost += item.total_cost;
      });

      return Array.from(suppliersMap.values());
    }
  });
};
