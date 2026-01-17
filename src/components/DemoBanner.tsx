import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/contexts/DemoContext';
import { useNavigate } from 'react-router-dom';

/**
 * Banner informativo del modo demo.
 * Muestra información sobre las limitaciones del modo demo y permite cerrarlo.
 * El estado de cierre se guarda en la sesión actual.
 */
export function DemoBanner() {
  const { isDemoMode, demoLimits } = useDemo();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const bannerClosed = localStorage.getItem('gula_demo_banner_closed');
    if (bannerClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('gula_demo_banner_closed', 'true');
  };

  if (!isDemoMode || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white shadow-lg"
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              Modo Demo - Explorando Gula Catering
            </span>
            <span className="text-xs opacity-90 hidden md:inline whitespace-nowrap">
              (Límites: {demoLimits.maxEvents} eventos, {demoLimits.maxRecipes} recetas)
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-white/90 font-semibold text-xs sm:text-sm"
              onClick={() => navigate('/auth')}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Desbloquear Todo</span>
              <span className="sm:hidden">Desbloquear</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-white/20"
              onClick={handleClose}
              title="Cerrar banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
