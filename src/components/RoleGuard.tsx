import { ReactNode } from 'react';
import { useRole, RolePermissions } from '@/contexts/RoleContext';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

interface RoleGuardProps {
  resource: keyof RolePermissions;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
  showToast?: boolean;
}

export function RoleGuard({ 
  resource, 
  action, 
  children, 
  fallback = null,
  showToast = true 
}: RoleGuardProps) {
  const { hasPermission, role, loading } = useRole();
  const { toast } = useToast();

  if (loading) {
    return <>{fallback}</>;
  }

  const canAccess = hasPermission(resource, action);

  if (!canAccess) {
    if (showToast) {
      const handleClick = () => {
        toast({
          title: "🔒 Permiso Denegado",
          description: (
            <div className="space-y-2">
              <p>No tienes permisos para realizar esta acción.</p>
              <p className="text-xs text-muted-foreground">
                Tu rol actual: <span className="font-semibold">{role}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Contacta con un administrador si necesitas acceso.
              </p>
            </div>
          ),
          variant: "destructive",
          duration: 5000,
        });
      };

      return (
        <div onClick={handleClick} className="cursor-not-allowed opacity-50">
          {fallback || children}
        </div>
      );
    }

    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireRoleProps {
  roles: Array<'admin' | 'manager' | 'staff' | 'viewer'>;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { role, loading } = useRole();

  if (loading) {
    return <>{fallback}</>;
  }

  if (!role || !roles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleBadgeProps {
  className?: string;
}

export function RoleBadge({ className = '' }: RoleBadgeProps) {
  const { role, loading } = useRole();

  if (loading || !role) return null;

  const roleColors = {
    admin: 'bg-red-100 text-red-800 border-red-300',
    manager: 'bg-blue-100 text-blue-800 border-blue-300',
    staff: 'bg-green-100 text-green-800 border-green-300',
    viewer: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const roleLabels = {
    admin: 'Administrador',
    manager: 'Gerente',
    staff: 'Personal',
    viewer: 'Visualizador',
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${roleColors[role]} ${className}`}>
      <Shield className="h-3 w-3" />
      {roleLabels[role]}
    </div>
  );
}
