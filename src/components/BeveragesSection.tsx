import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Save, X, Plus, Trash2, Wine, Beer, GlassWater } from "lucide-react";

interface BeveragesSectionProps {
  eventId: string;
  totalGuests: number;
}

interface Beverage {
  id?: string;
  category: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  is_extra?: boolean;
}

const CATEGORIES = [
  { key: 'aperitivo', label: 'Aperitivo/Comida', icon: Wine },
  { key: 'copas', label: 'Barra Copas', icon: GlassWater },
  { key: 'refrescos', label: 'Refrescos', icon: Beer },
];

export default function BeveragesSection({ eventId, totalGuests }: BeveragesSectionProps) {
  const { toast } = useToast();
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Beverage[]>([]);

  useEffect(() => {
    fetchBeverages();
  }, [eventId]);

  const fetchBeverages = async () => {
    const { data, error } = await supabase
      .from("beverages")
      .select("*")
      .eq("event_id", eventId)
      .order("category", { ascending: true });

    if (!error && data) {
      setBeverages(data);
      setFormData(data);
    }
  };

  const handleSave = async () => {
    const existingIds = beverages.map(b => b.id).filter(Boolean);
    const newIds = formData.map(b => b.id).filter(Boolean);
    const toDelete = existingIds.filter(id => !newIds.includes(id));

    for (const id of toDelete) {
      await supabase.from("beverages").delete().eq("id", id);
    }

    for (const item of formData) {
      const record = {
        event_id: eventId,
        category: item.category,
        item_name: item.item_name,
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        notes: item.notes || null,
        is_extra: item.is_extra || false,
      };

      if (item.id) {
        await supabase.from("beverages").update(record).eq("id", item.id);
      } else {
        await supabase.from("beverages").insert(record);
      }
    }

    toast({ title: "Bebidas guardadas" });
    setIsEditing(false);
    fetchBeverages();
  };

  const addItem = (category: string) => {
    setFormData([...formData, { category, item_name: "", quantity: 0, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Beverage, value: any) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const calculateTotal = (category: string) => {
    return formData
      .filter(b => b.category === category)
      .reduce((sum, b) => sum + (b.quantity * b.unit_price), 0);
  };

  const calculatePricePerPerson = (category: string) => {
    const total = calculateTotal(category);
    return totalGuests > 0 ? (total / totalGuests).toFixed(2) : "0.00";
  };

  const renderItems = (category: string) => {
    const items = formData.filter(b => b.category === category);
    
    if (!isEditing && items.length === 0) {
      return <p className="text-muted-foreground text-sm py-4">No hay bebidas configuradas</p>;
    }

    return (
      <div className="space-y-2">
        {items.map((item, idx) => {
          const globalIndex = formData.findIndex(b => b === item);
          const total = item.quantity * item.unit_price;
          
          return isEditing ? (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-4"
                placeholder="Nombre"
                value={item.item_name}
                onChange={(e) => updateItem(globalIndex, "item_name", e.target.value)}
              />
              <Input
                className="col-span-2"
                type="number"
                placeholder="Cantidad"
                value={item.quantity || ""}
                onChange={(e) => updateItem(globalIndex, "quantity", parseInt(e.target.value) || 0)}
              />
              <Input
                className="col-span-2"
                type="number"
                step="0.01"
                placeholder="€/ud"
                value={item.unit_price || ""}
                onChange={(e) => updateItem(globalIndex, "unit_price", parseFloat(e.target.value) || 0)}
              />
              <span className="col-span-2 text-sm font-medium">{total.toFixed(2)}€</span>
              <Button
                variant="ghost"
                size="icon"
                className="col-span-1"
                onClick={() => removeItem(globalIndex)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ) : (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="font-medium">{item.item_name}</span>
              <div className="flex gap-4 text-sm">
                <span>{item.quantity} ud</span>
                <span className="text-muted-foreground">{item.unit_price}€/ud</span>
                <span className="font-semibold">{total.toFixed(2)}€</span>
              </div>
            </div>
          );
        })}
        
        {isEditing && (
          <Button variant="outline" size="sm" onClick={() => addItem(category)} className="mt-2">
            <Plus className="h-4 w-4 mr-1" /> Añadir
          </Button>
        )}
        
        <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm font-semibold">
          <span>Total {CATEGORIES.find(c => c.key === category)?.label}</span>
          <div className="flex gap-4">
            <span>{calculateTotal(category).toFixed(2)}€</span>
            <span className="text-primary">{calculatePricePerPerson(category)}€/pax</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-section-supplies">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wine className="h-5 w-5 text-primary" />
          Bebidas y Barra Libre
        </CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setFormData(beverages); }}>
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Guardar
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-1" /> Editar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="aperitivo">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map(cat => (
            <TabsContent key={cat.key} value={cat.key}>
              {renderItems(cat.key)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
