-- Migración: Sistema de Roles y Permisos
-- Fecha: 2025-01-20
-- Descripción: Añade roles de usuario (admin, manager, staff, viewer) con permisos granulares

-- 1. Crear tipo ENUM para roles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff', 'viewer');

-- 2. Añadir columna de rol a la tabla profiles (o users según tu esquema)
-- Primero verificamos si existe la tabla profiles
DO $$ 
BEGIN
    -- Añadir columna role si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'viewer';
    END IF;

    -- Añadir columna permissions si no existe (JSON para permisos personalizados)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'permissions'
    ) THEN
        ALTER TABLE profiles ADD COLUMN permissions JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Añadir columna is_active si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. Crear tabla de permisos por rol
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL UNIQUE,
    permissions JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Insertar permisos por defecto para cada rol
INSERT INTO role_permissions (role, permissions, description) VALUES
(
    'admin',
    '{
        "events": {"create": true, "read": true, "update": true, "delete": true, "export": true},
        "recipes": {"create": true, "read": true, "update": true, "delete": true, "export": true},
        "ingredients": {"create": true, "read": true, "update": true, "delete": true, "export": true},
        "menus": {"create": true, "read": true, "update": true, "delete": true, "export": true},
        "analytics": {"read": true, "export": true, "advanced": true},
        "users": {"create": true, "read": true, "update": true, "delete": true, "manage_roles": true},
        "settings": {"read": true, "update": true},
        "ai": {"use": true, "unlimited": true},
        "bulk_operations": true,
        "api_access": true
    }'::jsonb,
    'Administrador con acceso completo a todas las funcionalidades'
),
(
    'manager',
    '{
        "events": {"create": true, "read": true, "update": true, "delete": true, "export": true},
        "recipes": {"create": true, "read": true, "update": true, "delete": false, "export": true},
        "ingredients": {"create": true, "read": true, "update": true, "delete": false, "export": true},
        "menus": {"create": true, "read": true, "update": true, "delete": true, "export": true},
        "analytics": {"read": true, "export": true, "advanced": true},
        "users": {"create": false, "read": true, "update": false, "delete": false, "manage_roles": false},
        "settings": {"read": true, "update": false},
        "ai": {"use": true, "unlimited": true},
        "bulk_operations": true,
        "api_access": false
    }'::jsonb,
    'Gerente con permisos de gestión pero sin control de usuarios'
),
(
    'staff',
    '{
        "events": {"create": true, "read": true, "update": true, "delete": false, "export": false},
        "recipes": {"create": false, "read": true, "update": false, "delete": false, "export": false},
        "ingredients": {"create": false, "read": true, "update": false, "delete": false, "export": false},
        "menus": {"create": false, "read": true, "update": true, "delete": false, "export": false},
        "analytics": {"read": true, "export": false, "advanced": false},
        "users": {"create": false, "read": false, "update": false, "delete": false, "manage_roles": false},
        "settings": {"read": false, "update": false},
        "ai": {"use": true, "unlimited": false},
        "bulk_operations": false,
        "api_access": false
    }'::jsonb,
    'Personal operativo con permisos limitados'
),
(
    'viewer',
    '{
        "events": {"create": false, "read": true, "update": false, "delete": false, "export": false},
        "recipes": {"create": false, "read": true, "update": false, "delete": false, "export": false},
        "ingredients": {"create": false, "read": true, "update": false, "delete": false, "export": false},
        "menus": {"create": false, "read": true, "update": false, "delete": false, "export": false},
        "analytics": {"read": true, "export": false, "advanced": false},
        "users": {"create": false, "read": false, "update": false, "delete": false, "manage_roles": false},
        "settings": {"read": false, "update": false},
        "ai": {"use": true, "unlimited": false},
        "bulk_operations": false,
        "api_access": false
    }'::jsonb,
    'Visualizador con acceso de solo lectura'
)
ON CONFLICT (role) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    description = EXCLUDED.description,
    updated_at = now();

-- 5. Crear tabla de auditoría de cambios de roles
CREATE TABLE IF NOT EXISTS role_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    old_role user_role,
    new_role user_role NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_role_audit_log_user_id ON role_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_log_created_at ON role_audit_log(created_at DESC);

-- 7. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_role_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_role_permissions_updated_at ON role_permissions;
CREATE TRIGGER trigger_update_role_permissions_updated_at
    BEFORE UPDATE ON role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_role_permissions_updated_at();

-- 9. Función para registrar cambios de rol
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO role_audit_log (user_id, old_role, new_role)
        VALUES (NEW.id, OLD.role, NEW.role);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger para auditoría de cambios de rol
DROP TRIGGER IF EXISTS trigger_log_role_change ON profiles;
CREATE TRIGGER trigger_log_role_change
    AFTER UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION log_role_change();

-- 11. Función helper para verificar permisos
CREATE OR REPLACE FUNCTION has_permission(
    user_id UUID,
    resource TEXT,
    action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role user_role;
    role_perms JSONB;
    custom_perms JSONB;
    has_perm BOOLEAN;
BEGIN
    -- Obtener rol y permisos personalizados del usuario
    SELECT p.role, p.permissions INTO user_role, custom_perms
    FROM profiles p
    WHERE p.id = user_id AND p.is_active = true;

    -- Si no se encuentra el usuario o está inactivo, denegar
    IF user_role IS NULL THEN
        RETURN false;
    END IF;

    -- Admin siempre tiene todos los permisos
    IF user_role = 'admin' THEN
        RETURN true;
    END IF;

    -- Obtener permisos del rol
    SELECT permissions INTO role_perms
    FROM role_permissions
    WHERE role = user_role;

    -- Verificar permiso en permisos personalizados primero
    IF custom_perms ? resource THEN
        has_perm := (custom_perms->resource->>action)::boolean;
        IF has_perm IS NOT NULL THEN
            RETURN has_perm;
        END IF;
    END IF;

    -- Verificar permiso en permisos del rol
    IF role_perms ? resource THEN
        has_perm := (role_perms->resource->>action)::boolean;
        RETURN COALESCE(has_perm, false);
    END IF;

    -- Si no se encuentra el permiso, denegar
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Row Level Security (RLS) para role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver permisos de roles"
    ON role_permissions FOR SELECT
    USING (true);

CREATE POLICY "Solo admins pueden modificar permisos de roles"
    ON role_permissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_active = true
        )
    );

-- 13. RLS para role_audit_log
ALTER TABLE role_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins y managers pueden ver audit log"
    ON role_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager')
            AND profiles.is_active = true
        )
    );

CREATE POLICY "Solo admins pueden insertar en audit log"
    ON role_audit_log FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_active = true
        )
    );

-- 14. Actualizar el primer usuario como admin (si existe)
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    SELECT id INTO first_user_id
    FROM profiles
    ORDER BY created_at ASC
    LIMIT 1;

    IF first_user_id IS NOT NULL THEN
        UPDATE profiles
        SET role = 'admin'
        WHERE id = first_user_id;
    END IF;
END $$;

-- 15. Comentarios para documentación
COMMENT ON TYPE user_role IS 'Roles de usuario: admin (control total), manager (gestión), staff (operativo), viewer (solo lectura)';
COMMENT ON TABLE role_permissions IS 'Define los permisos por defecto para cada rol';
COMMENT ON TABLE role_audit_log IS 'Registro de auditoría de cambios de roles';
COMMENT ON FUNCTION has_permission IS 'Verifica si un usuario tiene un permiso específico para un recurso y acción';
COMMENT ON COLUMN profiles.role IS 'Rol del usuario que determina sus permisos base';
COMMENT ON COLUMN profiles.permissions IS 'Permisos personalizados que sobrescriben los permisos del rol';
COMMENT ON COLUMN profiles.is_active IS 'Indica si el usuario está activo y puede acceder al sistema';
