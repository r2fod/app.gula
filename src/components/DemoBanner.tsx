import { motion } from 'framer-motion';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/contexts/DemoContext';
import { useNavigate } from 'react-router-dom';

export function DemoBanner() {
  const { isDemoMode, demoLimits } = useDemo();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white shadow-lg"
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Modo Demo - Explorando Gula Catering
          </span>
          <span className="text-xs opacity-90 hidden sm:inline">
            (Límites: {demoLimits.maxEvents} eventos, {demoLimits.maxRecipes} recetas)
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white text-orange-600 hover:bg-white/90 font-semibold"
          onClick={() => navigate('/auth')}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Desbloquear Todo
        </Button>
      </div>
    </motion.div>
  );
}
