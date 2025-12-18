import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X, Plus, Trash2, Users } from "lucide-react";

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

const DEFAULT_ROLES = [
  "Coordinador",
  "Camarero sala",
  "Camarero cocina",
  "Cocinero",
  "Ayudante cocina",
  "Barra",
  "DJ/Música",
];

export default function StaffSection({ eventId }: StaffSectionProps) {
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Staff[]>([]);

  useEffect(() => {
    fetchStaff();
  }, [eventId]);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from("event_staff")
      .select("*")
      .eq("event_id", eventId)
      .order("role", { ascending: true });

    if (!error && data) {
      setStaff(data);
      setFormData(data);
    }
  };

  const handleSave = async () => {
    const existingIds = staff.map(s => s.id).filter(Boolean);
    const newIds = formData.map(s => s.id).filter(Boolean);
    const toDelete = existingIds.filter(id => !newIds.includes(id));

    for (const id of toDelete) {
      await supabase.from("event_staff").delete().eq("id", id);
    }

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
        await supabase.from("event_staff").update(record).eq("id", item.id);
      } else {
        await supabase.from("event_staff").insert(record);
      }
    }

    toast({ title: "Personal guardado" });
    setIsEditing(false);
    fetchStaff();
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
    return formData.reduce((sum, s) => sum + (s.staff_count || 0), 0);
  };

  return (
    <Card className="bg-section-staff">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Personal del Evento
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({getTotalStaff()} personas)
          </span>
        </CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setFormData(staff); }}>
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
          <p className="text-muted-foreground text-sm py-4">No hay personal asignado</p>
        ) : (
          <div className="space-y-2">
            {isEditing && (
              <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground mb-2 px-1">
                <span className="col-span-3">Rol</span>
                <span className="col-span-2">Cantidad</span>
                <span className="col-span-2">Entrada</span>
                <span className="col-span-2">Salida</span>
                <span className="col-span-2">Notas</span>
                <span className="col-span-1"></span>
              </div>
            )}
            
            {formData.map((item, index) => (
              isEditing ? (
                <div key={index} className="space-y-2 md:space-y-0 md:grid md:grid-cols-12 gap-2 items-center p-3 md:p-0 bg-muted/30 md:bg-transparent rounded-lg md:rounded-none">
                  <div className="md:col-span-3">
                    <label className="text-xs text-muted-foreground md:hidden mb-1 block">Rol</label>
                    <Input
                      placeholder="Rol"
                      list="roles-list"
                      value={item.role}
                      onChange={(e) => updateStaff(index, "role", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:contents">
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground md:hidden mb-1 block">Cant.</label>
                      <Input
                        type="number"
                        min="0"
                        value={item.staff_count || ""}
                        onChange={(e) => updateStaff(index, "staff_count", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground md:hidden mb-1 block">Entrada</label>
                      <Input
                        type="time"
                        value={item.arrival_time || ""}
                        onChange={(e) => updateStaff(index, "arrival_time", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground md:hidden mb-1 block">Salida</label>
                      <Input
                        type="time"
                        value={item.departure_time || ""}
                        onChange={(e) => updateStaff(index, "departure_time", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 md:contents">
                    <div className="flex-1 md:col-span-2">
                      <label className="text-xs text-muted-foreground md:hidden mb-1 block">Notas</label>
                      <Input
                        placeholder="Notas"
                        value={item.notes || ""}
                        onChange={(e) => updateStaff(index, "notes", e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:col-span-1 self-end md:self-auto"
                      onClick={() => removeStaff(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-border last:border-0 gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.role}</span>
                    <span className="text-primary font-semibold">x{item.staff_count}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
                    {item.arrival_time && (
                      <span className="text-xs sm:text-sm">Entrada: {item.arrival_time}</span>
                    )}
                    {item.departure_time && (
                      <span className="text-xs sm:text-sm">Salida: {item.departure_time}</span>
                    )}
                    {item.notes && <span className="text-xs sm:text-sm">{item.notes}</span>}
                  </div>
                </div>
              )
            ))}

            {isEditing && (
              <>
                <datalist id="roles-list">
                  {DEFAULT_ROLES.map(role => (
                    <option key={role} value={role} />
                  ))}
                </datalist>
                <Button variant="outline" size="sm" onClick={() => addStaff()} className="mt-2">
                  <Plus className="h-4 w-4 mr-1" /> Añadir personal
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
