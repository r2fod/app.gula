import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Ingredient {
  id?: string;
  code?: string;
  name: string;
  package_quantity: number;
  unit: string;
  package_cost: number;
  unit_cost: number;
  supplier?: string;
  photo_url?: string;
  notes?: string;
}

export interface RecipeItem {
  id?: string;
  ingredient_id?: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  line_cost: number;
  notes?: string;
  sort_order?: number;
}

export interface Recipe {
  id?: string;
  name: string;
  category: string;
  portions: number;
  base_cost: number;
  margin_percent: number;
  selling_price: number;
  photo_url?: string;
  notes?: string;
  is_active: boolean;
  items?: RecipeItem[];
}

export const RECIPE_CATEGORIES = [
  { value: "cocktail", label: "Cóctel" },
  { value: "entrante", label: "Entrante" },
  { value: "principal", label: "Principal" },
  { value: "postre", label: "Postre" },
  { value: "corner", label: "Corner" },
  { value: "paella", label: "Paella/Arroz" },
  { value: "otros", label: "Otros" },
];

export const useRecipes = () => {
  const { user, isDemo } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all recipes
  const { data: recipes = [], isLoading: loadingRecipes } = useQuery({
    queryKey: ["recipes", isDemo],
    queryFn: async () => {
      if (isDemo) {
        const saved = localStorage.getItem("gula_demo_recipes");
        return saved ? JSON.parse(saved) : [];
      }
      if (!user) return [];

      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data as Recipe[];
    },
    enabled: !!user || isDemo,
  });

  // Fetch all ingredients
  const { data: ingredients = [], isLoading: loadingIngredients } = useQuery({
    queryKey: ["ingredients", isDemo],
    queryFn: async () => {
      if (isDemo) {
        const saved = localStorage.getItem("gula_demo_ingredients");
        return saved ? JSON.parse(saved) : [];
      }
      if (!user) return [];

      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data as Ingredient[];
    },
    enabled: !!user || isDemo,
  });

  // Fetch recipe with items
  const fetchRecipeWithItems = async (recipeId: string): Promise<Recipe | null> => {
    if (isDemo) {
      const saved = localStorage.getItem("gula_demo_recipes");
      const recipes = saved ? JSON.parse(saved) : [];
      return recipes.find((r: Recipe) => r.id === recipeId) || null;
    }

    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", recipeId)
      .maybeSingle();

    if (recipeError) throw recipeError;
    if (!recipe) return null;

    const { data: items, error: itemsError } = await supabase
      .from("recipe_items")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("sort_order");

    if (itemsError) throw itemsError;

    return { ...recipe, items: items || [] } as Recipe;
  };

  // Create recipe mutation
  const createRecipe = useMutation({
    mutationFn: async (recipe: Omit<Recipe, "id">) => {
      if (isDemo) {
        const newRecipe = { ...recipe, id: crypto.randomUUID() };
        const saved = localStorage.getItem("gula_demo_recipes");
        const recipes = saved ? JSON.parse(saved) : [];
        recipes.push(newRecipe);
        localStorage.setItem("gula_demo_recipes", JSON.stringify(recipes));
        return newRecipe;
      }

      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("recipes")
        .insert({
          user_id: user.id,
          name: recipe.name,
          category: recipe.category,
          portions: recipe.portions,
          base_cost: recipe.base_cost,
          margin_percent: recipe.margin_percent,
          selling_price: recipe.selling_price,
          photo_url: recipe.photo_url,
          notes: recipe.notes,
          is_active: recipe.is_active,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert recipe items
      if (recipe.items && recipe.items.length > 0) {
        const itemsToInsert = recipe.items.map((item, index) => ({
          recipe_id: data.id,
          ingredient_id: item.ingredient_id || null,
          ingredient_name: item.ingredient_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unit_cost,
          line_cost: item.line_cost,
          notes: item.notes,
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from("recipe_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast({ title: "Receta creada", description: "El escandallo se ha guardado correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update recipe mutation
  const updateRecipe = useMutation({
    mutationFn: async ({ id, ...recipe }: Recipe) => {
      if (isDemo) {
        const saved = localStorage.getItem("gula_demo_recipes");
        let recipes = saved ? JSON.parse(saved) : [];
        recipes = recipes.map((r: Recipe) => (r.id === id ? { ...r, ...recipe } : r));
        localStorage.setItem("gula_demo_recipes", JSON.stringify(recipes));
        return { id, ...recipe };
      }

      if (!user) throw new Error("Usuario no autenticado");

      const { error } = await supabase
        .from("recipes")
        .update({
          name: recipe.name,
          category: recipe.category,
          portions: recipe.portions,
          base_cost: recipe.base_cost,
          margin_percent: recipe.margin_percent,
          selling_price: recipe.selling_price,
          photo_url: recipe.photo_url,
          notes: recipe.notes,
          is_active: recipe.is_active,
        })
        .eq("id", id);

      if (error) throw error;

      // Delete existing items and re-insert
      await supabase.from("recipe_items").delete().eq("recipe_id", id);

      if (recipe.items && recipe.items.length > 0) {
        const itemsToInsert = recipe.items.map((item, index) => ({
          recipe_id: id,
          ingredient_id: item.ingredient_id || null,
          ingredient_name: item.ingredient_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unit_cost,
          line_cost: item.line_cost,
          notes: item.notes,
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from("recipe_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return { id, ...recipe };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast({ title: "Receta actualizada", description: "Los cambios se han guardado" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete recipe mutation
  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        const saved = localStorage.getItem("gula_demo_recipes");
        let recipes = saved ? JSON.parse(saved) : [];
        recipes = recipes.filter((r: Recipe) => r.id !== id);
        localStorage.setItem("gula_demo_recipes", JSON.stringify(recipes));
        return;
      }

      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast({ title: "Receta eliminada" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create ingredient mutation
  const createIngredient = useMutation({
    mutationFn: async (ingredient: Omit<Ingredient, "id">) => {
      if (isDemo) {
        const newIngredient = { ...ingredient, id: crypto.randomUUID() };
        const saved = localStorage.getItem("gula_demo_ingredients");
        const ingredients = saved ? JSON.parse(saved) : [];
        ingredients.push(newIngredient);
        localStorage.setItem("gula_demo_ingredients", JSON.stringify(ingredients));
        return newIngredient;
      }

      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("ingredients")
        .insert({ ...ingredient, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      toast({ title: "Ingrediente creado" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Calculate recipe cost
  const calculateRecipeCost = (items: RecipeItem[]): number => {
    return items.reduce((sum, item) => sum + (item.line_cost || 0), 0);
  };

  // Calculate selling price with margin
  const calculateSellingPrice = (baseCost: number, marginPercent: number): number => {
    if (marginPercent >= 100) return baseCost * 2;
    return baseCost / (1 - marginPercent / 100);
  };

  return {
    recipes,
    ingredients,
    loadingRecipes,
    loadingIngredients,
    fetchRecipeWithItems,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    createIngredient,
    calculateRecipeCost,
    calculateSellingPrice,
  };
};
