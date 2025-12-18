import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isDemo } = useAuth();

  // Mientras se carga la sesión, mostramos un spinner de carga.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si no hay usuario logueado Y no estamos en modo demo, redirigimos a la página de login.
  if (!user && !isDemo) {
    return <Navigate to="/auth" replace />;
  }

  // Si está autenticado o es demo, permitimos el acceso al contenido.
  return <>{children}</>;
};

export default ProtectedRoute;
