# Modo Demo Mejorado - Gula Catering

## 🎯 Descripción General

El modo demo permite a usuarios no registrados explorar las capacidades de Gula Catering con limitaciones estratégicas que incentivan el registro.

## 🎨 Filosofía del Modo Demo

**Objetivo:** Mostrar el valor del software sin dar acceso completo
- ✅ Permitir exploración de funcionalidades core
- ✅ Demostrar capacidades de IA
- ✅ Mostrar interfaz y UX
- ❌ Limitar acciones críticas
- ❌ Restringir exportación de datos
- ❌ Bloquear funciones avanzadas

## 🔒 Limitaciones del Modo Demo

### Límites Cuantitativos
```typescript
const demoLimits = {
  maxEvents: 3,           // Máximo 3 eventos
  maxRecipes: 10,         // Máximo 10 recetas
  maxIngredients: 20,     // Máximo 20 ingredientes
  canExport: false,       // No exportar datos
  canUseAI: true,         // IA disponible (con límites)
  canAccessAnalytics: false, // Sin analytics avanzados
};
```

### Acciones Restringidas
- ❌ Exportar datos (PDF, Excel)
- ❌ Operaciones masivas (bulk operations)
- ❌ Eliminar todos los datos
- ❌ Analytics avanzados
- ❌ Reportes personalizados
- ❌ Acceso a API

## 🎨 Componentes del Sistema

### 1. DemoContext
Contexto React que gestiona el estado del modo demo:

```typescript
import { useDemo } from '@/contexts/DemoContext';

const { 
  isDemoMode,           // ¿Está en modo demo?
  canPerformAction,     // ¿Puede realizar esta acción?
  showUpgradePrompt,    // Mostrar prompt de upgrade
  demoLimits            // Límites actuales
} = useDemo();
```

### 2. DemoBanner
Banner superior que indica el modo demo:

**Características:**
- 🎨 Diseño llamativo (gradiente naranja/ámbar)
- 📊 Muestra límites actuales
- 🚀 CTA prominente "Desbloquear Todo"
- 📱 Responsive (oculta detalles en móvil)

**Ubicación:** Top de todas las páginas

### 3. DemoGuard
Componente wrapper para proteger acciones:

```typescript
<DemoGuard 
  action="export_data" 
  feature="Exportación de Datos"
>
  <Button onClick={exportToPDF}>
    Exportar PDF
  </Button>
</DemoGuard>
```

**Comportamiento:**
- Si no es demo: Renderiza children normalmente
- Si es demo y acción permitida: Renderiza children
- Si es demo y acción bloqueada: Muestra prompt de upgrade al hacer click

## 💡 Ejemplos de Uso

### Ejemplo 1: Proteger Exportación
```typescript
import { DemoGuard } from '@/components/DemoGuard';

<DemoGuard action="export_data" feature="Exportación de Datos">
  <Button onClick={handleExport}>
    <Download className="h-4 w-4 mr-2" />
    Exportar a Excel
  </Button>
</DemoGuard>
```

### Ejemplo 2: Verificar Límites
```typescript
import { useDemo } from '@/contexts/DemoContext';

const { isDemoMode, demoLimits, showUpgradePrompt } = useDemo();

const handleCreateEvent = () => {
  if (isDemoMode && events.length >= demoLimits.maxEvents) {
    showUpgradePrompt('Crear más de 3 eventos');
    return;
  }
  
  // Crear evento...
};
```

### Ejemplo 3: Condicional en UI
```typescript
const { isDemoMode, demoLimits } = useDemo();

return (
  <div>
    <h2>Mis Eventos ({events.length}/{isDemoMode ? demoLimits.maxEvents : '∞'})</h2>
    {isDemoMode && events.length >= demoLimits.maxEvents && (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Límite alcanzado</AlertTitle>
        <AlertDescription>
          Regístrate para crear eventos ilimitados
        </AlertDescription>
      </Alert>
    )}
  </div>
);
```

## 🎯 Estrategia de Conversión

### Momentos Clave para Prompts
1. **Al alcanzar límites** (3 eventos, 10 recetas)
2. **Al intentar exportar** datos
3. **Al acceder a analytics** avanzados
4. **Después de usar IA** varias veces
5. **Al intentar operaciones masivas**

### Diseño del Prompt
```typescript
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
    <button onClick={() => navigate('/auth')}>
      Registrarse
    </button>
  ),
  duration: 6000,
});
```

## 📊 Métricas a Rastrear

### Engagement en Demo
- Tiempo promedio en demo
- Páginas visitadas
- Funciones más usadas
- Límites alcanzados

### Conversión
- % de demos que se registran
- Tiempo hasta registro
- Función que motivó el registro
- Tasa de abandono

## 🚀 Implementación Paso a Paso

### 1. Añadir DemoProvider
```typescript
// App.tsx
<AuthProvider>
  <DemoProvider>
    <AIProvider>
      {/* ... */}
    </AIProvider>
  </DemoProvider>
</AuthProvider>
```

### 2. Añadir DemoBanner
```typescript
// App.tsx
<ErrorBoundary>
  <PageDecorations />
  <DemoBanner />
  {/* ... */}
</ErrorBoundary>
```

### 3. Proteger Acciones Críticas
```typescript
// En cada componente con acciones restringidas
import { DemoGuard } from '@/components/DemoGuard';
import { useDemo } from '@/contexts/DemoContext';

// Opción 1: Wrapper
<DemoGuard action="export_data">
  <ExportButton />
</DemoGuard>

// Opción 2: Verificación manual
const { canPerformAction, showUpgradePrompt } = useDemo();

if (!canPerformAction('export_data')) {
  showUpgradePrompt('Exportación de Datos');
  return;
}
```

## 🎨 Personalización

### Ajustar Límites
```typescript
// DemoContext.tsx
const demoLimits = {
  maxEvents: 5,        // Cambiar a 5 eventos
  maxRecipes: 15,      // Cambiar a 15 recetas
  // ...
};
```

### Añadir Nuevas Restricciones
```typescript
// DemoContext.tsx
const restrictedActions = [
  'export_data',
  'delete_all',
  'bulk_operations',
  'advanced_analytics',
  'custom_reports',
  'api_access',
  'team_collaboration',  // Nueva restricción
];
```

## 🔧 Testing del Modo Demo

### Activar Modo Demo Manualmente
```typescript
// Para testing, puedes forzar el modo demo
localStorage.setItem('force_demo_mode', 'true');
```

### Verificar Restricciones
1. Crear 3 eventos → Debe mostrar límite
2. Intentar exportar → Debe mostrar prompt
3. Acceder a analytics → Debe redirigir o bloquear
4. Usar IA → Debe funcionar pero con límites

## 📱 Experiencia Móvil

El banner se adapta en móvil:
- Oculta detalles de límites
- Mantiene CTA visible
- Reduce padding para ahorrar espacio

## 🎓 Mejores Prácticas

1. **No frustrar al usuario**: Permitir exploración significativa
2. **Ser transparente**: Mostrar claramente qué está limitado
3. **Valor primero**: Demostrar valor antes de pedir registro
4. **CTAs claros**: Botones de registro siempre visibles
5. **Feedback inmediato**: Explicar por qué algo está bloqueado

## 🚀 Próximas Mejoras

1. **Modo demo guiado**: Tutorial interactivo
2. **Datos de ejemplo**: Pre-poblar con eventos de muestra
3. **Comparación de planes**: Mostrar qué desbloquea el registro
4. **Progreso visual**: Barra mostrando límites usados
5. **Invitaciones**: Permitir invitar a otros usuarios demo

## 🎯 Conclusión

El modo demo mejorado balancea **mostrar valor** con **incentivar registro**, creando una experiencia que convierte visitantes en usuarios registrados.
