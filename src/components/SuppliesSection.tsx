import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SuppliesSectionProps {
  eventId: string;
}

interface Supply {
  id?: string;
  item_name: string;
  item_type: string;
  quantity: number;
}

const SuppliesSection = ({ eventId }: SuppliesSectionProps) => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Supply[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSupplies();
  }, [eventId]);

  const fetchSupplies = async () => {
    const { data } = await supabase
      .from("supplies")
      .select("*")
      .eq("event_id", eventId)
      .order("item_name");

    if (data) {
      setSupplies(data);
      setFormData(data);
    }
  };

  const handleSave = async () => {
    // Delete removed items
    const existingIds = formData.filter(s => s.id).map(s => s.id);
    const toDelete = supplies.filter(s => s.id && !existingIds.includes(s.id));
    
    if (toDelete.length > 0) {
      await supabase
        .from("supplies")
        .delete()
        .in("id", toDelete.map(s => s.id!));
    }

    // Update or insert items
    for (const item of formData) {
      if (item.id) {
        await supabase
          .from("supplies")
          .update({
            item_name: item.item_name,
            item_type: item.item_type,
            quantity: item.quantity,
          })
          .eq("id", item.id);
      } else {
        await supabase
          .from("supplies")
          .insert({
            event_id: eventId,
            item_name: item.item_name,
            item_type: item.item_type,
            quantity: item.quantity,
          });
      }
    }

    toast({ title: "Guardado", description: "Suministros actualizados" });
    setIsEditing(false);
    fetchSupplies();
  };

  const addSupply = () => {
    setFormData([...formData, { item_name: "", item_type: "", quantity: 0 }]);
  };

  const removeSupply = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateSupply = (index: number, field: keyof Supply, value: string | number) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Cristalería y Menaje</h2>
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
            <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setFormData(supplies); }}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>
      <Card className="bg-section-supplies border-none shadow-soft">
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(isEditing ? formData : supplies).map((supply, index) => (
              <div key={supply.id || index} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                {isEditing ? (
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Nombre del ítem"
                      value={supply.item_name}
                      onChange={(e) => updateSupply(index, "item_name", e.target.value)}
                    />
                    <Input
                      placeholder="Tipo"
                      value={supply.item_type}
                      onChange={(e) => updateSupply(index, "item_type", e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        value={supply.quantity}
                        onChange={(e) => updateSupply(index, "quantity", parseFloat(e.target.value) || 0)}
                      />
                      <Button size="icon" variant="destructive" onClick={() => removeSupply(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold text-foreground">{supply.item_name}</div>
                        {supply.item_type && (
                          <div className="text-sm text-muted-foreground">{supply.item_type}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-primary">{supply.quantity}</div>
                  </>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <Button onClick={addSupply} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Suministro
            </Button>
          )}
        </div>
      </Card>
    </section>
  );
};

export default SuppliesSection;
