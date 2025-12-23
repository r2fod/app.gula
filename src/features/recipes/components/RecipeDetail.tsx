import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ChefHat, 
  Euro, 
  Percent, 
  TrendingUp, 
  Users,
  Package,
  Edit,
  X,
  Calculator,
  PieChart
} from "lucide-react";
import { Recipe, RecipeItem, RECIPE_CATEGORIES } from "../hooks/useRecipes";
import { cn } from "@/lib/utils";

interface RecipeDetailProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
}

export function RecipeDetail({ recipe, open, onClose, onEdit }: RecipeDetailProps) {
  if (!recipe) return null;

  const categoryLabel = RECIPE_CATEGORIES.find(c => c.value === recipe.category)?.label || recipe.category;
  const profit = recipe.selling_price - recipe.base_cost;
  const profitPercent = recipe.selling_price > 0 ? (profit / recipe.selling_price) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/30">
          {recipe.photo_url ? (
            <img 
              src={recipe.photo_url} 
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-24 h-24 text-primary/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-4 left-6 right-6">
            <Badge variant="secondary" className="mb-2">{categoryLabel}</Badge>
            <h2 className="text-2xl font-bold text-foreground">{recipe.name}</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-muted/30 border-none">
              <CardContent className="p-4 text-center">
                <Euro className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Coste Base</p>
                <p className="text-xl font-bold">{recipe.base_cost.toFixed(2)}€</p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/10 border-none">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">PVP</p>
                <p className="text-xl font-bold text-primary">{recipe.selling_price.toFixed(2)}€</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-500/10 border-none">
              <CardContent className="p-4 text-center">
                <Percent className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <p className="text-xs text-muted-foreground">Margen</p>
                <p className="text-xl font-bold text-green-600">{recipe.margin_percent}%</p>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-500/10 border-none">
              <CardContent className="p-4 text-center">
                <Calculator className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <p className="text-xs text-muted-foreground">Beneficio</p>
                <p className="text-xl font-bold text-amber-600">+{profit.toFixed(2)}€</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional info */}
          {recipe.portions > 1 && (
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{recipe.portions} raciones</p>
                <p className="text-sm text-muted-foreground">
                  {(recipe.base_cost / recipe.portions).toFixed(2)}€ coste/ración • 
                  {(recipe.selling_price / recipe.portions).toFixed(2)}€ PVP/ración
                </p>
              </div>
            </div>
          )}

          {/* Ingredients table */}
          {recipe.items && recipe.items.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="w-5 h-5" />
                  Ingredientes ({recipe.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Ingrediente</th>
                        <th className="text-right p-3 font-medium">Cantidad</th>
                        <th className="text-right p-3 font-medium">€/Unidad</th>
                        <th className="text-right p-3 font-medium">Coste</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipe.items.map((item, index) => (
                        <tr key={item.id || index} className="border-t border-border/50">
                          <td className="p-3">
                            <span className="font-medium">{item.ingredient_name}</span>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>
                            )}
                          </td>
                          <td className="text-right p-3 text-muted-foreground">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="text-right p-3 text-muted-foreground">
                            {item.unit_cost.toFixed(2)}€
                          </td>
                          <td className="text-right p-3 font-medium">
                            {item.line_cost.toFixed(2)}€
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/30">
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-semibold">Total Coste:</td>
                        <td className="p-3 text-right font-bold text-lg">{recipe.base_cost.toFixed(2)}€</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost breakdown visual */}
          {recipe.items && recipe.items.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="w-5 h-5" />
                  Distribución de Costes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recipe.items
                    .sort((a, b) => b.line_cost - a.line_cost)
                    .slice(0, 5)
                    .map((item, index) => {
                      const percentage = recipe.base_cost > 0 
                        ? (item.line_cost / recipe.base_cost) * 100 
                        : 0;
                      const colors = [
                        "bg-primary",
                        "bg-blue-500",
                        "bg-green-500",
                        "bg-amber-500",
                        "bg-purple-500"
                      ];
                      return (
                        <div key={item.id || index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="truncate flex-1">{item.ingredient_name}</span>
                            <span className="ml-2 font-medium">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full transition-all", colors[index % colors.length])}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {recipe.notes && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Notas</p>
              <p className="text-sm text-muted-foreground">{recipe.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cerrar
            </Button>
            <Button onClick={() => { onEdit(recipe); onClose(); }} className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
