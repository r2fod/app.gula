import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export interface RolePermissions {
  events: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  };
  recipes: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  };
  ingredients: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  };
  menus: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  };
  analytics: {
    read: boolean;
    export: boolean;
    advanced: boolean;
  };
  users: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    manage_roles: boolean;
  };
  settings: {
    read: boolean;
    update: boolean;
  };
  ai: {
    use: boolean;
    unlimited: boolean;
  };
  bulk_operations: boolean;
  api_access: boolean;
}

interface RoleContextType {
  role: UserRole | null;
  permissions: RolePermissions | null;
  loading: boolean;
  hasPermission: (resource: keyof RolePermissions, action: string) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  isViewer: boolean;
  canPerform: (resource: keyof RolePermissions, action: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    events: { create: true, read: true, update: true, delete: true, export: true },
    recipes: { create: true, read: true, update: true, delete: true, export: true },
    ingredients: { create: true, read: true, update: true, delete: true, export: true },
    menus: { create: true, read: true, update: true, delete: true, export: true },
    analytics: { read: true, export: true, advanced: true },
    users: { create: true, read: true, update: true, delete: true, manage_roles: true },
    settings: { read: true, update: true },
    ai: { use: true, unlimited: true },
    bulk_operations: true,
    api_access: true,
  },
  manager: {
    events: { create: true, read: true, update: true, delete: true, export: true },
    recipes: { create: true, read: true, update: true, delete: false, export: true },
    ingredients: { create: true, read: true, update: true, delete: false, export: true },
    menus: { create: true, read: true, update: true, delete: true, export: true },
    analytics: { read: true, export: true, advanced: true },
    users: { create: false, read: true, update: false, delete: false, manage_roles: false },
    settings: { read: true, update: false },
    ai: { use: true, unlimited: true },
    bulk_operations: true,
    api_access: false,
  },
  staff: {
    events: { create: true, read: true, update: true, delete: false, export: false },
    recipes: { create: false, read: true, update: false, delete: false, export: false },
    ingredients: { create: false, read: true, update: false, delete: false, export: false },
    menus: { create: false, read: true, update: true, delete: false, export: false },
    analytics: { read: true, export: false, advanced: false },
    users: { create: false, read: false, update: false, delete: false, manage_roles: false },
    settings: { read: false, update: false },
    ai: { use: true, unlimited: false },
    bulk_operations: false,
    api_access: false,
  },
  viewer: {
    events: { create: false, read: true, update: false, delete: false, export: false },
    recipes: { create: false, read: true, update: false, delete: false, export: false },
    ingredients: { create: false, read: true, update: false, delete: false, export: false },
    menus: { create: false, read: true, update: false, delete: false, export: false },
    analytics: { read: true, export: false, advanced: false },
    users: { create: false, read: false, update: false, delete: false, manage_roles: false },
    settings: { read: false, update: false },
    ai: { use: true, unlimited: false },
    bulk_operations: false,
    api_access: false,
  },
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    if (!user) {
      setRole(null);
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Obtener rol del usuario desde profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Error fetching profile, using default viewer role:', profileError);
        setRole('viewer');
        setPermissions(DEFAULT_PERMISSIONS.viewer);
        setLoading(false);
        return;
      }

      if (!profile) {
        setRole('viewer');
        setPermissions(DEFAULT_PERMISSIONS.viewer);
        setLoading(false);
        return;
      }

      // Verificar si tiene columna role (después de migración)
      const userRole = (profile as any).role as UserRole || 'viewer';
      const isActive = (profile as any).is_active !== false;

      if (!isActive) {
        setRole(null);
        setPermissions(null);
        setLoading(false);
        return;
      }

      setRole(userRole);

      // Intentar obtener permisos de la tabla role_permissions
      try {
        const { data: rolePerms } = await supabase
          .from('role_permissions' as any)
          .select('permissions')
          .eq('role', userRole)
          .single();

        if (rolePerms && (rolePerms as any).permissions) {
          // Combinar permisos del rol con permisos personalizados
          const basePermissions = (rolePerms as any).permissions as RolePermissions;
          const customPermissions = ((profile as any).permissions as Partial<RolePermissions>) || {};

          // Merge permisos (custom sobrescribe base)
          const mergedPermissions = { ...basePermissions };
          Object.keys(customPermissions).forEach((key) => {
            const typedKey = key as keyof RolePermissions;
            if (typeof customPermissions[typedKey] === 'object' && customPermissions[typedKey] !== null) {
              mergedPermissions[typedKey] = {
                ...(basePermissions[typedKey] as any),
                ...(customPermissions[typedKey] as any),
              } as any;
            } else {
              mergedPermissions[typedKey] = customPermissions[typedKey] as any;
            }
          });

          setPermissions(mergedPermissions);
        } else {
          // Fallback a permisos por defecto
          setPermissions(DEFAULT_PERMISSIONS[userRole]);
        }
      } catch (rolePermsError) {
        // Si la tabla role_permissions no existe, usar permisos por defecto
        console.warn('Using default permissions for role:', userRole);
        setPermissions(DEFAULT_PERMISSIONS[userRole]);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Fallback a viewer si hay error
      setRole('viewer');
      setPermissions(DEFAULT_PERMISSIONS.viewer);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  const hasPermission = (resource: keyof RolePermissions, action: string): boolean => {
    if (!permissions || !role) return false;
    if (role === 'admin') return true; // Admin siempre tiene todos los permisos

    const resourcePerms = permissions[resource];
    if (typeof resourcePerms === 'boolean') {
      return resourcePerms;
    }
    return (resourcePerms as any)[action] === true;
  };

  const canPerform = hasPermission; // Alias

  const value: RoleContextType = {
    role,
    permissions,
    loading,
    hasPermission,
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isStaff: role === 'staff',
    isViewer: role === 'viewer',
    canPerform,
    refreshPermissions: fetchUserRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
