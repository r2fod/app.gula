// ------------------------------------------------------------------
// Archivo: recipeCalculations.ts
// Descripción: Servicio de utilidades para cálculos de recetas y escandallos.
// Maneja lógica de negocio pura: costes, márgenes, IVA y escalado por PAX.
// ------------------------------------------------------------------

export interface RecipeItemCalculation {
  unit_cost: number;
  quantity: number;
  waste_percentage?: number; // Informativo, no afecta coste
}

/**
 * Calcula el coste total de una lista de ingredientes.
 * @param items Lista de items con coste unitario y cantidad.
 */
export const calculateDishCost = (items: RecipeItemCalculation[]): number => {
  return items.reduce((total, item) => {
    return total + (item.unit_cost * item.quantity);
  }, 0);
};

/**
 * Calcula el Precio de Venta Recomendado (PVR) basado en el coste y margen deseado.
 * Fórmula: Coste / (1 - Margen)
 * Ejemplo: Coste 10€, Margen 20% (0.2) -> 10 / 0.8 = 12.5€
 * @param cost Coste total del plato
 * @param marginPorcentaje Margen de beneficio (0 a 1, ej. 0.20 para 20%)
 */
export const calculatePriceWithMargin = (cost: number, marginPorcentaje: number): number => {
  if (marginPorcentaje >= 1) return 0; // Evitar división por cero o negativa
  return cost / (1 - marginPorcentaje);
};

/**
 * Calcula el importe del IVA para un precio dado.
 * @param price Precio base
 * @param rate Tipo de IVA (ej. 0.10 o 0.21)
 */
export const calculateVAT = (price: number, rate: number = 0.10): number => {
  return price * rate;
};

/**
 * Escala una cantidad base a un número objetivo de comensales (PAX).
 * @param baseValue Valor a escalar (cantidad o coste)
 * @param basePortions Raciones para las que está definida la receta base
 * @param targetPax Número de comensales objetivo
 */
export const scaleToPax = (baseValue: number, basePortions: number, targetPax: number): number => {
  if (basePortions <= 0) return 0;
  return (baseValue / basePortions) * targetPax;
};
