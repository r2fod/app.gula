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

      <main className="container mx-auto px-4 py-8 space-y-12">
        <Timeline eventId={event.id} />
        <EventInfo eventId={event.id} />
        <MenuSection eventId={event.id} />
        <SuppliesSection eventId={event.id} />
        <TableDistribution eventId={event.id} />
        <SpecialRequirements eventId={event.id} />
      </main>
    </div>
  );
};

export default EventDetail;
