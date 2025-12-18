import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Save, X, Plus, Trash2, Package, CheckCircle2, Clock, Truck } from "lucide-react";

interface RentalsSectionProps {
  eventId: string;
}

interface Rental {
  id?: string;
  item_name: string;
  status: string;
  notes?: string;
}

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', icon: Clock, color: 'text-amber-500' },
  { value: 'recogido', label: 'Recogido', icon: Truck, color: 'text-blue-500' },
  { value: 'entregado', label: 'Entregado', icon: CheckCircle2, color: 'text-green-500' },
];

export default function RentalsSection({ eventId }: RentalsSectionProps) {
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Rental[]>([]);

  useEffect(() => {
    fetchRentals();
  }, [eventId]);

  const fetchRentals = async () => {
    const { data, error } = await supabase
      .from("rentals")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setRentals(data);
      setFormData(data);
    }
  };

  const handleSave = async () => {
    const existingIds = rentals.map(r => r.id).filter(Boolean);
    const newIds = formData.map(r => r.id).filter(Boolean);
    const toDelete = existingIds.filter(id => !newIds.includes(id));

    for (const id of toDelete) {
      await supabase.from("rentals").delete().eq("id", id);
    }

    for (const item of formData) {
      const record = {
        event_id: eventId,
        item_name: item.item_name,
        status: item.status || 'pendiente',
        notes: item.notes || null,
      };

      if (item.id) {
        await supabase.from("rentals").update(record).eq("id", item.id);
      } else {
        await supabase.from("rentals").insert(record);
      }
    }

    toast({ title: "Alquileres guardados" });
    setIsEditing(false);
    fetchRentals();
  };

  const addRental = () => {
    setFormData([...formData, { item_name: "", status: "pendiente" }]);
  };

  const removeRental = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateRental = (index: number, field: keyof Rental, value: string) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  // Permite cambiar el status en modo no edición también
  const quickUpdateStatus = async (id: string, newStatus: string) => {
    await supabase.from("rentals").update({ status: newStatus }).eq("id", id);
    toast({ title: "Estado actualizado" });
    fetchRentals();
  };

  const getStatusConfig = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  const countByStatus = (status: string) => {
    return formData.filter(r => r.status === status).length;
  };

  return (
    <Card className="bg-section-special">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-3">
        <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Alquileres y Seguimiento
          </div>
          <div className="flex gap-2 sm:ml-4 flex-wrap">
            {STATUS_OPTIONS.map(status => (
              <span key={status.value} className={`text-xs ${status.color}`}>
                {status.label}: {countByStatus(status.value)}
              </span>
            ))}
          </div>
        </CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setFormData(rentals); }}>
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
        {formData.length === 0 && !isEditing ? (
          <p className="text-muted-foreground text-sm py-4">No hay alquileres registrados</p>
        ) : (
          <div className="space-y-2">
            {formData.map((item, index) => {
              const statusConfig = getStatusConfig(item.status);
              const StatusIcon = statusConfig.icon;

              return isEditing ? (
                <div key={index} className="space-y-2 md:space-y-0 md:grid md:grid-cols-12 gap-2 items-center p-3 md:p-0 bg-muted/30 md:bg-transparent rounded-lg md:rounded-none">
                  <div className="md:col-span-5">
                    <label className="text-xs text-muted-foreground md:hidden mb-1 block">Ítem</label>
                    <Input
                      placeholder="Ítem (ej: Minutas, Flores...)"
                      value={item.item_name}
                      onChange={(e) => updateRental(index, "item_name", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:contents">
                    <div className="md:col-span-3">
                      <label className="text-xs text-muted-foreground md:hidden mb-1 block">Estado</label>
                      <Select
                        value={item.status}
                        onValueChange={(value) => updateRental(index, "status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs text-muted-foreground md:hidden mb-1 block">Notas</label>
                      <Input
                        placeholder="Notas"
                        value={item.notes || ""}
                        onChange={(e) => updateRental(index, "notes", e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:col-span-1 self-end md:self-auto"
                    onClick={() => removeRental(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-border last:border-0 gap-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                    <span className="font-medium">{item.item_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    {item.notes && (
                      <span className="text-sm text-muted-foreground">{item.notes}</span>
                    )}
                    {item.id && (
                      <Select
                        value={item.status}
                        onValueChange={(value) => quickUpdateStatus(item.id!, value)}
                      >
                        <SelectTrigger className="w-full sm:w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              );
            })}

            {isEditing && (
              <Button variant="outline" size="sm" onClick={addRental} className="mt-2">
                <Plus className="h-4 w-4 mr-1" /> Añadir alquiler
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
