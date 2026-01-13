import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Pizza, Wine, Truck, Package, Calendar, PartyPopper, Utensils,
  Camera, Music, Sparkles, Star, Heart, Coffee, Leaf,
  ClipboardList, CheckCircle, ChefHat, Cookie, Apple,
  Scale, ShoppingBag, TrendingUp, BarChart, Euro, Coins
} from "lucide-react";

/**
 * Componente que añade decoraciones dinámicas (objetos flotantes) en el fondo de las páginas.
 * Hemos aumentado la cantidad, variado los tamaños y mejorado la visibilidad según feedback del usuario.
 */
export const PageDecorations = () => {
  const location = useLocation();
  const path = location.pathname;

  /**
   * Obtiene la configuración de decoración según la ruta actual.
   * Aumentamos los contadores para una ambientación más rica.
   */
  const getPageConfig = () => {
    if (path === "/") {
      return {
        icons: [Pizza, Wine, Truck, PartyPopper, Sparkles, Utensils, Star, Heart],
        colors: ["text-amber-400/20", "text-rose-400/20", "text-primary/20", "text-blue-400/15"],
        count: 35
      };
    } else if (path.includes("/edit") || path.includes("/create")) {
      // Creación o edición: Enfoque en organización y escritura
      return {
        icons: [ClipboardList, CheckCircle, Sparkles, Star, Package],
        colors: ["text-blue-400/20", "text-primary/20", "text-indigo-400/15"],
        count: 20
      };
    } else if (path.startsWith("/events/")) {
      // Detalle de evento: Celebración y detalles
      return {
        icons: [Wine, Utensils, PartyPopper, Sparkles, Heart, Star, Camera],
        colors: ["text-amber-400/20", "text-rose-400/20", "text-primary/15", "text-blue-400/15"],
        count: 25
      };
    } else if (path === "/events") {
      return {
        icons: [Calendar, Package, ClipboardList, CheckCircle, PartyPopper],
        colors: ["text-blue-500/20", "text-primary/20", "text-slate-500/15"],
        count: 22
      };
    } else if (path === "/menus") {
      // Menús: Gastronomía y selección
      return {
        icons: [Utensils, Pizza, Cookie, Apple, Sparkles, Coffee],
        colors: ["text-orange-400/20", "text-primary/20", "text-yellow-500/15"],
        count: 22
      };
    } else if (path === "/escandallos") {
      return {
        icons: [ChefHat, Utensils, Pizza, Cookie, Apple],
        colors: ["text-orange-400/20", "text-primary/20", "text-yellow-500/15"],
        count: 25
      };
    } else if (path === "/ingredientes") {
      return {
        icons: [Package, Leaf, Scale, ShoppingBag, Truck],
        colors: ["text-emerald-500/20", "text-amber-700/15", "text-primary/15"],
        count: 20
      };
    } else if (path === "/analytics") {
      return {
        icons: [TrendingUp, BarChart, Euro, Coins, Sparkles],
        colors: ["text-green-500/20", "text-blue-500/20", "text-primary/20"],
        count: 22
      };
    } else if (path === "/auth") {
      // Login/Registro: Tranquilidad y seguridad
      return {
        icons: [Leaf, Sparkles, Coffee, Heart, CheckCircle],
        colors: ["text-emerald-400/15", "text-primary/15", "text-blue-400/10"],
        count: 15
      };
    }

    return {
      icons: [Sparkles, Star],
      colors: ["text-primary/15"],
      count: 12 // Aumentado de 6
    };
  };

  const config = getPageConfig();

  // Generamos los objetos con mayor variedad de tamaños y posiciones
  const objects = useMemo(() => {
    return Array.from({ length: config.count }).map((_, i) => ({
      Icon: config.icons[i % config.icons.length],
      color: config.colors[i % config.colors.length],
      // Rango de tamaños más amplio para dar profundidad
      size: 20 + Math.random() * 60,
      duration: 30 + Math.random() * 50,
      delay: Math.random() * -40,
      x: `${Math.random() * 110 - 5}%`, // Un poco fuera de los bordes para mayor naturalidad
      y: `${Math.random() * 110 - 5}%`,
      driftX: (Math.random() - 0.5) * 180,
      driftY: (Math.random() - 0.5) * 180,
      rotateDir: Math.random() > 0.5 ? 1 : -1,
    }));
  }, [path, config.count]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Capa de gradiente base para asegurar que los objetos se vean sobre el fondo correcto */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />

      {objects.map((obj, i) => (
        <motion.div
          key={`${path}-${i}`}
          className={`absolute ${obj.color} blur-[0.5px]`} // Sutil desenfoque para efecto de lente
          initial={{ left: obj.x, top: obj.y, opacity: 0 }}
          animate={{
            x: [0, obj.driftX, 0],
            y: [0, obj.driftY, 0],
            rotate: [0, 45 * obj.rotateDir, -45 * obj.rotateDir, 0],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: obj.duration,
            repeat: Infinity,
            delay: obj.delay,
            ease: "easeInOut",
          }}
          style={{ willChange: "transform, opacity" }}
        >
          <obj.Icon size={obj.size} strokeWidth={1} />
        </motion.div>
      ))}
    </div>
  );
};
