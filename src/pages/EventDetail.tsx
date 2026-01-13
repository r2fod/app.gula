import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
// Importación de componentes de la interfaz de usuario
import EventHeader from "@/features/events/components/EventHeader";
import Timeline from "@/features/events/components/Timeline";
import EventInfo from "@/features/events/components/EventInfo";
import MenuSection from "@/features/menu/components/MenuSection";
import SuppliesSection from "@/features/events/components/SuppliesSection";
import TableDistribution from "@/features/events/components/TableDistribution";
import SpecialRequirements from "@/features/events/components/SpecialRequirements";
import BeveragesSection from "@/features/events/components/BeveragesSection";
import CornersSection from "@/features/events/components/CornersSection";
import RoomEquipmentSection from "@/features/events/components/RoomEquipmentSection";
import StaffSection from "@/features/events/components/StaffSection";
import RentalsSection from "@/features/events/components/RentalsSection";
import { PurchaseOrderPanel } from "@/features/events/components/PurchaseOrderPanel";

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

const EventDetail = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDemo } = useAuth(); // Obtenemos el estado de demo desde el contexto

  useEffect(() => {
    fetchEvent();

    if (!id || isDemo) return; // Si es demo, no nos suscribimos a Supabase

    // Suscripción en tiempo real solo para eventos reales de Supabase
    const channel = supabase
      .channel(`event-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${id}`
        },
        () => {
          console.log('🔄 Cambio detectado en evento, recargando...');
          fetchEvent();
        }
      )
      .subscribe();

    // Cleanup de la suscripción
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, isDemo]);

  // Función para obtener los detalles del evento
  const fetchEvent = async () => {
    if (!id) return;

    // Si estamos en modo demo, buscamos en el localStorage
    if (isDemo) {
      const savedEventsRaw = localStorage.getItem("gula_demo_events");
      if (savedEventsRaw) {
        const savedEvents = JSON.parse(savedEventsRaw);
        const demoEvent = savedEvents.find((e: any) => e.id === id);
        if (demoEvent) {
          setEvent(demoEvent);
          setLoading(false);
          return;
        }
      }

      // Si no se encuentra el evento en demo, volvemos a la lista
      toast({
        title: "Evento no encontrado",
        description: "No se pudo encontrar el evento de demostración.",
        variant: "destructive",
      });
      navigate("/events");
      setLoading(false);
      return;
    }

    // Petición normal a Supabase para usuarios reales
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/events")}
          className="ml-4 mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Eventos
        </Button>
      </div>

      <EventHeader event={event} onUpdate={fetchEvent} />

      <main className="container mx-auto px-4 py-8 space-y-6 sm:space-y-8">
        {/* Sección 1: Timing y Resumen */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <Timeline eventId={event.id} />
          <CornersSection eventId={event.id} />
        </section>

        {/* Sección 2: Features del evento */}
        <EventInfo eventId={event.id} />

        {/* Sección 3: Menú */}
        <MenuSection eventId={event.id} />

        {/* Sección 3.5: Compras y Pedidos */}
        <section className="space-y-4">
          <PurchaseOrderPanel eventId={event.id} />
        </section>

        {/* Sección 4: Bebidas y Barra libre */}
        <BeveragesSection eventId={event.id} totalGuests={event.total_guests} />

        {/* Sección 5: Cristalería y Suministros */}
        <SuppliesSection eventId={event.id} totalGuests={event.total_guests} />

        {/* Sección 6: Equipamiento de sala y cocina */}
        <RoomEquipmentSection eventId={event.id} />

        {/* Sección 7: Personal */}
        <StaffSection eventId={event.id} />

        {/* Sección 8: Mesas */}
        <TableDistribution eventId={event.id} />

        {/* Sección 9: Alergias y requisitos especiales */}
        <SpecialRequirements eventId={event.id} />

        {/* Sección 10: Alquileres y seguimiento */}
        <RentalsSection eventId={event.id} />
      </main>

    </div>
  );
};

export default EventDetail;
