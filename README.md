# 🍽️ Gula - Sistema de Gestión de Eventos de Catering

Aplicación web profesional para la gestión integral de eventos de catering con **inteligencia artificial integrada**.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![AI](https://img.shields.io/badge/AI-Powered-purple)

## ✨ Características Principales

### 🎯 Gestión Completa de Eventos
- **Múltiples tipos de eventos**: Bodas, Producciones, Eventos Privados, Delivery, Comuniones
- **Gestión de invitados**: Adultos, niños y staff
- **Timeline detallado**: Horarios de ceremonia, cocktail, banquete y barra
- **Menús personalizados**: Cocktail, platos principales, postres, resopón, menú infantil
- **Control de bebidas**: Aperitivos, copas, refrescos con fotos
- **Personal**: Gestión de roles, horarios y notas
- **Suministros**: Cristalería, vajilla, menaje
- **Requisitos especiales**: Alergias, mobiliario, otros
- **Corners**: Limonada, cerveza, queso, jamón, cocktail bar
- **Distribución de mesas**: Planificación visual

### 🤖 Asistente de IA Integrado

**Capacidades avanzadas**:
- 💬 **Chat conversacional** con contexto del evento
- 📄 **Análisis de archivos** (PDF, Excel, Word, imágenes)
- 🎯 **Generación automática** de listas de bebidas, menús y personal
- 📊 **Sugerencias inteligentes** basadas en eventos similares
- 🔄 **Streaming de respuestas** en tiempo real

**Edge Functions de IA**:
- `ai-assistant`: Lovable AI con contexto completo de Gula Catering
- `ai-chat`: OpenAI GPT-4 para generación estructurada
- `ai-file-analyzer`: Análisis y extracción de datos de documentos

### 🎨 Experiencia de Usuario
- **Modo Demo**: Prueba la aplicación sin registro
- **Modo Oscuro**: Tema claro/oscuro automático
- **Animaciones fluidas**: Framer Motion
- **Diseño responsive**: Mobile-first
- **Notificaciones**: Toast y Sonner
- **Error boundaries**: Manejo robusto de errores

## 🚀 Tecnologías

### Frontend
- **React 18.3.1** + **TypeScript 5.8.3**
- **Vite 5.4.19** - Build ultrarrápido (~7s)
- **React Router DOM 6.30.1** - Navegación
- **TanStack Query 5.83.0** - Server state management
- **Shadcn UI** - Componentes (Radix UI + Tailwind CSS)
- **Framer Motion** - Animaciones
- **React Hook Form + Zod** - Formularios y validación

### Backend
- **Supabase** - PostgreSQL + Auth + Storage + Realtime
- **Edge Functions** (Deno) - Serverless functions
- **Row Level Security (RLS)** - Seguridad a nivel de fila
- **OpenAI GPT-4** - Inteligencia artificial
- **Lovable AI Gateway** - IA especializada en catering

### Testing
- **Vitest 4.0.16** - Test runner
- **Testing Library** - Testing de componentes

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ (recomendado: usar [nvm](https://github.com/nvm-sh/nvm))
- npm o bun
- Cuenta de Supabase

### Pasos

1. **Clonar el repositorio**
```bash
git clone <URL_DEL_REPO>
cd app.gula
```

2. **Instalar dependencias**
```bash
npm install
# o
bun install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz:
```env
VITE_SUPABASE_PROJECT_ID=tu_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=tu_anon_key
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
```

4. **Configurar Supabase**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login en Supabase
npx supabase login

# Link al proyecto
npx supabase link --project-ref tu_project_id

# Aplicar migraciones
npx supabase db push
```

5. **Configurar Edge Functions**

En Supabase Dashboard > Project Settings > Edge Functions > Secrets:
```
LOVABLE_API_KEY=tu_lovable_key
OPENAI_API_KEY=sk-tu_openai_key
REGISTRATION_CODE=tu_codigo_registro
```

6. **Iniciar desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

## 🏗️ Estructura del Proyecto

```
app.gula/
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # Componentes Shadcn UI
│   │   └── AIAssistant.tsx # Asistente de IA
│   ├── contexts/          # Contextos de React
│   │   ├── AuthContext.tsx
│   │   └── AIContext.tsx
│   ├── features/          # Features por dominio
│   │   ├── events/
│   │   ├── menu/
│   │   └── profile/
│   ├── hooks/             # Custom hooks
│   ├── integrations/      # Integraciones externas
│   ├── lib/               # Utilidades
│   ├── pages/             # Páginas de la app
│   └── main.tsx           # Entry point
├── supabase/
│   ├── functions/         # Edge Functions
│   └── migrations/        # Migraciones de BD
└── public/                # Assets estáticos
```

## 🗄️ Base de Datos

### Tablas Principales
- `profiles` - Perfiles de usuario
- `events` - Eventos principales
- `event_timings` - Horarios
- `event_features` - Características
- `event_staff` - Personal
- `menu_items` - Items del menú
- `menus` - Menús reutilizables
- `beverages` - Bebidas
- `supplies` - Suministros
- `allergies` - Alergias
- `furniture` - Mobiliario
- `tables` - Distribución de mesas
- `corners` - Corners del evento
- `rentals` - Alquileres
- `ai_interactions` - Historial de IA

## 🤖 Uso del Asistente de IA

### Comandos de Ejemplo

```
"Genera una lista de bebidas para 100 personas en una boda"
"Crea un menú típico para este evento"
"Calcula el personal necesario para 150 invitados"
"Analiza este PDF con el menú del catering"
```

### Subir Archivos

1. Haz clic en el botón de clip 📎
2. Selecciona tu archivo (PDF, Excel, imagen)
3. La IA lo analizará automáticamente
4. Revisa los datos extraídos
5. Confirma para añadirlos al evento

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run build:dev    # Build de desarrollo
npm run preview      # Preview del build
npm run lint         # Linter
npm run test         # Tests
```

## 🚀 Deployment

### Opción 1: Lovable (Recomendado)
1. Conecta tu repositorio en [Lovable](https://lovable.dev)
2. Configura las variables de entorno
3. Deploy automático en cada push

### Opción 2: Vercel/Netlify
1. Conecta tu repositorio
2. Configura build command: `npm run build`
3. Output directory: `dist`
4. Añade variables de entorno

## 🔧 Configuración Avanzada

### TypeScript Estricto (Recomendado)

Edita `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Optimización de Performance

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  }
});
```

## 🐛 Troubleshooting

### La IA no responde
- Verifica que `OPENAI_API_KEY` esté configurada en Supabase
- Comprueba que las Edge Functions estén desplegadas
- Revisa la consola del navegador para errores

### Error de autenticación
- Verifica las credenciales de Supabase en `.env`
- Comprueba que RLS esté habilitado en las tablas
- Revisa las políticas de acceso en Supabase

### Build falla
- Ejecuta `npm run lint` para ver errores
- Verifica que todas las dependencias estén instaladas
- Comprueba la versión de Node.js (18+)

## 📚 Documentación Adicional

- [Análisis del Proyecto](./docs/analisis_proyecto_gula.md)
- [Guía de Uso de IA](./docs/guia_uso_ia.md)
- [Plan de Implementación](./docs/implementation_plan.md)
- [Estado del Proyecto](./docs/estado_final_proyecto.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado con ❤️ para Gula Catering

---

**Nota**: Este proyecto está en desarrollo activo. Para mejoras y roadmap, consulta [estado_final_proyecto.md](./docs/estado_final_proyecto.md)
