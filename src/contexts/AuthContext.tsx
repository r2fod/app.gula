import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  setDemoMode: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isDemo: false,
  setDemoMode: () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado para controlar si estamos en modo demostración.
  // Se inicializa desde localStorage para persistir la sesión de invitado.
  const [isDemo, setIsDemo] = useState(() => {
    return localStorage.getItem("gula_demo_mode") === "true";
  });

  // Función para activar/desactivar el modo demo y guardarlo en el navegador.
  const setDemoMode = (value: boolean) => {
    setIsDemo(value);
    if (value) {
      localStorage.setItem("gula_demo_mode", "true");
    } else {
      localStorage.removeItem("gula_demo_mode");
      // Al salir de la demo, también limpiamos los eventos ficticios.
      localStorage.removeItem("gula_demo_events");
    }
  };

  useEffect(() => {
    // Suscripción a cambios en la autenticación de Supabase.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Si el usuario se loguea de verdad, desactivamos el modo demo.
        if (session?.user) {
          setDemoMode(false);
        }
        setLoading(false);
      }
    );

    // Obtener sesión inicial al cargar la app.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setDemoMode(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemo, setDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};
