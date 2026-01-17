import { AdminPanel } from '@/components/AdminPanel';
import { RequireRole } from '@/components/RoleGuard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Página de administración
 * Solo accesible para administradores
 */
export default function Admin() {
  const navigate = useNavigate();

  return (
    <RequireRole
      roles={['admin']}
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
            <p className="text-muted-foreground mb-6">
              No tienes permisos para acceder a esta página
            </p>
            <Button onClick={() => navigate('/events')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Eventos
            </Button>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate('/events')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </header>
        <AdminPanel />
      </div>
    </RequireRole>
  );
}
