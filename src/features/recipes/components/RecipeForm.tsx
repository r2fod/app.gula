import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Calculator, Save, X, Upload } from "lucide-react";
import { Recipe, RecipeItem, Ingredient, RECIPE_CATEGORIES, useRecipes } from "../hooks/useRecipes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecipeFormProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, "id"> | Recipe) => void;
  ingredients: Ingredient[];
}

const emptyItem: RecipeItem = {
  ingredient_name: "",
  quantity: 0,
  unit: "KG",
  unit_cost: 0,
  line_cost: 0,
};

export function RecipeForm({ recipe, open, onClose, onSave, ingredients }: RecipeFormProps) {
  const { toast } = useToast();
  const { calculateRecipeCost, calculateSellingPrice } = useRecipes();

  const [formData, setFormData] = useState<Omit<Recipe, "id">>({
    name: "",
    category: "cocktail",
    portions: 1,
    base_cost: 0,
    margin_percent: 40,
    selling_price: 0,
    photo_url: "",
    model_3d_url: "",
    notes: "",
    is_active: true,
    items: [],
  });

  const [items, setItems] = useState<RecipeItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        category: recipe.category,
        portions: recipe.portions,
        base_cost: recipe.base_cost,
        margin_percent: recipe.margin_percent,
        selling_price: recipe.selling_price,
        photo_url: recipe.photo_url || "",
        model_3d_url: recipe.model_3d_url || "",
        notes: recipe.notes || "",
        is_active: recipe.is_active,
        items: recipe.items || [],
      });
      setItems(recipe.items || []);
    } else {
      setFormData({
        name: "",
        category: "cocktail",
        portions: 1,
        base_cost: 0,
        margin_percent: 40,
        selling_price: 0,
        photo_url: "",
        model_3d_url: "",
        notes: "",
        is_active: true,
        items: [],
      });
      setItems([]);
    }
  }, [recipe, open]);

  const handleAddItem = () => {
    setItems([...items, { ...emptyItem }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RecipeItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate line cost
    if (field === "quantity" || field === "unit_cost") {
      updated[index].line_cost = updated[index].quantity * updated[index].unit_cost;
    }

    // If selecting from ingredient list, auto-fill data
    if (field === "ingredient_name") {
      const selectedIngredient = ingredients.find(i => i.name === value);
      if (selectedIngredient) {
        updated[index].unit = selectedIngredient.unit;
        updated[index].unit_cost = selectedIngredient.unit_cost;
        updated[index].ingredient_id = selectedIngredient.id;
        updated[index].line_cost = updated[index].quantity * selectedIngredient.unit_cost;
      }
    }

    setItems(updated);
    recalculateTotals(updated);
  };

  const recalculateTotals = (currentItems: RecipeItem[]) => {
    const baseCost = calculateRecipeCost(currentItems);
    const sellingPrice = calculateSellingPrice(baseCost, formData.margin_percent);
    setFormData(prev => ({
      ...prev,
      base_cost: baseCost,
      selling_price: sellingPrice,
    }));
  };

  const handleMarginChange = (margin: number) => {
    const sellingPrice = calculateSellingPrice(formData.base_cost, margin);
    setFormData(prev => ({
      ...prev,
      margin_percent: margin,
      selling_price: sellingPrice,
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `recipe-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('menus').upload(fileName, file);

    if (error) {
      toast({ title: "Error", description: "No se pudo subir la imagen", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('menus').getPublicUrl(fileName);
    setFormData(prev => ({ ...prev, photo_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Solo permitir archivos .glb o .gltf
    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      toast({ title: "Error", description: "Solo se admiten archivos .glb o .gltf", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `model-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('menus').upload(fileName, file);

    if (error) {
      toast({ title: "Error", description: "No se pudo subir el modelo 3D", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('menus').getPublicUrl(fileName);
    setFormData(prev => ({ ...prev, model_3d_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" });
      return;
    }

    const recipeData = {
      ...formData,
      items,
    };

    if (recipe?.id) {
      onSave({ ...recipeData, id: recipe.id });
    } else {
      onSave(recipeData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe ? "Editar Escandallo" : "Nuevo Escandallo"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del Plato *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Paella Valenciana"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECIPE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Raciones</Label>
              <Input
                type="number"
                min="1"
                value={formData.portions}
                onChange={(e) => setFormData({ ...formData, portions: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Foto</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="URL de imagen..."
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <Button variant="outline" size="icon" asChild disabled={uploading}>
                    <span>
                      <Upload className="h-4 w-4" />
                    </span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Modelo 3D (URL .glb)</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.model_3d_url}
                  onChange={(e) => setFormData({ ...formData, model_3d_url: e.target.value })}
                  placeholder="https://ejemplo.com/modelo.glb"
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <Button variant="outline" size="icon" asChild disabled={uploading}>
                    <span>
                      <Upload className="h-4 w-4" />
                    </span>
                  </Button>
                  <input type="file" accept=".glb,.gltf" className="hidden" onChange={handleModelUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Ingredientes</h3>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-1" /> Añadir
                </Button>
              </div>

              {items.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No hay ingredientes. Añade ingredientes para calcular el coste.
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Header */}
                  <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase px-2">
                    <span className="col-span-4">Ingrediente</span>
                    <span className="col-span-2 text-right">Cantidad</span>
                    <span className="col-span-2">Unidad</span>
                    <span className="col-span-2 text-right">€/Unidad</span>
                    <span className="col-span-1 text-right">Coste</span>
                    <span className="col-span-1"></span>
                  </div>

                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-muted/30 rounded-lg">
                      <div className="col-span-12 md:col-span-4">
                        <Input
                          list="ingredients-list"
                          value={item.ingredient_name}
                          onChange={(e) => handleItemChange(index, "ingredient_name", e.target.value)}
                          placeholder="Nombre ingrediente"
                          className="h-9"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Input
                          type="number"
                          step="0.001"
                          value={item.quantity || ""}
                          onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                          className="h-9 text-right"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Select
                          value={item.unit}
                          onValueChange={(value) => handleItemChange(index, "unit", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="GR">GR</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="ML">ML</SelectItem>
                            <SelectItem value="UNID">UNID</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_cost || ""}
                          onChange={(e) => handleItemChange(index, "unit_cost", parseFloat(e.target.value) || 0)}
                          className="h-9 text-right"
                        />
                      </div>
                      <div className="hidden md:block col-span-1 text-right font-medium">
                        {item.line_cost.toFixed(2)}€
                      </div>
                      <div className="col-span-12 md:col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <datalist id="ingredients-list">
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.name} />
                    ))}
                  </datalist>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Cálculo de Precios</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Coste Base</Label>
                  <div className="text-2xl font-bold">{formData.base_cost.toFixed(2)}€</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Margen (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.margin_percent}
                    onChange={(e) => handleMarginChange(parseInt(e.target.value) || 0)}
                    className="text-lg font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Precio Venta</Label>
                  <div className="text-2xl font-bold text-primary">{formData.selling_price.toFixed(2)}€</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Beneficio</Label>
                  <div className="text-2xl font-bold text-green-600">
                    +{(formData.selling_price - formData.base_cost).toFixed(2)}€
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones, instrucciones especiales..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
