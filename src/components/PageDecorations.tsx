import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Pizza, Wine, Truck, Package, Calendar, PartyPopper, Utensils, Camera, Music, Sparkles, Star, Heart, Coffee, Leaf } from "lucide-react";

/**
 * Componente que añade decoraciones sutiles (objetos flotantes) dentro de las páginas.
 * Las decoraciones cambian según el contexto de la ruta para dar personalidad propia a cada sección.
 */
export const PageDecorations = () => {
  const location = useLocation();
  const path = location.pathname;

  // No mostrar decoraciones extra en la Home (ya tiene las suyas propias)
  if (path === "/") return null;

  // Definir conjuntos de iconos y colores según la página
  const getPageConfig = () => {
    if (path.startsWith("/events/")) {
      // Detalle de evento o edición: Un toque festivo y organizado
      return {
        icons: [Star, Wine, Utensils, Sparkles, Heart],
        colors: ["text-amber-300/10", "text-rose-300/10", "text-primary/5", "text-blue-300/5"],
        count: 8
      };
    } else if (path === "/events") {
      // Lista de eventos: Enfocado a organización y calendario
      return {
        icons: [Calendar, Package, ClipboardList, CheckCircle],
        colors: ["text-blue-400/10", "text-primary/5", "text-slate-400/10"],
        count: 6
      };
    } else if (path === "/auth") {
      // Login/Registro: Muy sutil y calmado
      return {
        icons: [Leaf, Sparkles, Coffee],
        colors: ["text-emerald-300/5", "text-primary/5"],
        count: 4
      };
    }
    // Fallback general
    return {
      icons: [Sparkles],
      colors: ["text-primary/5"],
      count: 4
    };
  };

  const config = getPageConfig();

  const objects = useMemo(() => {
    return Array.from({ length: config.count }).map((_, i) => ({
      Icon: config.icons[i % config.icons.length],
      color: config.colors[i % config.colors.length],
      size: 15 + Math.random() * 25,
      duration: 30 + Math.random() * 30, // Movimiento muy lento
      delay: Math.random() * 10,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      driftX: (Math.random() - 0.5) * 80,
      driftY: (Math.random() - 0.5) * 80,
    }));
  }, [path]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {objects.map((obj, i) => (
        <motion.div
          key={i}
          className={`absolute ${obj.color}`}
          initial={{ left: obj.x, top: obj.y, opacity: 0 }}
          animate={{
            x: [0, obj.driftX, 0],
            y: [0, obj.driftY, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: obj.duration,
            repeat: Infinity,
            delay: obj.delay,
            ease: "easeInOut",
          }}
        >
          <obj.Icon size={obj.size} />
        </motion.div>
      ))}
    </div>
  );
};

// Iconos adicionales para el switch de arriba
import { ClipboardList, CheckCircle } from "lucide-react";
