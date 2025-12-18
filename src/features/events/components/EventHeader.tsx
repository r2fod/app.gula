import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Edit, Save, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Event {
  id: string;
  event_type: string;
  event_date: string;
  venue: string;
  total_guests: number;
  adults: number | null;
  children: number | null;
  staff: number | null;
}

interface EventHeaderProps {
  event: Event;
  onUpdate: () => void;
}

const eventTypeLabels: Record<string, string> = {
  boda: "Boda",
  produccion: "Producción",
  evento_privado: "Evento Privado",
  delivery: "Delivery",
  comunion: "Comunión",
};

// Cabecera principal del evento.
// Muestra información clave (Lugar, Fecha, PAX) y permite la edición rápida de estos datos.
const EventHeader = ({ event, onUpdate }: EventHeaderProps) => {
  const { isDemo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    venue: event.venue,
    adults: event.adults || 0,
    children: event.children || 0,
    staff: event.staff || 0,
  });
  const { toast } = useToast();

  const totalGuests = formData.adults + formData.children + formData.staff;

  // Maneja la acción de guardado. 
  // En modo demo, previene la escritura y muestra un aviso.
  const handleSave = async () => {
    if (isDemo) {
      toast({
        title: "Modo Demo",
        description: "En el modo demo no se pueden modificar los eventos reales.",
      });
      setIsEditing(false);
      return;
    }

    // Actualiza los datos en Supabase para usuarios autenticados.
    const { error } = await supabase
      .from("events")
      .update({
        venue: formData.venue,
        adults: formData.adults,
        children: formData.children,
        staff: formData.staff,
        total_guests: totalGuests,
      })
      .eq("id", event.id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar los cambios",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Guardado",
        description: "Los cambios se guardaron correctamente",
      });
      setIsEditing(false);
      onUpdate(); // Callback para refrescar los datos en el padre.
    }
  };

  // Cancela la edición y restaura los valores originales.
  const handleCancel = () => {
    setFormData({
      venue: event.venue,
      adults: event.adults || 0,
      children: event.children || 0,
      staff: event.staff || 0,
    });
    setIsEditing(false);
  };

  const guestBreakdown = [];
  if (event.adults) guestBreakdown.push(`${event.adults} adultos`);
  if (event.children) guestBreakdown.push(`${event.children} niños`);
  if (event.staff) guestBreakdown.push(`${event.staff} staff`);

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-4">
              {eventTypeLabels[event.event_type] || event.event_type}
            </Badge>

            {isEditing ? (
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label htmlFor="venue" className="text-primary-foreground">Lugar del Evento</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
                  />
                </div>
              </div>
            ) : (
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 break-words">
                {event.venue}
              </h1>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-primary-foreground/90 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 shrink-0" />
                <span className="text-base md:text-lg">
                  {(() => {
                    const date = new Date(event.event_date);
                    return isNaN(date.getTime())
                      ? "Fecha no definida"
                      : format(date, "d 'de' MMMM, yyyy", { locale: es });
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 shrink-0" />
                <span className="text-base md:text-lg break-all">{event.venue}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-5 md:p-6 border border-primary-foreground/20 w-full lg:max-w-xs transition-all">
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="adults" className="text-[10px] text-primary-foreground/80 uppercase">Adultos</Label>
                    <Input
                      id="adults"
                      type="number"
                      value={formData.adults}
                      onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 0 })}
                      className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="children" className="text-[10px] text-primary-foreground/80 uppercase">Niños</Label>
                    <Input
                      id="children"
                      type="number"
                      value={formData.children}
                      onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                      className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff" className="text-[10px] text-primary-foreground/80 uppercase">Staff</Label>
                    <Input
                      id="staff"
                      type="number"
                      value={formData.staff}
                      onChange={(e) => setFormData({ ...formData, staff: parseInt(e.target.value) || 0 })}
                      className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 h-9"
                    />
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary-foreground/90">Total: {totalGuests}</div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={handleSave} className="bg-primary-foreground text-primary hover:bg-white flex-1">
                    <Save className="w-3 h-3 mr-1" />
                    Guardar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel} className="text-primary-foreground hover:bg-primary-foreground/10 flex-1">
                    <X className="w-3 h-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-[10px] text-primary-foreground/80 uppercase tracking-wider mb-1 font-semibold">Total Invitados</div>
                <div className="text-4xl font-bold mb-1">{event.total_guests}</div>
                {guestBreakdown.length > 0 && (
                  <div className="text-xs text-primary-foreground/80 mb-3 border-t border-primary-foreground/10 pt-1">
                    {guestBreakdown.join(" + ")}
                  </div>
                )}
                {!isDemo && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-1 border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 justify-center"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar PAX
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default EventHeader;
