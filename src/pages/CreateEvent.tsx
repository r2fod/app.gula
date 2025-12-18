import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const CreateEvent = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_type: "",
    event_date: "",
    venue: "",
    total_guests: "",
    adults: "",
    children: "",
    staff: "",
    canapes_per_person: "",
    notes: "",
  });

  const { user, isDemo } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const eventPayload = {
      user_id: user?.id!,
      event_type: formData.event_type as "boda" | "produccion" | "evento_privado" | "delivery" | "comunion",
      event_date: formData.event_date,
      venue: formData.venue,
      total_guests: parseInt(formData.total_guests) || 0,
      adults: formData.adults ? parseInt(formData.adults) : 0,
      children: formData.children ? parseInt(formData.children) : 0,
      staff: formData.staff ? parseInt(formData.staff) : 0,
      canapes_per_person: formData.canapes_per_person ? parseInt(formData.canapes_per_person) : 0,
      notes: formData.notes || null,
    };

    // Si estamos en modo demo, guardamos en localStorage
    if (isDemo) {
      const mockId = crypto.randomUUID();
      const newEvent = { ...eventPayload, id: mockId, user_id: 'demo-user', created_at: new Date().toISOString() };

      const savedEventsRaw = localStorage.getItem("gula_demo_events");
      const savedEvents = savedEventsRaw ? JSON.parse(savedEventsRaw) : [];
      localStorage.setItem("gula_demo_events", JSON.stringify([...savedEvents, newEvent]));

      toast({
        title: "¡Evento creado (Modo Demo)!",
        description: "El evento se ha guardado localmente en tu navegador.",
      });

      navigate(`/events/${mockId}`);
      return;
    }

    // Proceso real con Supabase
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .insert(eventPayload)
      .select()
      .single();

    if (eventError) {
      toast({
        title: "Error",
        description: "No se pudo crear el evento",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Crear registros relacionados vacíos
    await supabase.from("event_timings").insert({ event_id: eventData.id });
    await supabase.from("event_features").insert({ event_id: eventData.id });

    toast({
      title: "¡Evento creado!",
      description: "El evento se ha creado correctamente",
    });

    navigate(`/events/${eventData.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/events")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Eventos
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Crear Nuevo Evento</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo de Evento *</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boda">Boda</SelectItem>
                  <SelectItem value="produccion">Producción</SelectItem>
                  <SelectItem value="evento_privado">Evento Privado</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="comunion">Comunión</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Fecha del Evento *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Lugar *</Label>
              <Input
                id="venue"
                type="text"
                placeholder="Ej: Molí Ballestar"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_guests">Total Invitados *</Label>
                <Input
                  id="total_guests"
                  type="number"
                  placeholder="0"
                  value={formData.total_guests}
                  onChange={(e) => setFormData({ ...formData, total_guests: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adults">Adultos</Label>
                <Input
                  id="adults"
                  type="number"
                  placeholder="0"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Niños</Label>
                <Input
                  id="children"
                  type="number"
                  placeholder="0"
                  value={formData.children}
                  onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff">Staff</Label>
                <Input
                  id="staff"
                  type="number"
                  placeholder="0"
                  value={formData.staff}
                  onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="canapes_per_person">Canapés por Persona</Label>
              <Input
                id="canapes_per_person"
                type="number"
                placeholder="0"
                value={formData.canapes_per_person}
                onChange={(e) => setFormData({ ...formData, canapes_per_person: e.target.value })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional sobre el evento..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/events")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Evento
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default CreateEvent;
