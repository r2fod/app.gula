import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Edit, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Event {
  id: string;
  event_type: string;
  event_date: string;
  venue: string;
  total_guests: number;
  adults: number | null;
  children: number | null;
  staff: number | null;
  canapes_per_person: number | null;
  notes: string | null;
}

const eventTypeLabels: Record<string, string> = {
  boda: "Boda",
  produccion: "Producción",
  evento_privado: "Evento Privado",
  delivery: "Delivery",
  comunion: "Comunión",
};

const EventDetail = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el evento",
        variant: "destructive",
      });
      navigate("/events");
    } else {
      setEvent(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  const guestBreakdown = [];
  if (event.adults) guestBreakdown.push(`${event.adults} adultos`);
  if (event.children) guestBreakdown.push(`${event.children} niños`);
  if (event.staff) guestBreakdown.push(`${event.staff} staff`);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/events")}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Eventos
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <Badge variant="secondary" className="mb-4">
                {eventTypeLabels[event.event_type] || event.event_type}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.venue}</h1>
              <div className="flex flex-wrap gap-4 text-primary-foreground/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg">
                    {format(new Date(event.event_date), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{event.venue}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20">
              <div className="text-sm text-primary-foreground/80 mb-1">Total Invitados</div>
              <div className="text-4xl font-bold">{event.total_guests}</div>
              {guestBreakdown.length > 0 && (
                <div className="text-sm text-primary-foreground/80 mt-1">
                  {guestBreakdown.join(" + ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Detalles del Evento</h2>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>

        <div className="grid gap-8">
          {event.canapes_per_person && (
            <div className="bg-section-info rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2">Canapés</h3>
              <p className="text-muted-foreground">
                {event.canapes_per_person} canapés por persona
              </p>
            </div>
          )}

          {event.notes && (
            <div className="bg-section-special rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2">Notas</h3>
              <p className="text-foreground whitespace-pre-wrap">{event.notes}</p>
            </div>
          )}

          <div className="bg-muted rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Esta es una vista básica del evento. Pronto podrás agregar más detalles como menú,
              horarios, distribución de mesas y requisitos especiales.
            </p>
            <Button variant="outline">
              Agregar más información
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;
