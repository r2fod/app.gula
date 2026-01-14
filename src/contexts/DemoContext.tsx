import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DemoContextType {
  isDemoMode: boolean;
  canPerformAction: (action: string) => boolean;
  showUpgradePrompt: (feature: string) => void;
  demoLimits: {
    maxEvents: number;
    maxRecipes: number;
    maxIngredients: number;
    canExport: boolean;
    canUseAI: boolean;
    canAccessAnalytics: boolean;
  };
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está en modo demo
    // Un usuario está en demo si no está autenticado o tiene un flag específico
    setIsDemoMode(!user || user.email?.includes('demo@'));
  }, [user]);

  const demoLimits = {
    maxEvents: 3,
    maxRecipes: 10,
    maxIngredients: 20,
    canExport: false,
    canUseAI: true, // Permitir IA pero con límites
    canAccessAnalytics: false,
  };

  const canPerformAction = (action: string): boolean => {
    if (!isDemoMode) return true;

    const restrictedActions = [
      'export_data',
      'delete_all',
      'bulk_operations',
      'advanced_analytics',
      'custom_reports',
      'api_access',
    ];

    return !restrictedActions.includes(action);
  };

  const showUpgradePrompt = (feature: string) => {
    toast({
      title: "🔒 Función Premium",
      description: (
        <div className="space-y-2">
          <p>La función "{feature}" requiere una cuenta completa.</p>
          <p className="text-xs text-muted-foreground">
            Regístrate gratis para desbloquear todas las capacidades de Gula.
          </p>
        </div>
      ),
      action: (
        <button
          onClick={() => window.location.href = '/auth'}
          className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
        >
          Registrarse
        </button>
      ),
      duration: 6000,
    });
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, canPerformAction, showUpgradePrompt, demoLimits }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
