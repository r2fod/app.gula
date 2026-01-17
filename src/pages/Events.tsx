import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, Plus, LogOut, Loader2, UtensilsCrossed, Building2, ChefHat, Activity, Menu, Settings } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ProfileSettings from "@/components/ProfileSettings";
import { useEvents } from "@/features/events/hooks/useEvents";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { useRole } from "@/contexts/RoleContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/**
 * Variantes de animación para la lista de eventos.
 * Crea un efecto de entrada escalonado (stagger) muy elegante.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

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
  const { events, loading: eventsLoading } = useEvents();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<{ company_name?: string; avatar_url?: string } | null>(null);
  const { user, isDemo, setDemoMode } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  // const { toast } = useToast(); // Ya no se necesita aquí si el hook maneja sus errores, pero profile fetching aún lo podría usar

  useEffect(() => {
    // Solo gestionamos la carga del perfil aquí, events lo maneja el hook
    if (user) {
      fetchProfile().then(() => setProfileLoading(false));

      const channelProfile = supabase
        .channel('profile-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, () => fetchProfile())
        .subscribe();

      return () => {
        supabase.removeChannel(channelProfile);
      };
    } else if (isDemo) {
      setProfile({ company_name: "Gula Catering (Demo)" });
      setProfileLoading(false);
    }
  }, [user, isDemo]);

  // Combinar estados de carga
  const isLoading = profileLoading || eventsLoading;

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
    if (isDemo) {
      setDemoMode(false);
      navigate("/");
    } else {
      await signOut();
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.company_name || "Logo"}
                    className="w-10 h-10 object-contain rounded-md bg-white border border-border shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div className="flex flex-col">
                  <h1 className="text-xl md:text-2xl font-bold truncate max-w-[200px] sm:max-w-none">
                    {profile?.company_name || "Mis Eventos"}
                  </h1>
                  {isDemo && (
                    <Badge variant="secondary" className="w-fit text-[10px] py-0 px-1.5 h-auto bg-amber-100 text-amber-700 border-amber-200">
                      Modo Demo
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4 w-full sm:w-auto">
                <ProfileSettings />

                {/* Menú hamburguesa para móvil/tablet */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/analytics" className="flex items-center cursor-pointer">
                        <Activity className="w-4 h-4 mr-2" />
                        Rendimiento
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/escandallos" className="flex items-center cursor-pointer">
                        <ChefHat className="w-4 h-4 mr-2" />
                        Escandallos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/menus" className="flex items-center cursor-pointer">
                        <UtensilsCrossed className="w-4 h-4 mr-2" />
                        Menús
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            Administración
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Botones para desktop */}
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link to="/analytics">
                    <Activity className="w-4 h-4 mr-2" />
                    Rendimiento
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link to="/escandallos">
                    <ChefHat className="w-4 h-4 mr-2" />
                    Escandallos
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link to="/menus">
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    Menús
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" asChild className="hidden md:flex">
                    <Link to="/admin">
                      <Settings className="w-4 h-4 mr-2" />
                      Administración
                    </Link>
                  </Button>
                )}

                <Button size="sm" asChild className="flex-1 sm:flex-none">
                  <Link to="/events/create">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Nuevo Evento</span>
                    <span className="md:hidden">Nuevo</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSignOut} title="Cerrar sesión">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center bg-card rounded-xl border border-dashed border-border"
            >
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No tienes eventos aún</h2>
              <p className="text-muted-foreground mb-6">Crea tu primer evento para comenzar</p>
              <Button asChild>
                <Link to="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Evento
                </Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {events.map((event) => (
                <motion.div key={event.id} variants={itemVariants}>
                  <Link to={`/events/${event.id}`}>
                    <Card className="p-6 hover:shadow-medium transition-all cursor-pointer h-full flex flex-col hover:border-primary/50 hover:bg-primary/5 group">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="secondary" className="group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          {eventTypeLabels[event.event_type] || event.event_type}
                        </Badge>
                        <Calendar className="w-5 h-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <h3 className="text-xl font-bold mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                        {event.venue}
                      </h3>

                      <div className="space-y-2 text-sm text-muted-foreground mt-auto">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="capitalize">
                            {(() => {
                              const date = new Date(event.event_date);
                              return isNaN(date.getTime())
                                ? "Fecha no definida"
                                : format(date, "EEEE, d 'de' MMMM", { locale: es });
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{event.total_guests} invitados</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Events;
