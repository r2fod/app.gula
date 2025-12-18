import { motion, AnimatePresence, Variants } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

/**
 * Variantes de animación personalizadas para diferentes tipos de páginas.
 * El "IA" (lógica del componente) decide cuál usar según la ruta.
 */
const pageVariants: Record<string, Variants> = {
  // Transición ultra-rápida y limpia para la Home
  landing: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  },
  // Navegación casi instantánea para contenido
  content: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  },
  // Auth rápido y directo
  auth: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },
  // Fallback instantáneo
  default: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.1 }
    }
  }
};

/**
 * Gestor de transiciones de página.
 * Envuelve el contenido de la ruta y aplica la animación decidida por "inteligencia" de ruta.
 */
export const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const path = location.pathname;

  // Lógica de decisión de animación ("AI Engine" simple)
  let mode = "default";

  if (path === "/") mode = "landing";
  else if (path === "/events" || path.startsWith("/events/")) mode = "content";
  else if (path === "/auth") mode = "auth";

  const variant = pageVariants[mode as keyof typeof pageVariants];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variant}
        className="w-full min-h-screen"
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
