import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TimelineProps {
  eventId: string;
}

interface EventTiming {
  guest_arrival: string | null;
  ceremony: string | null;
  bar_start: string | null;
  cocktail_start: string | null;
  banquet_start: string | null;
  bar_end: string | null;
  bar_hours: number | null;
}

const Timeline = ({ eventId }: TimelineProps) => {
  const [timings, setTimings] = useState<EventTiming | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EventTiming>({
    guest_arrival: null,
    ceremony: null,
    bar_start: null,
    cocktail_start: null,
    banquet_start: null,
    bar_end: null,
    bar_hours: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTimings();

    // Suscripción en tiempo real para event_timings
    const channel = supabase
      .channel(`event-timings-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_timings',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          console.log('🔄 Cambio detectado en horarios, recargando...');
          fetchTimings();
        }
      )
      .subscribe();

    // Cleanup: desuscribirse al desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchTimings = async () => {
    const { data, error } = await supabase
      .from("event_timings")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (!error && data) {
      setTimings(data);
      setFormData(data);
    }
  };

  // Calcular automáticamente bar_hours cuando cambian bar_start o bar_end
  const calculateBarHours = (barStart: string | null, barEnd: string | null): number | null => {
    if (!barStart || !barEnd) return null;

    const start = barStart.split(':');
    const end = barEnd.split(':');
    const startHours = parseInt(start[0]) + parseInt(start[1]) / 60;
    let endHours = parseInt(end[0]) + parseInt(end[1]) / 60;

    // Manejar cruce de medianoche
    if (endHours < startHours) endHours += 24;

    return Math.max(1, Math.round(endHours - startHours));
  };

  const handleSave = async () => {
    // Calcular bar_hours automáticamente si hay bar_start y bar_end
    let dataToSave = { ...formData };

    if (formData.bar_start && formData.bar_end) {
      const calculatedHours = calculateBarHours(formData.bar_start, formData.bar_end);

      // Si el usuario cambió manualmente bar_hours y es diferente al calculado, mostrar advertencia
      if (formData.bar_hours && calculatedHours && formData.bar_hours !== calculatedHours) {
        toast({
          title: "⚠️ Advertencia",
          description: `Las horas de barra libre (${formData.bar_hours}h) no coinciden con el horario (${calculatedHours}h). Se usará el valor calculado.`,
          variant: "default",
        });
      }

      dataToSave.bar_hours = calculatedHours;
    }

    const { data: existing } = await supabase
      .from("event_timings")
      .select("id")
      .eq("event_id", eventId)
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("event_timings")
        .update(dataToSave)
        .eq("event_id", eventId));
    } else {
      ({ error } = await supabase
        .from("event_timings")
        .insert({ ...dataToSave, event_id: eventId }));
    }

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar los horarios",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Guardado",
        description: "Los horarios se guardaron correctamente",
      });
      setIsEditing(false);
      fetchTimings();
    }
  };

  const events = [
    { key: "guest_arrival", label: "Llegada de Invitados" },
    { key: "ceremony", label: "Ceremonia" },
    { key: "bar_start", label: "Inicio Barra Libre" },
    { key: "cocktail_start", label: "Inicio Cocktail" },
    { key: "banquet_start", label: "Inicio Banquete" },
    { key: "bar_end", label: "Fin Barra Libre" },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Horarios</h2>
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
            <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setFormData(timings || formData); }}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>
      <Card className="bg-section-info border-none shadow-soft">
        <div className="p-6">
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.key} className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                {isEditing ? (
                  <Input
                    type="time"
                    value={formData[event.key as keyof EventTiming] || ""}
                    onChange={(e) => setFormData({ ...formData, [event.key]: e.target.value })}
                    className="w-32"
                  />
                ) : (
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    {timings?.[event.key as keyof EventTiming] || "--:--"}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-lg text-foreground">{event.label}</div>
                </div>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}

            {/* Campo para horas de barra libre */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border-2 border-primary/20">
              {isEditing ? (
                <Input
                  type="number"
                  min="0"
                  max="24"
                  value={formData.bar_hours || ""}
                  onChange={(e) => setFormData({ ...formData, bar_hours: parseInt(e.target.value) || null })}
                  className="w-32"
                  placeholder="Horas"
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {timings?.bar_hours || "--"}
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-lg text-foreground">Horas de Barra Libre</div>
                <div className="text-sm text-muted-foreground">Duración total de la barra (para cálculo de bebidas)</div>
              </div>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default Timeline;
