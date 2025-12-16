import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Save, X, Plus, Trash2, Wine, Beer, GlassWater, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useBeverages, Beverage, DEFAULT_BEVERAGES } from "@/hooks/useBeverages";
import { getBeverageType } from "@/lib/calculations";

interface BeveragesSectionProps {
  eventId: string;
  totalGuests: number;
}

const CATEGORIES = [
  { key: 'aperitivo', label: 'Aperitivo/Comida', icon: Wine },
  { key: 'copas', label: 'Barra Copas', icon: GlassWater },
  { key: 'refrescos', label: 'Refrescos', icon: Beer },
];

export default function BeveragesSection({ eventId, totalGuests }: BeveragesSectionProps) {
  const {
    beverages, // Datos guardados en BD (para revertir)
    formData,
    setFormData,
    loading,
    barHours,
    isEditing,
    setIsEditing,
    generateDefaultBeverages,
    recalculateQuantities,
    handleSave,
  } = useBeverages(eventId, totalGuests);

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

    // Agrupar por tipo de bebida (visual, no en BD)
    const groupedByType = items.reduce((acc, item) => {
      const type = getBeverageType(item.item_name);
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedByType).map(([type, typeItems]) => (
          <div key={type} className="space-y-2">
            {/* Tipo Header */}
            <h3 className="text-sm font-semibold text-primary border-b border-primary/30 pb-1">
              {type}
            </h3>

            {/* Header de columnas (solo en modo edición) */}
            {isEditing && (
              <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium pb-2 border-b border-border">
                <span className="col-span-4">Nombre</span>
                <span className="col-span-2">Cantidad</span>
                <span className="col-span-2">€/ud</span>
                <span className="col-span-2">Total</span>
                <span className="col-span-1">Extra</span>
                <span className="col-span-1"></span>
              </div>
            )}

            {/* Items del tipo */}
            {typeItems.map((item, idx) => {
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
          </div>
        ))}

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

  if (loading) {
    return <div>Cargando bebidas...</div>;
  }

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
