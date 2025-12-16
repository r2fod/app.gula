import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Save, X, Plus, Trash2, Wine, Beer, GlassWater, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

// Bebidas predefinidas con ratio por PAX y precios sin IVA (del Excel)
// Los ratios de copas y refrescos son por hora de barra libre
const DEFAULT_BEVERAGES: { category: string; item_name: string; ratio_per_pax: number; unit_price: number; per_bar_hour?: boolean }[] = [
  // APERITIVO/COMIDA - estos NO dependen de horas de barra
  { category: 'aperitivo', item_name: 'Nebla Verdejo', ratio_per_pax: 0.40, unit_price: 5.22 },
  { category: 'aperitivo', item_name: 'Raiza Rioja Tinto', ratio_per_pax: 0.29, unit_price: 4.33 },
  { category: 'aperitivo', item_name: 'Botella Cava', ratio_per_pax: 0.13, unit_price: 3.59 },
  { category: 'aperitivo', item_name: 'Agua Solán de Cabras 1.5L', ratio_per_pax: 1.00, unit_price: 0.65 },
  { category: 'aperitivo', item_name: 'Botellín cerveza', ratio_per_pax: 3.50, unit_price: 0.49 },
  { category: 'aperitivo', item_name: 'Coca-Cola', ratio_per_pax: 0.25, unit_price: 0.569 },
  { category: 'aperitivo', item_name: 'Coca-Cola Zero', ratio_per_pax: 0.25, unit_price: 0.5629 },
  { category: 'aperitivo', item_name: 'Aquarius', ratio_per_pax: 0.30, unit_price: 0.6629 },
  { category: 'aperitivo', item_name: 'Nestea', ratio_per_pax: 0.20, unit_price: 0.715 },
  { category: 'aperitivo', item_name: 'Fanta Naranja', ratio_per_pax: 0.30, unit_price: 0.528 },
  { category: 'aperitivo', item_name: 'Fanta Limón', ratio_per_pax: 0.30, unit_price: 0.528 },
  { category: 'aperitivo', item_name: 'Vermut Izaguirre Rojo', ratio_per_pax: 0.07, unit_price: 6.30 },
  { category: 'aperitivo', item_name: 'Vermut Izaguirre Blanco', ratio_per_pax: 0.03, unit_price: 6.30 },
  { category: 'aperitivo', item_name: 'Agua con gas', ratio_per_pax: 0.25, unit_price: 0.789 },
  { category: 'aperitivo', item_name: 'Cerveza 0,0', ratio_per_pax: 0.15, unit_price: 0.89 },
  { category: 'aperitivo', item_name: 'Cerveza sin gluten', ratio_per_pax: 0.05, unit_price: 1.14 },
  // BARRA COPAS - Licores (estos SÍ dependen de horas de barra)
  { category: 'copas', item_name: 'Ginebra Tanqueray', ratio_per_pax: 0.04, unit_price: 12.18, per_bar_hour: true },
  { category: 'copas', item_name: 'Ginebra Seagrams', ratio_per_pax: 0.04, unit_price: 13.05, per_bar_hour: true },
  { category: 'copas', item_name: 'Ginebra Larios', ratio_per_pax: 0.01, unit_price: 10.00, per_bar_hour: true },
  { category: 'copas', item_name: 'Puerto de Indias', ratio_per_pax: 0.02, unit_price: 13.00, per_bar_hour: true },
  { category: 'copas', item_name: 'Ron Barceló', ratio_per_pax: 0.03, unit_price: 12.00, per_bar_hour: true },
  { category: 'copas', item_name: 'Ron Brugal', ratio_per_pax: 0.03, unit_price: 11.15, per_bar_hour: true },
  { category: 'copas', item_name: 'Ballentines', ratio_per_pax: 0.035, unit_price: 11.20, per_bar_hour: true },
  { category: 'copas', item_name: 'Vodka', ratio_per_pax: 0.02, unit_price: 10.90, per_bar_hour: true },
  { category: 'copas', item_name: 'Tequila', ratio_per_pax: 0.005, unit_price: 12.87, per_bar_hour: true },
  { category: 'copas', item_name: 'Tequila Rosa', ratio_per_pax: 0.01, unit_price: 6.70, per_bar_hour: true },
  { category: 'copas', item_name: 'Cazalla', ratio_per_pax: 0.005, unit_price: 8.45, per_bar_hour: true },
  { category: 'copas', item_name: 'Baileys', ratio_per_pax: 0.005, unit_price: 10.20, per_bar_hour: true },
  { category: 'copas', item_name: 'Mistela', ratio_per_pax: 0.005, unit_price: 3.12, per_bar_hour: true },
  { category: 'copas', item_name: 'Tónica', ratio_per_pax: 0.165, unit_price: 2.01, per_bar_hour: true },
  { category: 'copas', item_name: 'Hielo', ratio_per_pax: 0.335, unit_price: 0.763, per_bar_hour: true },
  // REFRESCOS (Barra Copas) - también dependen de horas de barra
  { category: 'refrescos', item_name: 'Seven Up Lata', ratio_per_pax: 0.125, unit_price: 0.972, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Agua con gas (Copas)', ratio_per_pax: 0.125, unit_price: 0.80, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Coca-Cola (Copas)', ratio_per_pax: 0.6, unit_price: 0.569, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Coca-Cola Zero (Copas)', ratio_per_pax: 0.5, unit_price: 0.5629, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Fanta Naranja (Copas)', ratio_per_pax: 0.375, unit_price: 0.528, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Fanta Limón (Copas)', ratio_per_pax: 0.375, unit_price: 0.528, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Limones', ratio_per_pax: 0.025, unit_price: 2.50, per_bar_hour: true },
];

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
  const [barHours, setBarHours] = useState<number>(2); // Default 2 hours

  useEffect(() => {
    fetchBeverages();
    fetchBarHours();
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

  const fetchBarHours = async () => {
    const { data, error } = await supabase
      .from("event_timings")
      .select("bar_hours, bar_start, bar_end")
      .eq("event_id", eventId)
      .single();

    if (!error && data) {
      if (data.bar_hours) {
        setBarHours(data.bar_hours);
      } else if (data.bar_start && data.bar_end) {
        // Calculate hours from times
        const start = data.bar_start.split(':');
        const end = data.bar_end.split(':');
        const startHours = parseInt(start[0]) + parseInt(start[1]) / 60;
        let endHours = parseInt(end[0]) + parseInt(end[1]) / 60;
        // Handle midnight crossing
        if (endHours < startHours) endHours += 24;
        const calculatedHours = Math.max(1, Math.round(endHours - startHours));
        setBarHours(calculatedHours);
      }
    }
  };

  // Calculate quantity based on whether item depends on bar hours
  const calculateQuantity = (item: { ratio_per_pax: number; per_bar_hour?: boolean }) => {
    if (item.per_bar_hour) {
      return Math.ceil(item.ratio_per_pax * totalGuests * barHours);
    }
    return Math.ceil(item.ratio_per_pax * totalGuests);
  };

  // Generar bebidas predeterminadas basadas en PAX y horas de barra
  const generateDefaultBeverages = () => {
    const defaultItems: Beverage[] = DEFAULT_BEVERAGES.map(item => ({
      category: item.category,
      item_name: item.item_name,
      quantity: calculateQuantity(item),
      unit_price: item.unit_price,
      is_extra: false,
    }));
    setFormData(defaultItems);
    toast({ 
      title: "Bebidas generadas", 
      description: `Cantidades calculadas para ${totalGuests} invitados y ${barHours}h de barra libre` 
    });
  };

  // Recalcular cantidades según PAX y horas de barra actuales
  const recalculateQuantities = () => {
    const updated = formData.map(item => {
      const defaultItem = DEFAULT_BEVERAGES.find(d => d.item_name === item.item_name && d.category === item.category);
      if (defaultItem && !item.is_extra) {
        return { ...item, quantity: calculateQuantity(defaultItem) };
      }
      return item;
    });
    setFormData(updated);
    toast({ 
      title: "Cantidades recalculadas", 
      description: `Actualizado para ${totalGuests} PAX y ${barHours}h de barra` 
    });
  };

  const handleSave = async () => {
    try {
      // Delete existing beverages for this event
      const { error: deleteError } = await supabase
        .from("beverages")
        .delete()
        .eq("event_id", eventId);

      if (deleteError) {
        console.error('Error deleting beverages:', deleteError);
        toast({ title: "Error", description: "No se pudieron eliminar las bebidas existentes", variant: "destructive" });
        return;
      }

      // Insert all beverages
      if (formData.length > 0) {
        const recordsToInsert = formData.map(item => {
          const totalPrice = item.quantity * item.unit_price;
          const pricePerPerson = totalGuests > 0 ? totalPrice / totalGuests : 0;
          
          return {
            event_id: eventId,
            category: item.category,
            item_name: item.item_name,
            quantity: item.quantity || 0,
            unit_price: item.unit_price || 0,
            total_price: totalPrice,
            price_per_person: pricePerPerson,
            notes: item.notes || null,
            is_extra: item.is_extra || false,
          };
        });

        const { error: insertError } = await supabase
          .from("beverages")
          .insert(recordsToInsert);

        if (insertError) {
          console.error('Error inserting beverages:', insertError);
          toast({ title: "Error", description: "No se pudieron guardar las bebidas", variant: "destructive" });
          return;
        }
      }

      toast({ title: "Bebidas guardadas" });
      setIsEditing(false);
      fetchBeverages();
    } catch (err) {
      console.error('Error saving beverages:', err);
      toast({ title: "Error", description: "Error al guardar las bebidas", variant: "destructive" });
    }
  };

  const addItem = (category: string) => {
    setFormData([...formData, { category, item_name: "", quantity: 0, unit_price: 0, is_extra: true }]);
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

  const calculateGrandTotal = () => {
    return formData.reduce((sum, b) => sum + (b.quantity * b.unit_price), 0);
  };

  const renderItems = (category: string) => {
    const items = formData.filter(b => b.category === category);
    
    if (!isEditing && items.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm mb-3">No hay bebidas configuradas</p>
          <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); generateDefaultBeverages(); }}>
            <Plus className="h-4 w-4 mr-1" /> Generar bebidas según PAX
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Header */}
        {isEditing && items.length > 0 && (
          <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium pb-2 border-b border-border">
            <span className="col-span-4">Nombre</span>
            <span className="col-span-2">Cantidad</span>
            <span className="col-span-2">€/ud</span>
            <span className="col-span-2">Total</span>
            <span className="col-span-1">Extra</span>
            <span className="col-span-1"></span>
          </div>
        )}
        
        {items.map((item, idx) => {
          const globalIndex = formData.findIndex(b => b === item);
          const total = item.quantity * item.unit_price;
          
          return isEditing ? (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-4 h-8 text-sm"
                placeholder="Nombre"
                value={item.item_name}
                onChange={(e) => updateItem(globalIndex, "item_name", e.target.value)}
              />
              <Input
                className="col-span-2 h-8 text-sm"
                type="number"
                placeholder="Cant."
                value={item.quantity || ""}
                onChange={(e) => updateItem(globalIndex, "quantity", parseInt(e.target.value) || 0)}
              />
              <Input
                className="col-span-2 h-8 text-sm"
                type="number"
                step="0.01"
                placeholder="€/ud"
                value={item.unit_price || ""}
                onChange={(e) => updateItem(globalIndex, "unit_price", parseFloat(e.target.value) || 0)}
              />
              <span className="col-span-2 text-sm font-medium">{total.toFixed(2)}€</span>
              <div className="col-span-1 flex justify-center">
                <Checkbox
                  checked={item.is_extra || false}
                  onCheckedChange={(checked) => updateItem(globalIndex, "is_extra", checked)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="col-span-1 h-8 w-8"
                onClick={() => removeItem(globalIndex)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ) : (
            <div key={idx} className={`flex justify-between items-center py-2 border-b border-border last:border-0 ${item.is_extra ? 'bg-primary/5 px-2 rounded' : ''}`}>
              <span className="font-medium text-sm">
                {item.item_name}
                {item.is_extra && <span className="ml-2 text-xs text-primary">(Extra)</span>}
              </span>
              <div className="flex gap-4 text-sm">
                <span className="w-16 text-right">{item.quantity} ud</span>
                <span className="w-16 text-right text-muted-foreground">{item.unit_price.toFixed(2)}€/ud</span>
                <span className="w-20 text-right font-semibold">{total.toFixed(2)}€</span>
              </div>
            </div>
          );
        })}
        
        {isEditing && (
          <Button variant="outline" size="sm" onClick={() => addItem(category)} className="mt-2">
            <Plus className="h-4 w-4 mr-1" /> Añadir item
          </Button>
        )}
        
        {items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm font-semibold">
            <span>Total {CATEGORIES.find(c => c.key === category)?.label}</span>
            <div className="flex gap-4">
              <span>{calculateTotal(category).toFixed(2)}€</span>
              <span className="text-primary">{calculatePricePerPerson(category)}€/pax</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-section-supplies">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wine className="h-5 w-5 text-primary" />
          Bebidas y Barra Libre
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({barHours}h barra)
          </span>
          {formData.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              | Total: {calculateGrandTotal().toFixed(2)}€ - {totalGuests > 0 ? (calculateGrandTotal() / totalGuests).toFixed(2) : '0.00'}€/pax
            </span>
          )}
        </CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              {formData.length > 0 && (
                <Button size="sm" variant="outline" onClick={recalculateQuantities} title="Recalcular según PAX y horas">
                  <RefreshCw className="h-4 w-4 mr-1" /> Recalcular
                </Button>
              )}
              {formData.length === 0 && (
                <Button size="sm" variant="outline" onClick={generateDefaultBeverages}>
                  <Plus className="h-4 w-4 mr-1" /> Generar por defecto
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setFormData(beverages); }}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" /> Guardar
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-1" /> Editar
            </Button>
          )}
        </div>
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
