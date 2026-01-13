import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Users, Pizza, Wine, Truck, Package, PartyPopper, Utensils, Camera, Music, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Variantes de animación para el texto dinámico.
 * Definimos diferentes estilos para que la web elija uno al azar.
 */
const animationVariants = {
  typewriter: {
    container: {},
    item: (i: number) => ({
      opacity: [0, 1],
      transition: { delay: i * 0.08, duration: 0.15 }
    })
  },
  fadeScale: {
    container: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: "easeOut" }
    }
  },
  slideLeft: {
    container: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1.2, ease: "backOut" }
    }
  },
  slideUp: {
    container: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" }
    }
  }
};

/**
 * Componente que renderiza el texto animado basado en un modo aleatorio.
 */
const DynamicHeroText = ({ text, mode, loopKey }: { text: string; mode: string; loopKey: number }) => {
  const characters = text.split("");

  if (mode === "typewriter") {
    return (
      <motion.span key={loopKey} className="inline-block">
        {characters.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + (i * 0.08), duration: 0.15 }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    );
  }

  const variant = animationVariants[mode as keyof typeof animationVariants] || animationVariants.fadeScale;

  return (
    <motion.span
      key={loopKey}
      initial={variant.container}
      animate="visible"
      variants={{ visible: (variant as any).visible }}
      className="inline-block"
      style={{ willChange: "transform, opacity" }}
    >
      {text}
    </motion.span>
  );
};


const Index = () => {
  const { user, isDemo, setDemoMode } = useAuth();
  const navigate = useNavigate();
  // Estado para controlar el ciclo de la animación y el modo elegido al azar.
  const [loopKey, setLoopKey] = useState(0);
  const [animationMode, setAnimationMode] = useState("typewriter");

  // Redirección si el usuario ya está logueado o en modo demo
  useEffect(() => {
    if (user || isDemo) {
      navigate("/events");
    }
  }, [user, isDemo, navigate]);

  // Efecto para reiniciar la animación y elegir un nuevo modo al azar cada 6 segundos.
  useEffect(() => {
    const modes = Object.keys(animationVariants);

    // Elegir un modo inicial al azar
    setAnimationMode(modes[Math.floor(Math.random() * modes.length)]);

    const interval = setInterval(() => {
      setLoopKey((prev) => prev + 1);
      // Cambiar a una animación diferente en cada ciclo
      setAnimationMode(modes[Math.floor(Math.random() * modes.length)]);
    }, 8000); // 8 segundos para un ritmo más calmado y premium.

    return () => clearInterval(interval);
  }, []);

  // Manejador para activar el modo demo
  const handleDemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDemoMode(true);
    navigate("/events");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Las decoraciones globales de fondo ahora se manejan en PageDecorations.tsx */}

      <header className="relative container mx-auto px-4 py-6 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold leading-tight">Gestión de Eventos</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button asChild className="w-full sm:w-auto shadow-md">
              <Link to="/auth">Iniciar Sesión</Link>
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-12 md:py-20 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            {/* "Organiza Eventos" se queda estático para que la pantalla nunca parezca vacía */}
            <span className="inline-block mr-3">Organiza Eventos</span>
            <span className="block text-primary mt-2">
              <DynamicHeroText text="de Forma Profesional" mode={animationMode} loopKey={loopKey} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4"
          >
            Sistema completo para gestionar bodas, producciones, eventos privados, deliverys y comuniones.
            Todo en un solo lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 md:mb-20"
          >
            <Button size="lg" asChild className="text-lg px-8 w-full sm:w-auto shadow-xl hover:shadow-primary/30 transition-all">
              <Link to="/auth">
                Comenzar Gratis
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 w-full sm:w-auto bg-background/50 backdrop-blur-md border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={handleDemoClick}
            >
              Ver Demo
            </Button>
          </motion.div>

          {/* Tarjetas de características con animación de entrada escalonada y rápida */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-left mb-12 sm:mb-16 md:mb-20">
            {[
              {
                Icon: CheckCircle,
                title: "Organización Completa",
                description: "Gestiona menús, horarios, distribución de mesas, alérgenos y requisitos especiales en un solo lugar."
              },
              {
                Icon: Clock,
                title: "Ahorra Tiempo",
                description: "Plantillas para diferentes tipos de eventos que puedes personalizar rápidamente."
              },
              {
                Icon: Users,
                title: "Control Total",
                description: "Accede a todos tus eventos desde cualquier lugar y mantén todo bajo control."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                className="bg-card/90 backdrop-blur-md p-5 md:p-6 rounded-xl shadow-lg border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* App Showcase Video Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black/5">
              <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/5 transition-colors duration-500 z-10 pointer-events-none" />
              <img
                src="/demo_showcase.webp"
                alt="Showcase de la Aplicación"
                className="w-full h-auto aspect-video object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent z-20">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Descubre cómo funciona
                </h2>
                <p className="text-gray-300">
                  Una interfaz intuitiva diseñada para agilizar la gestión de tus eventos más complejos.
                </p>
              </div>
            </div>
          </motion.div>
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
