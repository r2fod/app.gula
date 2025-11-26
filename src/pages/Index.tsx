import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Users } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/events");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-section-info to-section-menu">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Gestión de Eventos</span>
          </div>
          <Button asChild>
            <Link to="/auth">Iniciar Sesión</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Organiza Eventos
            <span className="block text-primary mt-2">de Forma Profesional</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Sistema completo para gestionar bodas, producciones, eventos privados, deliverys y comuniones.
            Todo en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/auth">
                Comenzar Gratis
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link to="/auth">
                Ver Demo
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-card p-6 rounded-lg shadow-soft">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Organización Completa</h3>
              <p className="text-muted-foreground">
                Gestiona menús, horarios, distribución de mesas, alergias y requisitos especiales en un solo lugar.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-soft">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ahorra Tiempo</h3>
              <p className="text-muted-foreground">
                Plantillas para diferentes tipos de eventos que puedes personalizar rápidamente.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-soft">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Control Total</h3>
              <p className="text-muted-foreground">
                Accede a todos tus eventos desde cualquier lugar y mantén todo bajo control.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Sistema de Gestión de Eventos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
