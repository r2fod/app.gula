import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Edit, Save, X, Plus, Trash2, Calculator, RefreshCw, ImagePlus } from "lucide-react";
import { useSupplies } from "../hooks/useSupplies";
import type { Supply } from "../hooks/useSupplies";

interface SuppliesSectionProps {
  eventId: string;
  totalGuests: number;
}

const SuppliesSection = ({ eventId, totalGuests }: SuppliesSectionProps) => {
  const {
    supplies,
    formData,
    setFormData,
    loading,
    isEditing,
    setIsEditing,
    barHours,
    uploadingIndex,
    recalculateQuantities,
    generateSupplies,
    handleSave,
    handlePhotoUpload
  } = useSupplies(eventId, totalGuests);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const addSupply = () => {
    setFormData([...formData, { item_name: "", item_type: "", quantity: 0, unit_price: 0 }]);
  };

  const removeSupply = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateSupply = (index: number, field: keyof Supply, value: string | number) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const groupedSupplies = (isEditing ? formData : supplies).reduce((acc, supply) => {
    const type = supply.item_type || "Otros";
    if (!acc[type]) acc[type] = [];
    acc[type].push(supply);
    return acc;
  }, {} as Record<string, Supply[]>);

  // Calcular total
  const totalPrice = supplies.reduce((sum, s) => sum + (s.quantity * (s.unit_price || 0)), 0);

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Cargando cristalería...</div>;
  }

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Cristalería y Menaje</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalGuests} PAX • {barHours}h barra libre
            {totalPrice > 0 && <span className="ml-2 text-primary font-medium">• Total: {totalPrice.toFixed(2)}€</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <>
              {supplies.length > 0 && (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
              {supplies.length === 0 && (
                <Button size="sm" variant="outline" onClick={generateSupplies}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Generar
                </Button>
              )}
            </>
          ) : (
            <>
              {formData.length > 0 && (
                <Button size="sm" variant="outline" onClick={recalculateQuantities} title="Recalcular según PAX y horas sin guardar">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recalcular
                </Button>
              )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((supply, index) => {
                  const globalIndex = (isEditing ? formData : supplies).findIndex(s => s === supply);
                  return (
                    <div key={supply.id || index} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2 items-center">
                            {supply.photo_url ? (
                              <img
                                src={supply.photo_url}
                                alt={supply.item_name}
                                className="w-12 h-12 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => fileInputRefs.current[globalIndex]?.click()}
                              />
                            ) : (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => fileInputRefs.current[globalIndex]?.click()}
                                disabled={uploadingIndex === globalIndex}
                              >
                                {uploadingIndex === globalIndex ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ImagePlus className="w-4 h-4" />
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
                            <Input
                              placeholder="Nombre del ítem"
                              value={supply.item_name}
                              onChange={(e) => updateSupply(globalIndex, "item_name", e.target.value)}
                              className="flex-1"
                            />
                          </div>
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
                            <Input
                              type="number"
                              placeholder="Precio €"
                              value={supply.unit_price || ""}
                              onChange={(e) => updateSupply(globalIndex, "unit_price", parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                            <Button size="icon" variant="destructive" onClick={() => removeSupply(globalIndex)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            {supply.photo_url ? (
                              <img
                                src={supply.photo_url}
                                alt={supply.item_name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-primary" />
                            )}
                            <div>
                              <div className="font-semibold text-foreground">{supply.item_name}</div>
                              {supply.unit_price && supply.unit_price > 0 && (
                                <div className="text-xs text-muted-foreground">{supply.unit_price}€/ud</div>
                              )}
                              {supply.notes && (
                                <div className="text-xs text-muted-foreground">{supply.notes}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">{supply.quantity}</div>
                            {supply.unit_price && supply.unit_price > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {(supply.quantity * supply.unit_price).toFixed(2)}€
                              </div>
                            )}
                          </div>
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
              <Button variant="link" onClick={generateSupplies} className="text-primary mt-2">
                Generar automáticamente
              </Button>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
};

export default SuppliesSection;
