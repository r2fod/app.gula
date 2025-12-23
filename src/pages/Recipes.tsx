import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  ChefHat, 
  LayoutGrid, 
  List,
  Euro,
  TrendingUp,
  Package,
  Filter
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { SectionHeader } from "@/components/SectionHeader";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeDetail } from "@/features/recipes/components/RecipeDetail";
import { RecipeForm } from "@/features/recipes/components/RecipeForm";
import { useRecipes, Recipe, RECIPE_CATEGORIES } from "@/features/recipes/hooks/useRecipes";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Recipes() {
  const navigate = useNavigate();
  const { isDemo } = useAuth();
  const { 
    recipes, 
    ingredients,
    loadingRecipes, 
    createRecipe, 
    updateRecipe, 
    deleteRecipe 
  } = useRecipes();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || recipe.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, search, categoryFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalRecipes = recipes.length;
    const totalValue = recipes.reduce((sum, r) => sum + r.selling_price, 0);
    const avgMargin = recipes.length > 0 
      ? recipes.reduce((sum, r) => sum + r.margin_percent, 0) / recipes.length 
      : 0;
    const activeRecipes = recipes.filter(r => r.is_active).length;

    return { totalRecipes, totalValue, avgMargin, activeRecipes };
  }, [recipes]);

  const handleSave = (data: Omit<Recipe, "id"> | Recipe) => {
    if ("id" in data && data.id) {
      updateRecipe.mutate(data as Recipe);
    } else {
      createRecipe.mutate(data);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteRecipe.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <ChefHat className="w-8 h-8 text-primary" />
                Escandallos
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestiona las recetas y costes de tus platos
              </p>
            </div>
            <Button onClick={() => { setEditingRecipe(null); setShowForm(true); }} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Escandallo
            </Button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalRecipes}</p>
                    <p className="text-xs text-muted-foreground">Recetas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Euro className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalValue.toFixed(0)}€</p>
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.avgMargin.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Margen Medio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <ChefHat className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeRecipes}</p>
                    <p className="text-xs text-muted-foreground">Activas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recetas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {RECIPE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg p-1 bg-muted/50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Category tabs */}
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="mb-6">
            <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Todas
              </TabsTrigger>
              {RECIPE_CATEGORIES.map(cat => (
                <TabsTrigger 
                  key={cat.value} 
                  value={cat.value}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Recipes grid/list */}
          {loadingRecipes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-72 animate-pulse bg-muted/50" />
              ))}
            </div>
          ) : filteredRecipes.length === 0 ? (
            <Card className="p-12 text-center bg-muted/30">
              <ChefHat className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay recetas</h3>
              <p className="text-muted-foreground mb-4">
                {search || categoryFilter !== "all" 
                  ? "No se encontraron recetas con los filtros actuales"
                  : "Crea tu primer escandallo para calcular costes"
                }
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Escandallo
              </Button>
            </Card>
          ) : (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }>
              {filteredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onView={setSelectedRecipe}
                  onEdit={(r) => { setEditingRecipe(r); setShowForm(true); }}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail modal */}
        <RecipeDetail
          recipe={selectedRecipe}
          open={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onEdit={(r) => { setEditingRecipe(r); setShowForm(true); }}
        />

        {/* Form modal */}
        <RecipeForm
          recipe={editingRecipe}
          open={showForm}
          onClose={() => { setShowForm(false); setEditingRecipe(null); }}
          onSave={handleSave}
          ingredients={ingredients}
        />

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar receta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el escandallo y todos sus datos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
