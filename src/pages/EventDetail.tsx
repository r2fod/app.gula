import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import EventHeader from "@/components/EventHeader";
import Timeline from "@/components/Timeline";
import EventInfo from "@/components/EventInfo";
import MenuSection from "@/components/MenuSection";
import SuppliesSection from "@/components/SuppliesSection";
import TableDistribution from "@/components/TableDistribution";
import SpecialRequirements from "@/components/SpecialRequirements";
import BeveragesSection from "@/components/BeveragesSection";
import CornersSection from "@/components/CornersSection";
import RoomEquipmentSection from "@/components/RoomEquipmentSection";
import StaffSection from "@/components/StaffSection";
import RentalsSection from "@/components/RentalsSection";
import AIAssistant from "@/components/AIAssistant";

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

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Sección 1: Timing y Resumen */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Timeline eventId={event.id} />
          <CornersSection eventId={event.id} />
        </section>

        {/* Sección 2: Features del evento */}
        <EventInfo eventId={event.id} />

        {/* Sección 3: Menú */}
        <MenuSection eventId={event.id} />

        {/* Sección 4: Bebidas y Barra libre */}
        <BeveragesSection eventId={event.id} totalGuests={event.total_guests} />

        {/* Sección 5: Cristalería y Suministros */}
        <SuppliesSection eventId={event.id} />

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

      {/* AI Assistant */}
      <AIAssistant eventId={event.id} />
    </div>
  );
};

export default EventDetail;
