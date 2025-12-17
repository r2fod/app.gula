import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Edit, Save, X, Plus, Trash2, Calculator, RefreshCw } from "lucide-react";
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
  notes?: string;
}

// Ratios de cristalería y menaje por PAX (basados en Excel ORDEN_MODELO)
const SUPPLY_RATIOS: { item_name: string; item_type: string; ratio_per_pax: number; bar_hours_multiplier?: number; notes?: string }[] = [
  // Cristalería
  { item_name: "Vaso Agua", item_type: "Cristalería", ratio_per_pax: 3.5 },
  { item_name: "Copa Vino", item_type: "Cristalería", ratio_per_pax: 4.2 },
  { item_name: "Copa Cava", item_type: "Cristalería", ratio_per_pax: 2.2 },
  { item_name: "Vaso Cubata", item_type: "Cristalería", ratio_per_pax: 2.5, bar_hours_multiplier: 2.5 },
  { item_name: "Vaso Chupito", item_type: "Cristalería", ratio_per_pax: 2.0 },
  // Vajilla
  { item_name: "Plato Mediano", item_type: "Vajilla", ratio_per_pax: 3.1 },
  { item_name: "Plato Grande", item_type: "Vajilla", ratio_per_pax: 1.5 },
  { item_name: "Plato Postre", item_type: "Vajilla", ratio_per_pax: 3.1 },
  // Cubertería
  { item_name: "Tenedor", item_type: "Cubertería", ratio_per_pax: 3.4 },
  { item_name: "Cuchillo", item_type: "Cubertería", ratio_per_pax: 3.4 },
  { item_name: "Cuchara", item_type: "Cubertería", ratio_per_pax: 1.6 },
  { item_name: "Cuchara Postre", item_type: "Cubertería", ratio_per_pax: 1.0, notes: "Sumar 100 si llevan tarta" },
  // Café
  { item_name: "Taza Café con Leche", item_type: "Café", ratio_per_pax: 0.4 },
  { item_name: "Plato Café con Leche", item_type: "Café", ratio_per_pax: 0.4 },
  { item_name: "Taza Café Solo", item_type: "Café", ratio_per_pax: 1.2 },
  { item_name: "Plato Café Solo", item_type: "Café", ratio_per_pax: 1.2 },
  { item_name: "Cucharita Café", item_type: "Café", ratio_per_pax: 1.0 },
  { item_name: "Jarrita", item_type: "Café", ratio_per_pax: 0.04 },
];

const SuppliesSection = ({ eventId }: SuppliesSectionProps) => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Supply[]>([]);
  const [totalGuests, setTotalGuests] = useState(0);
  const [barHours, setBarHours] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSupplies();
    fetchEventData();

    const channel = supabase
      .channel(`supplies-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplies',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          fetchSupplies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchEventData = async () => {
    const { data: eventData } = await supabase
      .from("events")
      .select("total_guests")
      .eq("id", eventId)
      .maybeSingle();

    if (eventData) {
      setTotalGuests(eventData.total_guests || 0);
    }

    const { data: timingsData } = await supabase
      .from("event_timings")
      .select("bar_hours")
      .eq("event_id", eventId)
      .maybeSingle();

    if (timingsData?.bar_hours) {
      setBarHours(timingsData.bar_hours);
    }
  };

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

  const generateSupplies = async () => {
    if (totalGuests === 0) {
      toast({ 
        title: "Error", 
        description: "No hay invitados definidos para calcular cantidades",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    const generatedSupplies: Supply[] = SUPPLY_RATIOS.map(item => {
      let quantity = Math.ceil(totalGuests * item.ratio_per_pax);
      
      // Para vasos de cubata, multiplicar por horas de barra
      if (item.bar_hours_multiplier) {
        quantity = Math.ceil(totalGuests * item.ratio_per_pax * barHours / 4);
      }

      return {
        item_name: item.item_name,
        item_type: item.item_type,
        quantity,
        notes: item.notes || ""
      };
    });

    // Delete existing and insert new
    await supabase
      .from("supplies")
      .delete()
      .eq("event_id", eventId);

    const { error } = await supabase
      .from("supplies")
      .insert(generatedSupplies.map(s => ({
        event_id: eventId,
        item_name: s.item_name,
        item_type: s.item_type,
        quantity: s.quantity,
        notes: s.notes
      })));

    if (error) {
      toast({ title: "Error", description: "No se pudieron generar los suministros", variant: "destructive" });
    } else {
      toast({ title: "Generado", description: `Cristalería calculada para ${totalGuests} PAX y ${barHours}h de barra` });
      fetchSupplies();
    }

    setIsGenerating(false);
  };

  const handleSave = async () => {
    // Delete all existing and insert all from formData
    await supabase
      .from("supplies")
      .delete()
      .eq("event_id", eventId);

    if (formData.length > 0) {
      const { error } = await supabase
        .from("supplies")
        .insert(formData.map(item => ({
          event_id: eventId,
          item_name: item.item_name,
          item_type: item.item_type,
          quantity: item.quantity,
          notes: item.notes || null
        })));

      if (error) {
        toast({ title: "Error", description: "No se pudieron guardar los cambios", variant: "destructive" });
        return;
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

  // Agrupar por tipo
  const groupedSupplies = (isEditing ? formData : supplies).reduce((acc, supply) => {
    const type = supply.item_type || "Otros";
    if (!acc[type]) acc[type] = [];
    acc[type].push(supply);
    return acc;
  }, {} as Record<string, Supply[]>);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Cristalería y Menaje</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalGuests} PAX • {barHours}h barra libre
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button size="sm" variant="outline" onClick={generateSupplies} disabled={isGenerating}>
                {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
                Generar
              </Button>
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setFormData(supplies); }}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>
      <Card className="bg-section-supplies border-none shadow-soft">
        <div className="p-6">
          {Object.entries(groupedSupplies).map(([type, items]) => (
            <div key={type} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border/30 pb-2">{type}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((supply, index) => {
                  const globalIndex = (isEditing ? formData : supplies).findIndex(s => s === supply);
                  return (
                    <div key={supply.id || index} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Nombre del ítem"
                            value={supply.item_name}
                            onChange={(e) => updateSupply(globalIndex, "item_name", e.target.value)}
                          />
                          <Input
                            placeholder="Tipo (Cristalería, Vajilla...)"
                            value={supply.item_type}
                            onChange={(e) => updateSupply(globalIndex, "item_type", e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Cantidad"
                              value={supply.quantity}
                              onChange={(e) => updateSupply(globalIndex, "quantity", parseFloat(e.target.value) || 0)}
                            />
                            <Button size="icon" variant="destructive" onClick={() => removeSupply(globalIndex)}>
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
                              {supply.notes && (
                                <div className="text-xs text-muted-foreground">{supply.notes}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-xl font-bold text-primary">{supply.quantity}</div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {isEditing && (
            <Button onClick={addSupply} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Suministro
            </Button>
          )}
          {supplies.length === 0 && !isEditing && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay cristalería configurada</p>
              <p className="text-sm">Pulsa "Generar" para calcular automáticamente</p>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
};

export default SuppliesSection;
