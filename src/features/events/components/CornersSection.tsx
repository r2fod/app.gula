import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X, Citrus, Beer, CircleDot, Utensils } from "lucide-react";

interface CornersSectionProps {
  eventId: string;
}

interface Corner {
  id?: string;
  corner_type: string;
  is_enabled: boolean;
  pax_count?: number;
  notes?: string;
}

const CORNER_TYPES = [
  { key: 'limonada', label: 'Corner Limonada y Agua', icon: Citrus },
  { key: 'cervezas', label: 'Corner Cervezas y Vermut', icon: Beer },
  { key: 'queso', label: 'Corner Queso', icon: CircleDot },
  { key: 'jamon', label: 'Cortador Jamón', icon: Utensils },
];

export default function CornersSection({ eventId }: CornersSectionProps) {
  const { toast } = useToast();
  const [corners, setCorners] = useState<Corner[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Corner[]>([]);

  useEffect(() => {
    fetchCorners();
  }, [eventId]);

  const fetchCorners = async () => {
    const { data, error } = await supabase
      .from("corners")
      .select("*")
      .eq("event_id", eventId);

    if (!error && data) {
      // Asegurar que todos los tipos de corner existen
      const existingTypes = data.map(c => c.corner_type);
      const allCorners = CORNER_TYPES.map(type => {
        const existing = data.find(c => c.corner_type === type.key);
        return existing || { corner_type: type.key, is_enabled: false };
      });
      setCorners(allCorners);
      setFormData(allCorners);
    } else {
      // Crear corners por defecto
      const defaultCorners = CORNER_TYPES.map(type => ({
        corner_type: type.key,
        is_enabled: false,
      }));
      setCorners(defaultCorners);
      setFormData(defaultCorners);
    }
  };

  const handleSave = async () => {
    for (const corner of formData) {
      const record = {
        event_id: eventId,
        corner_type: corner.corner_type,
        is_enabled: corner.is_enabled,
        pax_count: corner.pax_count || null,
        notes: corner.notes || null,
      };

      if (corner.id) {
        await supabase.from("corners").update(record).eq("id", corner.id);
      } else {
        await supabase.from("corners").insert(record);
      }
    }

    toast({ title: "Corners guardados" });
    setIsEditing(false);
    fetchCorners();
  };

  const updateCorner = (index: number, field: keyof Corner, value: any) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const getCornerConfig = (type: string) => {
    return CORNER_TYPES.find(t => t.key === type);
  };

  return (
    <Card className="bg-section-special">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CircleDot className="h-5 w-5 text-primary" />
          Corners Especiales
        </CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setFormData(corners); }}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.map((corner, index) => {
            const config = getCornerConfig(corner.corner_type);
            if (!config) return null;
            const Icon = config.icon;

            return (
              <div 
                key={corner.corner_type} 
                className={`p-4 rounded-lg border ${corner.is_enabled ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${corner.is_enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Label className="font-medium">{config.label}</Label>
                  </div>
                  {isEditing ? (
                    <Switch
                      checked={corner.is_enabled}
                      onCheckedChange={(checked) => updateCorner(index, "is_enabled", checked)}
                    />
                  ) : (
                    <span className={`text-sm font-medium ${corner.is_enabled ? 'text-primary' : 'text-muted-foreground'}`}>
                      {corner.is_enabled ? 'SÍ' : 'NO'}
                    </span>
                  )}
                </div>

                {corner.is_enabled && (
                  <div className="space-y-2 mt-2">
                    {(corner.corner_type === 'queso' || corner.corner_type === 'cervezas') && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground w-20">PAX:</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            className="w-24"
                            value={corner.pax_count || ""}
                            onChange={(e) => updateCorner(index, "pax_count", parseInt(e.target.value) || 0)}
                          />
                        ) : (
                          <span className="font-medium">{corner.pax_count || '-'}</span>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">Notas:</Label>
                      {isEditing ? (
                        <Textarea
                          className="mt-1 text-sm"
                          rows={2}
                          value={corner.notes || ""}
                          onChange={(e) => updateCorner(index, "notes", e.target.value)}
                          placeholder="Detalles adicionales..."
                        />
                      ) : (
                        <p className="text-sm mt-1">{corner.notes || 'Sin notas'}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
