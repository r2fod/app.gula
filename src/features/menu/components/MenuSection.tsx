import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Wine, Cake, Baby, Edit, Save, X, Plus, Trash2, Loader2 } from "lucide-react";
import { useMenu } from "../hooks/useMenu";

interface MenuSectionProps {
  eventId: string;
}

/**
 * Sección de Menú del evento.
 * Permite gestionar los platos divididos por categorías (Cocktail, Banquete, etc).
 * Utiliza el hook useMenu para sincronización con Supabase y React Query.
 */
const MenuSection = ({ eventId }: MenuSectionProps) => {
  const {
    items,
    formData,
    loading,
    isEditing,
    setIsEditing,
    addItem,
    removeItem,
    updateItem,
    handleSave,
    isSaving
  } = useMenu(eventId);

  const renderItems = (category: string) => {
    // Usamos formData si estamos editando para mostrar cambios locales, si no, items de la base de datos.
    const categoryItems = (isEditing ? formData : items).filter(i => i.category === category);

    if (!isEditing && categoryItems.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground italic">
          No hay platos configurados en esta categoría.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {categoryItems.map((item, index) => {
          // Buscamos el índice global en el array correspondiente para las funciones de edición
          const currentArray = isEditing ? formData : items;
          const globalIndex = currentArray.findIndex(i => i === item);

          return (
            <div key={item.id || `new-${index}`} className="p-4 rounded-lg bg-background/50 border border-border/40 hover:border-primary/20 transition-colors">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre del plato"
                      value={item.name}
                      onChange={(e) => updateItem(globalIndex, "name", e.target.value)}
                      className="font-semibold"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(globalIndex)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Descripción detallada del plato..."
                    value={item.description}
                    onChange={(e) => updateItem(globalIndex, "description", e.target.value)}
                    className="text-sm resize-none"
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <div className="font-semibold text-foreground text-lg">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {item.description}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {isEditing && (
          <Button
            onClick={() => addItem(category)}
            variant="outline"
            size="sm"
            className="w-full border-dashed hover:border-primary hover:text-primary transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Plato a {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando menú del evento...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Menú del Evento</h2>
          <p className="text-muted-foreground text-sm">Configura los platos que se servirán en cada fase.</p>
        </div>

        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)} className="shadow-sm">
            <Edit className="w-4 h-4 mr-2" />
            Editar Menú
          </Button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="cocktail" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="cocktail" className="data-[state=active]:bg-background">
            <Wine className="w-4 h-4 mr-2 text-primary" />Cocktail
          </TabsTrigger>
          <TabsTrigger value="banquet" className="data-[state=active]:bg-background">
            <UtensilsCrossed className="w-4 h-4 mr-2 text-primary" />Banquete
          </TabsTrigger>
          <TabsTrigger value="dessert" className="data-[state=active]:bg-background">
            <Cake className="w-4 h-4 mr-2 text-primary" />Postres
          </TabsTrigger>
          <TabsTrigger value="children" className="data-[state=active]:bg-background">
            <Baby className="w-4 h-4 mr-2 text-primary" />Infantil
          </TabsTrigger>
        </TabsList>

        {["cocktail", "banquet", "dessert", "children"].map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-0 animate-in fade-in-50 duration-500">
            <Card className="bg-section-menu border-none shadow-soft overflow-hidden">
              <div className="p-6">
                {renderItems(cat)}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};

export default MenuSection;
