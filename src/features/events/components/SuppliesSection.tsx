import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Plus, Trash2, RefreshCw, GlassWater } from "lucide-react";
import { useSupplies } from "../hooks/useSupplies";
import type { Supply } from "../hooks/useSupplies";
import { SectionHeader } from "@/components/SectionHeader";
import { PhotoUploader } from "@/components/form/PhotoUploader";

interface SuppliesSectionProps {
  eventId: string;
  totalGuests: number;
}

/**
 * Sección que gestiona la cristalería, vajilla y menaje de un evento.
 * Utiliza componentes compartidos para mantener la coherencia visual y de código.
 */
const SuppliesSection = ({ eventId, totalGuests }: SuppliesSectionProps) => {
  const { isDemo } = useAuth();
  // Extraemos toda la lógica del hook personalizado useSupplies
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

  // Añade una nueva fila vacía al formulario local
  const addSupply = () => {
    setFormData([...formData, { item_name: "", item_type: "", quantity: 0, unit_price: 0 }]);
  };

  // Elimina una fila del formulario local
  const removeSupply = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  // Actualiza un campo específico de un item en el formulario local
  const updateSupply = (index: number, field: keyof Supply, value: string | number) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  // Agrupamos los suministros por tipo (Cristalería, Vajilla, etc.) para una mejor visualización
  const groupedSupplies = (isEditing ? formData : supplies).reduce((acc, supply) => {
    const type = supply.item_type || "Otros";
    if (!acc[type]) acc[type] = [];
    acc[type].push(supply);
    return acc;
  }, {} as Record<string, Supply[]>);

  // Cálculo del precio total estimado
  const totalPrice = supplies.reduce((sum, s) => sum + (s.quantity * (s.unit_price || 0)), 0);

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Cargando cristalería...</div>;
  }

  return (
    <section>
      {/* Cabecera unificada: gestiona título, PAX, total y botones de acción */}
      <SectionHeader
        title="Cristalería y Menaje"
        subtitle={`${totalGuests} PAX • ${barHours}h barra libre`}
        isEditing={isEditing}
        isDemo={isDemo}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={() => { setIsEditing(false); setFormData(supplies); }}
        onRecalculate={recalculateQuantities}
        showRecalculate={formData.length > 0}
        totalPrice={totalPrice}
      />

      <Card className="bg-section-supplies border-none shadow-soft">
        <div className="p-6">
          {(Object.entries(groupedSupplies) as [string, Supply[]][]).map(([type, items]) => (
            <div key={type} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border/30 pb-2">{type}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((supply, index) => {
                  // Necesitamos el índice global para las funciones de actualización
                  const globalIndex = (isEditing ? formData : supplies).findIndex(s => s === supply);
                  return (
                    <div key={supply.id || index} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2 items-center">
                            {/* Componente unificado para subida de fotos */}
                            <PhotoUploader
                              photoUrl={supply.photo_url}
                              isUploading={uploadingIndex === globalIndex}
                              onUpload={(file) => handlePhotoUpload(globalIndex, file)}
                              size="md"
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
            <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/25">
              <GlassWater className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-sm mb-4">
                No hay cristalería configurada
              </p>
              <Button variant="outline" size="sm" onClick={generateSupplies}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generar cristalería y menaje según PAX
              </Button>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
};

export default SuppliesSection;
