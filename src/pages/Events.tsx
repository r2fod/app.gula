import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, Plus, LogOut, Loader2, UtensilsCrossed, Building2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ProfileSettings from "@/components/ProfileSettings";

interface Event {
  id: string;
  event_type: string;
  event_date: string;
  venue: string;
  total_guests: number;
}

const eventTypeLabels: Record<string, string> = {
  boda: "Boda",
  produccion: "Producción",
  evento_privado: "Evento Privado",
  delivery: "Delivery",
  comunion: "Comunión",
  bautizo: "Bautizo",
  otros: "Otros",
};

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ company_name?: string; avatar_url?: string } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();

    // Suscripción en tiempo real para eventos y cambios en perfil
    const channelEvents = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${user?.id}` }, () => fetchEvents())
      .subscribe();

    const channelProfile = supabase
      .channel('profile-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` }, () => fetchProfile())
      .subscribe();

    return () => {
      supabase.removeChannel(channelEvents);
      supabase.removeChannel(channelProfile);
    };
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchProfile()]);
    setLoading(false);
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los eventos", variant: "destructive" });
    } else {
      setEvents(data || []);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("company_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.company_name || "Logo"}
                  className="w-10 h-10 object-contain rounded-md bg-white border border-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
              <h1 className="text-2xl font-bold">
                {profile?.company_name || "Mis Eventos"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <ProfileSettings />
              <Button variant="outline" asChild className="hidden md:flex">
                <Link to="/menus">
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Menús
                </Link>
              </Button>
              <Button asChild>
                <Link to="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Nuevo Evento</span>
                  <span className="md:hidden">Nuevo</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Cerrar sesión">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {events.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No tienes eventos aún</h2>
            <p className="text-muted-foreground mb-6">Create tu primer evento para comenzar</p>
            <Button asChild>
              <Link to="/events/create">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Evento
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="p-6 hover:shadow-medium transition-shadow cursor-pointer h-full flex flex-col hover:border-primary/50">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary">
                      {eventTypeLabels[event.event_type] || event.event_type}
                    </Badge>
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>

                  <h3 className="text-xl font-bold mb-4 line-clamp-2">{event.venue}</h3>

                  <div className="space-y-2 text-sm text-muted-foreground mt-auto">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="capitalize">
                        {format(new Date(event.event_date), "EEEE, d 'de' MMMM", {
                          locale: es,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.total_guests} invitados</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Events;
