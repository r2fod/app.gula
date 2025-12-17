import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TableDistributionProps {
  eventId: string;
}

interface Table {
  id?: string;
  table_name: string;
  guests: number;
  description: string;
}

const TableDistribution = ({ eventId }: TableDistributionProps) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Table[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTables();

    // Suscripción en tiempo real para tables
    const channel = supabase
      .channel(`tables-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          console.log('🔄 Cambio detectado en mesas, recargando...');
          fetchTables();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchTables = async () => {
    const { data } = await supabase
      .from("tables")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order");

    if (data) {
      setTables(data);
      setFormData(data);
    }
  };

  const handleSave = async () => {
    const existingIds = formData.filter(t => t.id).map(t => t.id);
    const toDelete = tables.filter(t => t.id && !existingIds.includes(t.id));
    
    if (toDelete.length > 0) {
      await supabase
        .from("tables")
        .delete()
        .in("id", toDelete.map(t => t.id!));
    }

    for (const table of formData) {
      if (table.id) {
        await supabase
          .from("tables")
          .update({
            table_name: table.table_name,
            guests: table.guests,
            description: table.description,
          })
          .eq("id", table.id);
      } else {
        await supabase
          .from("tables")
          .insert({
            event_id: eventId,
            table_name: table.table_name,
            guests: table.guests,
            description: table.description,
          });
      }
    }

    toast({ title: "Guardado", description: "Distribución de mesas actualizada" });
    setIsEditing(false);
    fetchTables();
  };

  const addTable = () => {
    setFormData([...formData, { table_name: "", guests: 0, description: "" }]);
  };

  const removeTable = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateTable = (index: number, field: keyof Table, value: string | number) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const totalPax = (isEditing ? formData : tables).reduce((sum, table) => sum + table.guests, 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Distribución de Mesas</h2>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setFormData(tables); }}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>
      <Card className="bg-section-staff border-none shadow-soft">
        <div className="p-6">
          <div className="mb-6 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <span className="font-semibold text-foreground">Total de Invitados en Mesas</span>
            </div>
            <span className="text-2xl font-bold text-primary">{totalPax}</span>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(isEditing ? formData : tables).map((table, index) => (
              <div key={table.id || index} className="p-4 rounded-lg bg-background/50 border-l-4 border-primary/50">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nombre mesa"
                        value={table.table_name}
                        onChange={(e) => updateTable(index, "table_name", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="PAX"
                        value={table.guests}
                        onChange={(e) => updateTable(index, "guests", parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <Button size="icon" variant="destructive" onClick={() => removeTable(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Descripción"
                      value={table.description}
                      onChange={(e) => updateTable(index, "description", e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-lg text-foreground">{table.table_name}</div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-bold text-primary">{table.guests}</span>
                      </div>
                    </div>
                    {table.description && (
                      <div className="text-sm text-muted-foreground">{table.description}</div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <Button onClick={addTable} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Mesa
            </Button>
          )}
        </div>
      </Card>
    </section>
  );
};

export default TableDistribution;
