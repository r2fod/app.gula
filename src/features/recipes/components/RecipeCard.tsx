import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChefHat, 
  Euro, 
  Percent, 
  TrendingUp, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Recipe, RECIPE_CATEGORIES } from "../hooks/useRecipes";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onView, onEdit, onDelete }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);

  const categoryLabel = RECIPE_CATEGORIES.find(c => c.value === recipe.category)?.label || recipe.category;
  
  const profit = recipe.selling_price - recipe.base_cost;
  const profitPercent = recipe.selling_price > 0 ? (profit / recipe.selling_price) * 100 : 0;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      cocktail: "bg-pink-500/10 text-pink-600 border-pink-500/20",
      entrante: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      principal: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      postre: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      corner: "bg-green-500/10 text-green-600 border-green-500/20",
      paella: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      otros: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };
    return colors[category] || colors.otros;
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30"
      onClick={() => onView(recipe)}
    >
      {/* Image/Placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-primary/5 to-primary/20 overflow-hidden">
        {recipe.photo_url && !imageError ? (
          <img 
            src={recipe.photo_url} 
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-primary/20" />
          </div>
        )}
        
        {/* Category badge */}
        <Badge 
          variant="outline" 
          className={cn("absolute top-3 left-3 backdrop-blur-sm", getCategoryColor(recipe.category))}
        >
          {categoryLabel}
        </Badge>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(recipe); }}>
              <Eye className="h-4 w-4 mr-2" /> Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(recipe); }}>
              <Edit className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(recipe.id!); }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status indicator */}
        {!recipe.is_active && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="secondary">Inactivo</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 leading-tight min-h-[2.5rem]">
          {recipe.name}
        </h3>

        {/* Cost breakdown */}
        <div className="grid grid-cols-2 gap-2">
          {/* Base cost */}
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
              <Euro className="w-3 h-3" />
              <span>Coste</span>
            </div>
            <p className="font-bold text-foreground">
              {recipe.base_cost.toFixed(2)}€
            </p>
          </div>

          {/* Selling price */}
          <div className="bg-primary/10 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>PVP</span>
            </div>
            <p className="font-bold text-primary">
              {recipe.selling_price.toFixed(2)}€
            </p>
          </div>
        </div>

        {/* Margin indicator */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Percent className="w-3.5 h-3.5" />
            <span>Margen: {recipe.margin_percent}%</span>
          </div>
          <span className={cn(
            "font-medium",
            profitPercent >= 30 ? "text-green-600" : profitPercent >= 20 ? "text-amber-600" : "text-red-600"
          )}>
            +{profit.toFixed(2)}€
          </span>
        </div>

        {/* Portions */}
        {recipe.portions > 1 && (
          <p className="text-xs text-muted-foreground">
            {recipe.portions} raciones • {(recipe.selling_price / recipe.portions).toFixed(2)}€/ración
          </p>
        )}
      </CardContent>
    </Card>
  );
}
