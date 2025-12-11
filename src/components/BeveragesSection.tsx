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

// Bebidas predefinidas con ratio por PAX (basado en el Excel)
const DEFAULT_BEVERAGES: { category: string; item_name: string; ratio_per_pax: number; unit_price: number }[] = [
  // Aperitivo/Comida
  { category: 'aperitivo', item_name: 'Botella vino blanco', ratio_per_pax: 0.28, unit_price: 6.50 },
  { category: 'aperitivo', item_name: 'Botella vino tinto', ratio_per_pax: 0.18, unit_price: 6.50 },
  { category: 'aperitivo', item_name: 'Agua Solán de Cabras 1.5L', ratio_per_pax: 0.44, unit_price: 1.20 },
  { category: 'aperitivo', item_name: 'Botellín cerveza', ratio_per_pax: 2.80, unit_price: 1.00 },
  { category: 'aperitivo', item_name: 'Cerveza sin gluten', ratio_per_pax: 0.05, unit_price: 1.50 },
  { category: 'aperitivo', item_name: 'Cerveza 0,0', ratio_per_pax: 0.17, unit_price: 1.20 },
  { category: 'aperitivo', item_name: 'Aquarius', ratio_per_pax: 0.17, unit_price: 1.00 },
  { category: 'aperitivo', item_name: 'Nestea', ratio_per_pax: 0.17, unit_price: 1.00 },
  { category: 'aperitivo', item_name: 'Vermut', ratio_per_pax: 0.05, unit_price: 8.00 },
  { category: 'aperitivo', item_name: 'Agua con gas', ratio_per_pax: 0.18, unit_price: 1.50 },
  // Copas (Barra Libre)
  { category: 'copas', item_name: 'Ginebra', ratio_per_pax: 0.10, unit_price: 12.00 },
  { category: 'copas', item_name: 'Ron Barceló', ratio_per_pax: 0.05, unit_price: 14.00 },
  { category: 'copas', item_name: 'Ballentines', ratio_per_pax: 0.05, unit_price: 15.00 },
  { category: 'copas', item_name: 'Vodka', ratio_per_pax: 0.02, unit_price: 12.00 },
  { category: 'copas', item_name: 'Cazalla', ratio_per_pax: 0.01, unit_price: 8.00 },
  { category: 'copas', item_name: 'Tequila', ratio_per_pax: 0.02, unit_price: 14.00 },
  { category: 'copas', item_name: 'Tequila rosa', ratio_per_pax: 0.02, unit_price: 14.00 },
  { category: 'copas', item_name: 'Baileys', ratio_per_pax: 0.02, unit_price: 16.00 },
  { category: 'copas', item_name: 'Mistela', ratio_per_pax: 0.01, unit_price: 6.00 },
  { category: 'copas', item_name: 'Tónica', ratio_per_pax: 0.21, unit_price: 0.80 },
  // Refrescos
  { category: 'refrescos', item_name: 'Coca-Cola', ratio_per_pax: 0.86, unit_price: 0.70 },
  { category: 'refrescos', item_name: 'Coca-Cola Zero', ratio_per_pax: 0.65, unit_price: 0.70 },
  { category: 'refrescos', item_name: 'Fanta naranja', ratio_per_pax: 0.52, unit_price: 0.70 },
  { category: 'refrescos', item_name: 'Fanta limón', ratio_per_pax: 0.52, unit_price: 0.70 },
  { category: 'refrescos', item_name: 'Seven Up', ratio_per_pax: 0.17, unit_price: 0.70 },
  { category: 'refrescos', item_name: 'Limones', ratio_per_pax: 0.36, unit_price: 0.30 },
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

  // Generar bebidas predeterminadas basadas en PAX
  const generateDefaultBeverages = () => {
    const defaultItems: Beverage[] = DEFAULT_BEVERAGES.map(item => ({
      category: item.category,
      item_name: item.item_name,
      quantity: Math.ceil(item.ratio_per_pax * totalGuests),
      unit_price: item.unit_price,
      is_extra: false,
    }));
    setFormData(defaultItems);
    toast({ title: "Bebidas generadas según PAX", description: `Cantidades calculadas para ${totalGuests} invitados` });
  };

  // Recalcular cantidades según PAX actual
  const recalculateQuantities = () => {
    const updated = formData.map(item => {
      const defaultItem = DEFAULT_BEVERAGES.find(d => d.item_name === item.item_name && d.category === item.category);
      if (defaultItem && !item.is_extra) {
        return { ...item, quantity: Math.ceil(defaultItem.ratio_per_pax * totalGuests) };
      }
      return item;
    });
    setFormData(updated);
    toast({ title: "Cantidades recalculadas", description: `Actualizado para ${totalGuests} PAX` });
  };

  const handleSave = async () => {
    const existingIds = beverages.map(b => b.id).filter(Boolean);
    const newIds = formData.map(b => b.id).filter(Boolean);
    const toDelete = existingIds.filter(id => !newIds.includes(id));

    for (const id of toDelete) {
      await supabase.from("beverages").delete().eq("id", id);
    }

    for (const item of formData) {
      const totalPrice = item.quantity * item.unit_price;
      const pricePerPerson = totalGuests > 0 ? totalPrice / totalGuests : 0;
      
      const record = {
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
          {formData.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Total: {calculateGrandTotal().toFixed(2)}€ - {totalGuests > 0 ? (calculateGrandTotal() / totalGuests).toFixed(2) : '0.00'}€/pax)
            </span>
          )}
        </CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              {formData.length > 0 && (
                <Button size="sm" variant="outline" onClick={recalculateQuantities} title="Recalcular según PAX">
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