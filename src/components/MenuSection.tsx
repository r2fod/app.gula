import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Wine, Cake, Baby, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuSectionProps {
  eventId: string;
}

interface MenuItem {
  id?: string;
  name: string;
  description: string;
  category: string;
}

const MenuSection = ({ eventId }: MenuSectionProps) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MenuItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();

    // Suscripción en tiempo real para menu_items
    const channel = supabase
      .channel(`menu-items-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          console.log('🔄 Cambio detectado en menú, recargando...');
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order");

    if (data) {
      setItems(data);
      setFormData(data);
    }
  };

  const handleSave = async () => {
    const existingIds = formData.filter(i => i.id).map(i => i.id);
    const toDelete = items.filter(i => i.id && !existingIds.includes(i.id));
    
    if (toDelete.length > 0) {
      await supabase.from("menu_items").delete().in("id", toDelete.map(i => i.id!));
    }

    for (const item of formData) {
      if (item.id) {
        await supabase.from("menu_items").update(item).eq("id", item.id);
      } else {
        await supabase.from("menu_items").insert({ ...item, event_id: eventId });
      }
    }

    toast({ title: "Guardado", description: "Menú actualizado" });
    setIsEditing(false);
    fetchItems();
  };

  const addItem = (category: string) => {
    setFormData([...formData, { name: "", description: "", category }]);
  };

  const removeItem = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof MenuItem, value: string) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const renderItems = (category: string) => {
    const categoryItems = (isEditing ? formData : items).filter(i => i.category === category);
    
    return (
      <div className="space-y-3">
        {categoryItems.map((item, index) => {
          const globalIndex = (isEditing ? formData : items).findIndex(i => i === item);
          return (
            <div key={item.id || globalIndex} className="p-3 rounded-lg bg-background/50">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre del plato"
                      value={item.name}
                      onChange={(e) => updateItem(globalIndex, "name", e.target.value)}
                    />
                    <Button size="icon" variant="destructive" onClick={() => removeItem(globalIndex)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Descripción"
                    value={item.description}
                    onChange={(e) => updateItem(globalIndex, "description", e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="font-semibold text-foreground">{item.name}</div>
                  {item.description && <div className="text-sm text-muted-foreground mt-1">{item.description}</div>}
                </>
              )}
            </div>
          );
        })}
        {isEditing && (
          <Button onClick={() => addItem(category)} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Plato
          </Button>
        )}
      </div>
    );
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Menú</h2>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setFormData(items); }}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="cocktail" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="cocktail"><Wine className="w-4 h-4 mr-2" />Cocktail</TabsTrigger>
          <TabsTrigger value="banquet"><UtensilsCrossed className="w-4 h-4 mr-2" />Banquete</TabsTrigger>
          <TabsTrigger value="dessert"><Cake className="w-4 h-4 mr-2" />Postres</TabsTrigger>
          <TabsTrigger value="children"><Baby className="w-4 h-4 mr-2" />Infantil</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cocktail">
          <Card className="bg-section-menu border-none shadow-soft">
            <div className="p-6">{renderItems("cocktail")}</div>
          </Card>
        </TabsContent>
        
        <TabsContent value="banquet">
          <Card className="bg-section-menu border-none shadow-soft">
            <div className="p-6">{renderItems("banquet")}</div>
          </Card>
        </TabsContent>
        
        <TabsContent value="dessert">
          <Card className="bg-section-menu border-none shadow-soft">
            <div className="p-6">{renderItems("dessert")}</div>
          </Card>
        </TabsContent>
        
        <TabsContent value="children">
          <Card className="bg-section-menu border-none shadow-soft">
            <div className="p-6">{renderItems("children")}</div>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default MenuSection;
