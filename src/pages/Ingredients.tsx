import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search,
  Package,
  Euro,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useRecipes, Ingredient } from "@/features/recipes/hooks/useRecipes";
import { Link } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const emptyIngredient: Omit<Ingredient, "id"> = {
  code: "",
  name: "",
  package_quantity: 1,
  unit: "KG",
  package_cost: 0,
  unit_cost: 0,
  supplier: "",
  notes: "",
};

export default function Ingredients() {
  const { ingredients, loadingIngredients, createIngredient } = useRecipes();
  const { user, isDemo } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Ingredient, "id">>(emptyIngredient);

  // Filter ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ing =>
      ing.name.toLowerCase().includes(search.toLowerCase()) ||
      (ing.code?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  }, [ingredients, search]);

  // Stats
  const stats = useMemo(() => {
    const totalItems = ingredients.length;
    const totalValue = ingredients.reduce((sum, i) => sum + (i.package_cost || 0), 0);
    const avgUnitCost = ingredients.length > 0
      ? ingredients.reduce((sum, i) => sum + i.unit_cost, 0) / ingredients.length
      : 0;
    return { totalItems, totalValue, avgUnitCost };
  }, [ingredients]);

  const handleOpenForm = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({
        code: ingredient.code || "",
        name: ingredient.name,
        package_quantity: ingredient.package_quantity,
        unit: ingredient.unit,
        package_cost: ingredient.package_cost,
        unit_cost: ingredient.unit_cost,
        supplier: ingredient.supplier || "",
        notes: ingredient.notes || "",
      });
    } else {
      setEditingIngredient(null);
      setFormData(emptyIngredient);
    }
    setShowForm(true);
  };

  const handlePackageChange = (field: "package_quantity" | "package_cost", value: number) => {
    const newData = { ...formData, [field]: value };
    // Auto-calculate unit cost
    if (newData.package_quantity > 0) {
      newData.unit_cost = newData.package_cost / newData.package_quantity;
    }
    setFormData(newData);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" });
      return;
    }

    if (editingIngredient?.id) {
      // Update existing
      if (isDemo) {
        const saved = localStorage.getItem("gula_demo_ingredients");
        let ings = saved ? JSON.parse(saved) : [];
        ings = ings.map((i: Ingredient) => (i.id === editingIngredient.id ? { ...i, ...formData } : i));
        localStorage.setItem("gula_demo_ingredients", JSON.stringify(ings));
        queryClient.invalidateQueries({ queryKey: ["ingredients"] });
        toast({ title: "Ingrediente actualizado" });
      } else {
        const { error } = await supabase
          .from("ingredients")
          .update(formData)
          .eq("id", editingIngredient.id);

        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
          return;
        }
        queryClient.invalidateQueries({ queryKey: ["ingredients"] });
        toast({ title: "Ingrediente actualizado" });
      }
    } else {
      // Create new
      createIngredient.mutate(formData);
    }

    setShowForm(false);
    setEditingIngredient(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    if (isDemo) {
      const saved = localStorage.getItem("gula_demo_ingredients");
      let ings = saved ? JSON.parse(saved) : [];
      ings = ings.filter((i: Ingredient) => i.id !== deleteId);
      localStorage.setItem("gula_demo_ingredients", JSON.stringify(ings));
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      toast({ title: "Ingrediente eliminado" });
    } else {
      const { error } = await supabase.from("ingredients").delete().eq("id", deleteId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        queryClient.invalidateQueries({ queryKey: ["ingredients"] });
        toast({ title: "Ingrediente eliminado" });
      }
    }
    setDeleteId(null);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/escandallos">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Package className="w-8 h-8 text-primary" />
                  Catálogo de Ingredientes
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gestiona tu catálogo de productos y precios
                </p>
              </div>
            </div>
            <Button onClick={() => handleOpenForm()} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Ingrediente
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalItems}</p>
                    <p className="text-xs text-muted-foreground">Ingredientes</p>
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
                    <p className="text-xs text-muted-foreground">Valor Total Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Euro className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.avgUnitCost.toFixed(2)}€</p>
                    <p className="text-xs text-muted-foreground">Coste Medio/Unidad</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ingredientes por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loadingIngredients ? (
                <div className="p-8 text-center text-muted-foreground">Cargando...</div>
              ) : filteredIngredients.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay ingredientes</h3>
                  <p className="text-muted-foreground mb-4">
                    {search ? "No se encontraron ingredientes con ese nombre" : "Añade tu primer ingrediente al catálogo"}
                  </p>
                  <Button onClick={() => handleOpenForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Ingrediente
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-20">Código</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead className="text-right">Coste Envase</TableHead>
                        <TableHead className="text-right">Coste/Unidad</TableHead>
                        <TableHead className="w-24">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIngredients.map((ing) => (
                        <TableRow key={ing.id} className="hover:bg-muted/30">
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {ing.code || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{ing.name}</TableCell>
                          <TableCell className="text-right">{ing.package_quantity}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{ing.unit}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{ing.package_cost.toFixed(2)}€</TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {ing.unit_cost.toFixed(2)}€
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenForm(ing)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => setDeleteId(ing.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingIngredient ? "Editar Ingrediente" : "Nuevo Ingrediente"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="001"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre del ingrediente"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad por Envase</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.package_quantity || ""}
                    onChange={(e) => handlePackageChange("package_quantity", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidad</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coste del Envase (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.package_cost || ""}
                    onChange={(e) => handlePackageChange("package_cost", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coste por Unidad (€)</Label>
                  <div className="h-10 px-3 flex items-center bg-muted rounded-md font-semibold text-primary">
                    {formData.unit_cost.toFixed(2)}€/{formData.unit}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar ingrediente?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el ingrediente del catálogo.
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
