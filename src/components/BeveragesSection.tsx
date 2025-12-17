import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Save, X, Plus, Trash2, Wine, Beer, GlassWater, RefreshCw, ImagePlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useBeverages, Beverage } from "@/features/events/hooks/useBeverages";
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
    beverages,
    formData,
    setFormData,
    loading,
    barHours,
    isEditing,
    setIsEditing,
    uploadingIndex,
    generateDefaultBeverages,
    recalculateQuantities,
    handleSave,
    handlePhotoUpload
  } = useBeverages(eventId, totalGuests);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

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
            <h3 className="text-sm font-semibold text-primary border-b border-primary/30 pb-1">
              {type}
            </h3>

            {isEditing && (
              <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium pb-2 border-b border-border pl-[50px]">
                <span className="col-span-4">Nombre</span>
                <span className="col-span-2">Cantidad</span>
                <span className="col-span-2">€/ud</span>
                <span className="col-span-2">Total</span>
                <span className="col-span-1">Extra</span>
                <span className="col-span-1"></span>
              </div>
            )}

            {typeItems.map((item, idx) => {
              const globalIndex = formData.findIndex(b => b === item);
              const total = item.quantity * item.unit_price;

              return isEditing ? (
                <div key={idx} className="flex flex-col md:grid md:grid-cols-12 gap-2 items-start md:items-center bg-muted/30 p-2 md:p-0 rounded md:bg-transparent">
                  {/* Photo Upload Area */}
                  <div className="hidden md:flex justify-center w-[40px]">
                    {item.photo_url ? (
                      <img
                        src={item.photo_url}
                        alt={item.item_name}
                        className="w-8 h-8 rounded object-cover cursor-pointer hover:opacity-80"
                        onClick={() => fileInputRefs.current[globalIndex]?.click()}
                        title="Cambiar imagen"
                      />
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => fileInputRefs.current[globalIndex]?.click()}
                        disabled={uploadingIndex === globalIndex}
                        title="Subir imagen"
                      >
                        {uploadingIndex === globalIndex ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={el => fileInputRefs.current[globalIndex] = el}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(globalIndex, file);
                      }}
                    />
                  </div>

                  <div className="w-full md:col-span-4 flex gap-2 items-center">
                    {/* Mobile Photo Upload */}
                    <div className="md:hidden">
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt={item.item_name}
                          className="w-10 h-10 rounded object-cover cursor-pointer"
                          onClick={() => fileInputRefs.current[globalIndex]?.click()}
                        />
                      ) : (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => fileInputRefs.current[globalIndex]?.click()}
                        >
                          <ImagePlus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <Input
                      className="h-8 text-sm w-full"
                      placeholder="Nombre"
                      value={item.item_name}
                      onChange={(e) => updateItem(globalIndex, "item_name", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full md:col-span-6 md:grid-cols-6 md:gap-2 items-center">
                    <Input
                      className="h-8 text-sm md:col-span-2"
                      type="number"
                      placeholder="Cant."
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(globalIndex, "quantity", parseInt(e.target.value) || 0)}
                    />
                    <Input
                      className="h-8 text-sm md:col-span-2"
                      type="number"
                      step="0.01"
                      placeholder="€/ud"
                      value={item.unit_price || ""}
                      onChange={(e) => updateItem(globalIndex, "unit_price", parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-sm font-medium text-right md:text-left md:col-span-2">{total.toFixed(2)}€</span>
                  </div>

                  <div className="flex justify-between w-full md:col-span-2 md:justify-start items-center gap-2">
                    <div className="flex items-center gap-2 md:justify-center md:w-full">
                      <span className="text-xs md:hidden">Extra?</span>
                      <Checkbox
                        checked={item.is_extra || false}
                        onCheckedChange={(checked) => updateItem(globalIndex, "is_extra", checked)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(globalIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div key={idx} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-border last:border-0 ${item.is_extra ? 'bg-primary/5 px-2 rounded' : ''}`}>
                  <div className="flex items-center gap-3 mb-1 sm:mb-0">
                    {item.photo_url ? (
                      <img
                        src={item.photo_url}
                        alt={item.item_name}
                        className="w-8 h-8 rounded object-cover border border-border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Wine className="w-4 h-4 text-muted-foreground opacity-20" />
                      </div>
                    )}
                    <span className="font-medium text-sm">
                      {item.item_name}
                      {item.is_extra && <span className="ml-2 text-xs text-primary">(Extra)</span>}
                    </span>
                  </div>

                  <div className="flex gap-4 text-sm w-full sm:w-auto justify-between sm:justify-end pl-[44px] sm:pl-0">
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
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Wine className="h-5 w-5 text-primary" />
            Bebidas y Barra Libre
          </div>
          <span className="text-sm font-normal text-muted-foreground sm:ml-2">
            ({barHours}h barra)
          </span>
          {formData.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground hidden sm:inline">
              |
            </span>
          )}
          {formData.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              Total: {calculateGrandTotal().toFixed(2)}€
              <span className="hidden sm:inline"> - {totalGuests > 0 ? (calculateGrandTotal() / totalGuests).toFixed(2) : '0.00'}€/pax</span>
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
