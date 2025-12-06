import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Save, X, Plus, Trash2, Boxes, ChefHat, Lamp, Armchair } from "lucide-react";

interface RoomEquipmentSectionProps {
  eventId: string;
}

interface Equipment {
  id?: string;
  category: string;
  item_name: string;
  quantity: string;
  notes?: string;
}

const CATEGORIES = [
  { key: 'sala', label: 'Sala', icon: Lamp },
  { key: 'cocina', label: 'Cocina', icon: ChefHat },
  { key: 'menaje', label: 'Menaje', icon: Boxes },
  { key: 'manteleria', label: 'Mantelería', icon: Armchair },
];

export default function RoomEquipmentSection({ eventId }: RoomEquipmentSectionProps) {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Equipment[]>([]);

  useEffect(() => {
    fetchEquipment();
  }, [eventId]);

  const fetchEquipment = async () => {
    const { data, error } = await supabase
      .from("room_equipment")
      .select("*")
      .eq("event_id", eventId)
      .order("category", { ascending: true });

    if (!error && data) {
      setEquipment(data);
      setFormData(data);
    }
  };

  const handleSave = async () => {
    const existingIds = equipment.map(e => e.id).filter(Boolean);
    const newIds = formData.map(e => e.id).filter(Boolean);
    const toDelete = existingIds.filter(id => !newIds.includes(id));

    for (const id of toDelete) {
      await supabase.from("room_equipment").delete().eq("id", id);
    }

    for (const item of formData) {
      const record = {
        event_id: eventId,
        category: item.category,
        item_name: item.item_name,
        quantity: item.quantity || "",
        notes: item.notes || null,
      };

      if (item.id) {
        await supabase.from("room_equipment").update(record).eq("id", item.id);
      } else {
        await supabase.from("room_equipment").insert(record);
      }
    }

    toast({ title: "Equipamiento guardado" });
    setIsEditing(false);
    fetchEquipment();
  };

  const addItem = (category: string) => {
    setFormData([...formData, { category, item_name: "", quantity: "" }]);
  };

  const removeItem = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Equipment, value: string) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const renderItems = (category: string) => {
    const items = formData.filter(e => e.category === category);
    
    if (!isEditing && items.length === 0) {
      return <p className="text-muted-foreground text-sm py-4">No hay equipamiento configurado</p>;
    }

    return (
      <div className="space-y-2">
        {items.map((item, idx) => {
          const globalIndex = formData.findIndex(e => e === item);
          
          return isEditing ? (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-5"
                placeholder="Nombre"
                value={item.item_name}
                onChange={(e) => updateItem(globalIndex, "item_name", e.target.value)}
              />
              <Input
                className="col-span-3"
                placeholder="Cantidad"
                value={item.quantity}
                onChange={(e) => updateItem(globalIndex, "quantity", e.target.value)}
              />
              <Input
                className="col-span-3"
                placeholder="Notas"
                value={item.notes || ""}
                onChange={(e) => updateItem(globalIndex, "notes", e.target.value)}
              />
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
                <span className="font-semibold">{item.quantity}</span>
                {item.notes && <span className="text-muted-foreground">{item.notes}</span>}
              </div>
            </div>
          );
        })}
        
        {isEditing && (
          <Button variant="outline" size="sm" onClick={() => addItem(category)} className="mt-2">
            <Plus className="h-4 w-4 mr-1" /> Añadir
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-section-staff">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Boxes className="h-5 w-5 text-primary" />
          Equipamiento y Material
        </CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setFormData(equipment); }}>
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
        <Tabs defaultValue="sala">
          <TabsList className="grid w-full grid-cols-4 mb-4">
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
