# Sistema de Roles y Permisos - Gula Catering

## 🎯 Descripción General

Sistema completo de control de acceso basado en roles (RBAC - Role-Based Access Control) que permite gestionar permisos granulares para diferentes tipos de usuarios.

## 👥 Roles Disponibles

### 1. 🔴 Admin (Administrador)
**Control total del sistema**

**Permisos:**
- ✅ Crear, leer, actualizar y eliminar todo
- ✅ Gestionar usuarios y roles
- ✅ Acceso a configuración del sistema
- ✅ Exportar datos sin límites
- ✅ Analytics avanzados
- ✅ Operaciones masivas (bulk)
- ✅ Acceso a API
- ✅ IA sin límites

**Casos de uso:**
- Dueño del negocio
- Director general
- Responsable de TI

---

### 2. 🔵 Manager (Gerente)
**Gestión operativa completa**

**Permisos:**
- ✅ Crear y gestionar eventos
- ✅ Crear y editar recetas (no eliminar)
- ✅ Gestionar ingredientes (no eliminar)
- ✅ Crear y gestionar menús
- ✅ Exportar datos
- ✅ Analytics avanzados
- ✅ Operaciones masivas
- ✅ IA sin límites
- ❌ No puede gestionar usuarios
- ❌ No puede cambiar configuración
- ❌ No tiene acceso a API

**Casos de uso:**
- Gerente de operaciones
- Jefe de cocina
- Coordinador de eventos

---

### 3. 🟢 Staff (Personal)
**Operaciones del día a día**

**Permisos:**
- ✅ Crear y editar eventos (no eliminar)
- ✅ Ver recetas e ingredientes
- ✅ Editar menús
- ✅ Ver analytics básicos
- ✅ Usar IA (con límites)
- ❌ No puede crear/editar recetas
- ❌ No puede exportar datos
- ❌ No puede eliminar eventos
- ❌ No puede ver usuarios
- ❌ No tiene operaciones masivas

**Casos de uso:**
- Cocineros
- Ayudantes de cocina
- Personal de servicio
- Coordinadores junior

---

### 4. ⚪ Viewer (Visualizador)
**Solo lectura**

**Permisos:**
- ✅ Ver eventos
- ✅ Ver recetas
- ✅ Ver ingredientes
- ✅ Ver menús
- ✅ Ver analytics básicos
- ✅ Usar IA (con límites)
- ❌ No puede crear nada
- ❌ No puede editar nada
- ❌ No puede eliminar nada
- ❌ No puede exportar

**Casos de uso:**
- Clientes
- Proveedores
- Auditores
- Consultores externos

---

## 🗂️ Arquitectura del Sistema

### Base de Datos

#### Tabla `profiles`
```sql
- id: UUID (PK)
- role: user_role ENUM
- permissions: JSONB (permisos personalizados)
- is_active: BOOLEAN
```

#### Tabla `role_permissions`
```sql
- id: UUID (PK)
- role: user_role ENUM (UNIQUE)
- permissions: JSONB
- description: TEXT
```

#### Tabla `role_audit_log`
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- changed_by: UUID (FK)
- old_role: user_role
- new_role: user_role
- reason: TEXT
- created_at: TIMESTAMPTZ
```

### Estructura de Permisos (JSONB)

```json
{
  "events": {
    "create": true,
    "read": true,
    "update": true,
    "delete": false,
    "export": true
  },
  "recipes": {
    "create": false,
    "read": true,
    "update": false,
    "delete": false,
    "export": false
  },
  "ingredients": { ... },
  "menus": { ... },
  "analytics": {
    "read": true,
    "export": false,
    "advanced": false
  },
  "users": {
    "create": false,
    "read": false,
    "update": false,
    "delete": false,
    "manage_roles": false
  },
  "settings": {
    "read": false,
    "update": false
  },
  "ai": {
    "use": true,
    "unlimited": false
  },
  "bulk_operations": false,
  "api_access": false
}
```

---

## 💻 Uso en el Frontend

### 1. Hook `useRole`

```typescript
import { useRole } from '@/contexts/RoleContext';

function MyComponent() {
  const { 
    role,              // 'admin' | 'manager' | 'staff' | 'viewer'
    permissions,       // Objeto completo de permisos
    hasPermission,     // Función para verificar permisos
    isAdmin,           // Boolean
    isManager,         // Boolean
    isStaff,           // Boolean
    isViewer,          // Boolean
    loading            // Boolean
  } = useRole();

  // Verificar permiso específico
  const canCreateEvent = hasPermission('events', 'create');
  
  // Verificar rol
  if (isAdmin) {
    // Código solo para admins
  }

  return <div>...</div>;
}
```

### 2. Componente `RoleGuard`

Protege acciones específicas:

```typescript
import { RoleGuard } from '@/components/RoleGuard';

<RoleGuard resource="recipes" action="create">
  <Button onClick={handleCreate}>
    Crear Receta
  </Button>
</RoleGuard>
```

**Comportamiento:**
- Si el usuario tiene permiso: Renderiza el botón normalmente
- Si no tiene permiso: Muestra el botón deshabilitado y un toast al hacer click

**Props:**
- `resource`: Recurso a verificar ('events', 'recipes', etc.)
- `action`: Acción a verificar ('create', 'update', 'delete', etc.)
- `children`: Componente a proteger
- `fallback`: Componente alternativo si no tiene permiso
- `showToast`: Mostrar toast explicativo (default: true)

### 3. Componente `RequireRole`

Protege secciones completas por rol:

```typescript
import { RequireRole } from '@/components/RoleGuard';

<RequireRole roles={['admin', 'manager']}>
  <AdminPanel />
</RequireRole>
```

### 4. Componente `RoleBadge`

Muestra el rol del usuario:

```typescript
import { RoleBadge } from '@/components/RoleGuard';

<h1>
  Dashboard
  <RoleBadge />
</h1>
```

**Resultado:**
- Admin: Badge rojo "Administrador"
- Manager: Badge azul "Gerente"
- Staff: Badge verde "Personal"
- Viewer: Badge gris "Visualizador"

---

## 🔧 Ejemplos de Implementación

### Ejemplo 1: Proteger Botón de Eliminar

```typescript
import { RoleGuard } from '@/components/RoleGuard';

<RoleGuard resource="events" action="delete">
  <Button 
    variant="destructive" 
    onClick={() => handleDelete(eventId)}
  >
    Eliminar Evento
  </Button>
</RoleGuard>
```

### Ejemplo 2: Mostrar Sección Solo a Admins

```typescript
import { RequireRole } from '@/components/RoleGuard';

<RequireRole roles={['admin']}>
  <Card>
    <CardHeader>
      <CardTitle>Panel de Administración</CardTitle>
    </CardHeader>
    <CardContent>
      <UserManagement />
      <SystemSettings />
    </CardContent>
  </Card>
</RequireRole>
```

### Ejemplo 3: Verificación Manual

```typescript
import { useRole } from '@/contexts/RoleContext';

function EventActions({ eventId }: { eventId: string }) {
  const { hasPermission, isAdmin } = useRole();

  const handleExport = () => {
    if (!hasPermission('events', 'export')) {
      toast({
        title: "Permiso denegado",
        description: "No tienes permisos para exportar eventos",
        variant: "destructive"
      });
      return;
    }
    
    // Exportar...
  };

  return (
    <div>
      {hasPermission('events', 'update') && (
        <Button onClick={handleEdit}>Editar</Button>
      )}
      
      {hasPermission('events', 'delete') && (
        <Button variant="destructive" onClick={handleDelete}>
          Eliminar
        </Button>
      )}
      
      {isAdmin && (
        <Button onClick={handleAdvancedOptions}>
          Opciones Avanzadas
        </Button>
      )}
    </div>
  );
}
```

### Ejemplo 4: Permisos Personalizados

```typescript
// En la base de datos, puedes sobrescribir permisos específicos
UPDATE profiles
SET permissions = '{"events": {"delete": true}}'::jsonb
WHERE id = 'user-id';

// Este usuario staff ahora puede eliminar eventos
// (sobrescribe el permiso del rol)
```

---

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

```sql
-- Solo admins pueden modificar permisos de roles
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
```

### Función de Verificación en Backend

```sql
-- Verificar permisos desde SQL
SELECT has_permission(
    'user-id',
    'events',
    'delete'
);
```

### Auditoría Automática

Todos los cambios de rol se registran automáticamente:

```sql
-- Trigger que registra cambios
CREATE TRIGGER trigger_log_role_change
    AFTER UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION log_role_change();
```

---

## 📊 Gestión de Roles

### Cambiar Rol de Usuario (Solo Admin)

```typescript
import { supabase } from '@/lib/supabase';

async function changeUserRole(userId: string, newRole: 'admin' | 'manager' | 'staff' | 'viewer') {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;
  
  // El trigger automáticamente registra el cambio en role_audit_log
}
```

### Desactivar Usuario

```typescript
async function deactivateUser(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId);

  if (error) throw error;
}
```

### Ver Historial de Cambios

```typescript
async function getRoleHistory(userId: string) {
  const { data, error } = await supabase
    .from('role_audit_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data;
}
```

---

## 🚀 Migración y Setup

### 1. Aplicar Migración

```bash
cd app.gula
supabase db push
```

O manualmente:

```bash
psql -h [host] -U [user] -d [database] -f supabase/migrations/20250120010000_roles_and_permissions.sql
```

### 2. Verificar Instalación

```sql
-- Verificar que las tablas existen
SELECT * FROM role_permissions;

-- Verificar que el primer usuario es admin
SELECT id, role FROM profiles ORDER BY created_at LIMIT 1;
```

### 3. Añadir RoleProvider a la App

Ya está añadido en `App.tsx`:

```typescript
<AuthProvider>
  <RoleProvider>
    <DemoProvider>
      {/* ... */}
    </DemoProvider>
  </RoleProvider>
</AuthProvider>
```

---

## 📈 Mejores Prácticas

### 1. Siempre Verificar Permisos

```typescript
// ❌ MAL
<Button onClick={handleDelete}>Eliminar</Button>

// ✅ BIEN
<RoleGuard resource="events" action="delete">
  <Button onClick={handleDelete}>Eliminar</Button>
</RoleGuard>
```

### 2. Verificar en Backend También

```typescript
// En edge functions o API routes
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .single();

if (profile.role !== 'admin') {
  return new Response('Forbidden', { status: 403 });
}
```

### 3. Usar Permisos Granulares

```typescript
// ❌ MAL - Verificar solo rol
if (role === 'admin') { ... }

// ✅ BIEN - Verificar permiso específico
if (hasPermission('events', 'delete')) { ... }
```

### 4. Feedback Claro al Usuario

```typescript
<RoleGuard 
  resource="recipes" 
  action="create"
  showToast={true}  // Muestra por qué no puede
>
  <Button>Crear Receta</Button>
</RoleGuard>
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Restaurante con Múltiples Empleados

- **Admin**: Dueño del restaurante
- **Manager**: Chef ejecutivo
- **Staff**: Cocineros y ayudantes
- **Viewer**: Proveedores que consultan menús

### Caso 2: Empresa de Catering

- **Admin**: Director general
- **Manager**: Gerentes de operaciones (varios)
- **Staff**: Personal de eventos
- **Viewer**: Clientes que revisan propuestas

### Caso 3: Escuela de Cocina

- **Admin**: Director de la escuela
- **Manager**: Profesores principales
- **Staff**: Profesores asistentes
- **Viewer**: Estudiantes

---

## 🔄 Próximas Mejoras

1. **Roles personalizados**: Crear roles más allá de los 4 predefinidos
2. **Permisos temporales**: Dar permisos por tiempo limitado
3. **Grupos de usuarios**: Asignar permisos a grupos
4. **Delegación de permisos**: Managers pueden dar permisos a staff
5. **Dashboard de gestión**: UI para administrar usuarios y roles
6. **Notificaciones**: Alertar cuando cambia un rol
7. **Aprobaciones**: Workflow de aprobación para cambios críticos

---

## 📝 Resumen

El sistema de roles de Gula Catering proporciona:

✅ **4 roles predefinidos** (Admin, Manager, Staff, Viewer)
✅ **Permisos granulares** por recurso y acción
✅ **Permisos personalizados** que sobrescriben los del rol
✅ **Auditoría completa** de cambios de roles
✅ **Seguridad en BD** con RLS
✅ **Componentes React** listos para usar
✅ **Feedback visual** claro para el usuario

**El sistema está listo para producción y es fácilmente extensible.** 🚀
