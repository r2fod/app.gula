import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Users } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";

interface StaffSectionProps {
  eventId: string;
}

interface Staff {
  id?: string;
  role: string;
  staff_count: number;
  arrival_time?: string;
  departure_time?: string;
  notes?: string;
}

// Roles predefinidos para la selección rápida
const DEFAULT_ROLES = [
  "Coordinador",
  "Camarero sala",
  "Camarero cocina",
  "Cocinero",
  "Ayudante cocina",
  "Barra",
  "DJ/Música",
];

/**
 * Sección para la gestión del personal del evento.
 * Permite definir roles, cantidades y horarios de entrada/salida.
 */
export default function StaffSection({ eventId }: StaffSectionProps) {
  const { isDemo } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga inicial de datos
  useEffect(() => {
    fetchStaff();
  }, [eventId]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("event_staff")
        .select("*")
        .eq("event_id", eventId)
        .order("role", { ascending: true });

      if (error) throw error;
      if (data) {
        setStaff(data);
        setFormData(data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guarda los cambios comparando el estado original con el formulario.
   * Maneja borrados, actualizaciones e inserciones.
   */
  const handleSave = async () => {
    try {
      const existingIds = staff.map(s => s.id).filter(Boolean);
      const newIds = formData.map(s => s.id).filter(Boolean);
      // Identificar IDs que ya no están en el formulario para borrarlos
      const toDelete = existingIds.filter(id => !newIds.includes(id));

      if (toDelete.length > 0) {
        const { error: delError } = await supabase.from("event_staff").delete().in("id", toDelete);
        if (delError) throw delError;
      }

      // Procesar cada item del formulario
      for (const item of formData) {
        const record = {
          event_id: eventId,
          role: item.role,
          staff_count: item.staff_count || 0,
          arrival_time: item.arrival_time || null,
          departure_time: item.departure_time || null,
          notes: item.notes || null,
        };

        if (item.id) {
          const { error } = await supabase.from("event_staff").update(record).eq("id", item.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("event_staff").insert(record);
          if (error) throw error;
        }
      }

      toast({ title: "Personal guardado", description: "La lista de personal ha sido actualizada." });
      setIsEditing(false);
      fetchStaff();
    } catch (error) {
      console.error("Error saving staff:", error);
      toast({ title: "Error", description: "No se pudo guardar la configuración de personal.", variant: "destructive" });
    }
  };

  const addStaff = (role?: string) => {
    setFormData([...formData, {
      role: role || "",
      staff_count: 1,
      arrival_time: "",
      departure_time: ""
    }]);
  };

  const removeStaff = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateStaff = (index: number, field: keyof Staff, value: any) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const getTotalStaff = () => {
    return (isEditing ? formData : staff).reduce((sum, s) => sum + (s.staff_count || 0), 0);
  };

  if (loading && staff.length === 0) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando personal...</div>;
  }

  return (
    <section>
      {/* Cabecera unificada compartida */}
      <SectionHeader
        title="Personal del Evento"
        subtitle={`Total: ${getTotalStaff()} personas asignadas`}
        icon={Users}
        isEditing={isEditing}
        isDemo={isDemo}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={() => { setIsEditing(false); setFormData(staff); }}
      />

      <Card className="bg-section-staff border-none shadow-soft overflow-hidden">
        <CardContent className="p-6">
          {formData.length === 0 && !isEditing ? (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No hay personal asignado para este evento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Encabezados de tabla para desktop en modo edición */}
              {isEditing && (
                <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground uppercase px-4">
                  <span className="col-span-3">Rol / Función</span>
                  <span className="col-span-1 text-center">Cant.</span>
                  <span className="col-span-2">Entrada</span>
                  <span className="col-span-2">Salida</span>
                  <span className="col-span-3">Notas</span>
                  <span className="col-span-1"></span>
                </div>
              )}

              <div className="space-y-2">
                {formData.map((item, index) => (
                  <div key={index} className={`
                    p-4 rounded-xl transition-all duration-200
                    ${isEditing ? 'bg-background/40 border border-border/50' : 'bg-transparent border-b border-border/40 hover:bg-primary/5'}
                  `}>
                    {isEditing ? (
                      <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-12 md:gap-4 items-center">
                        <div className="md:col-span-3">
                          <Input
                            placeholder="Ej: Camarero"
                            list="roles-list"
                            value={item.role}
                            onChange={(e) => updateStaff(index, "role", e.target.value)}
                            className="bg-background/50 h-9"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3 md:contents">
                          <div className="md:col-span-1">
                            <Input
                              type="number"
                              min="1"
                              value={item.staff_count || ""}
                              onChange={(e) => updateStaff(index, "staff_count", parseInt(e.target.value) || 0)}
                              className="bg-background/50 h-9 text-center"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              type="time"
                              value={item.arrival_time || ""}
                              onChange={(e) => updateStaff(index, "arrival_time", e.target.value)}
                              className="bg-background/50 h-9 px-2"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              type="time"
                              value={item.departure_time || ""}
                              onChange={(e) => updateStaff(index, "departure_time", e.target.value)}
                              className="bg-background/50 h-9 px-2"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 md:col-span-4 mt-2 md:mt-0">
                          <Input
                            placeholder="Observaciones..."
                            value={item.notes || ""}
                            onChange={(e) => updateStaff(index, "notes", e.target.value)}
                            className="bg-background/50 h-9 flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => removeStaff(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-bold text-foreground mr-2">{item.role}</span>
                            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                              x{item.staff_count}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground ml-10 sm:ml-0">
                          {(item.arrival_time || item.departure_time) && (
                            <div className="flex items-center gap-1">
                              <span className="opacity-70 text-xs">HORARIO:</span>
                              <span className="font-medium text-foreground/80">
                                {item.arrival_time || '--:--'} - {item.departure_time || '--:--'}
                              </span>
                            </div>
                          )}
                          {item.notes && (
                            <div className="flex items-center gap-1 italic">
                              <span className="text-foreground/60">{item.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <datalist id="roles-list">
                    {DEFAULT_ROLES.map(role => (
                      <option key={role} value={role} />
                    ))}
                  </datalist>
                  <Button variant="outline" size="sm" onClick={() => addStaff()} className="border-dashed">
                    <Plus className="h-4 w-4 mr-2" /> Añadir Renglista
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
