import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  Filter,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeDetail } from "@/features/recipes/components/RecipeDetail";
import { RecipeForm } from "@/features/recipes/components/RecipeForm";
import { useRecipes, Recipe, RECIPE_CATEGORIES } from "@/features/recipes/hooks/useRecipes";
import { useAuth } from "@/contexts/AuthContext";
import { RoleGuard, RoleBadge } from "@/components/RoleGuard";
import { useRole } from "@/contexts/RoleContext";
import { useAI } from "@/contexts/AIContext";
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
  const { hasPermission, role } = useRole();
  const { setIsAssistantOpen } = useAI();
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

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10">
                <Link to="/events">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <ChefHat className="w-8 h-8 text-primary" />
                  Escandallos
                  <RoleBadge />
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gestiona las recetas y costes de tus platos
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild className="hover:bg-primary/15 transition-colors">
                <Link to="/ingredientes">
                  <Package className="w-4 h-4 mr-2" />
                  Ver Ingredientes
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="hover:shadow-md transition-all"
                onClick={() => {
                  const assistantButton = document.querySelector('button.fixed.bottom-6.right-6') as HTMLButtonElement;
                  if (assistantButton) assistantButton.click();
                }}
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Cerebro Gula
              </Button>
              <RoleGuard resource="recipes" action="create">
                <Button onClick={() => { setEditingRecipe(null); setShowForm(true); }} size="lg" className="hover:scale-105 transition-transform shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Nuevo Escandallo
                </Button>
              </RoleGuard>
            </div>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { icon: Package, value: stats.totalRecipes, label: "Recetas", color: "text-primary", bg: "bg-primary/10" },
              { icon: Euro, value: `${stats.totalValue.toFixed(0)}€`, label: "Valor Total", color: "text-green-600", bg: "bg-green-500/10" },
              { icon: TrendingUp, value: `${stats.avgMargin.toFixed(0)}%`, label: "Margen Medio", color: "text-amber-600", bg: "bg-amber-500/10" },
              { icon: ChefHat, value: stats.activeRecipes, label: "Activas", color: "text-blue-600", bg: "bg-blue-500/10" }
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${stat.bg} rounded-lg`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
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

            <div className="flex border rounded-lg p-1 bg-muted/50 border-border/50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="hover:bg-primary/10 transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="hover:bg-primary/10 transition-colors"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Category tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="mb-6">
              <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1 border-border/20">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  Todas
                </TabsTrigger>
                {RECIPE_CATEGORIES.map(cat => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Recipes grid/list */}
          {loadingRecipes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-72 animate-pulse bg-muted/50" />
              ))}
            </div>
          ) : filteredRecipes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-12 text-center bg-muted/30 border-dashed border-2">
                <ChefHat className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay recetas</h3>
                <p className="text-muted-foreground mb-4">
                  {search || categoryFilter !== "all"
                    ? "No se encontraron recetas con los filtros actuales"
                    : "Crea tu primer escandallo para calcular costes"
                  }
                </p>
                <Button onClick={() => setShowForm(true)} className="hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Escandallo
                </Button>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {filteredRecipes.map(recipe => (
                <motion.div key={recipe.id} variants={itemVariants}>
                  <RecipeCard
                    recipe={recipe}
                    onView={setSelectedRecipe}
                    onEdit={(r) => { setEditingRecipe(r); setShowForm(true); }}
                    onDelete={setDeleteId}
                  />
                </motion.div>
              ))}
            </motion.div>
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
