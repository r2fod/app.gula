# Sistema de Auto-Entrenamiento de IA - Gula Catering

## 🧠 Descripción General

El sistema de auto-entrenamiento permite que la IA de Gula aprenda de cada interacción con los usuarios, mejorando continuamente sus respuestas y recomendaciones.

## 📊 Arquitectura

### Tablas de Base de Datos

#### 1. `ai_interactions` (Mejorada)
Almacena todas las interacciones entre usuarios y la IA:
- `user_message`: Mensaje del usuario
- `ai_response`: Respuesta de la IA
- `context_data`: Contexto de la interacción (página, evento, etc.)
- `rating`: Calificación del usuario (1-5)
- `was_helpful`: Booleano de utilidad
- `feedback`: Comentarios del usuario
- `execution_success`: Si la acción se ejecutó correctamente
- `response_time_ms`: Tiempo de respuesta

#### 2. `ai_knowledge` (Nueva)
Base de conocimiento aprendido:
- `knowledge_type`: Tipo de conocimiento (successful_action_pattern, beverage_ratio, etc.)
- `knowledge_data`: Datos del patrón aprendido (JSON)
- `confidence_score`: Nivel de confianza (0-1)
- `source_interaction_id`: ID de la interacción origen
- `times_applied`: Veces que se ha aplicado este conocimiento
- `success_rate`: Tasa de éxito

#### 3. `ai_event_patterns` (Nueva)
Patrones exitosos de eventos:
- `event_type`: Tipo de evento (boda, corporativo, etc.)
- `pattern_type`: Tipo de patrón (beverage_ratio, menu_composition, staff_distribution)
- `pattern_data`: Datos del patrón (JSON)
- `success_count`: Número de veces exitoso
- `avg_profit_margin`: Margen de beneficio promedio

## 🔄 Flujo de Aprendizaje

### 1. Captura de Interacciones
```typescript
// Cada mensaje se guarda automáticamente
await saveInteraction(
  supabase,
  userId,
  eventId,
  userMessage,
  aiResponse,
  context,
  startTime
);
```

### 2. Feedback del Usuario
Los usuarios pueden dar feedback con:
- 👍 Thumbs Up (útil)
- 👎 Thumbs Down (no útil)
- Calificación de 1-5 estrellas (futuro)

### 3. Aprendizaje Automático
Cuando una interacción es marcada como exitosa:
```typescript
if (data.executionSuccess && data.wasHelpful) {
  await learnFromSuccess(interactionId);
}
```

### 4. Aplicación del Conocimiento
En futuras interacciones, la IA consulta:
- Conocimiento previo del usuario
- Patrones exitosos para el tipo de evento
- Ratios y configuraciones que funcionaron bien

## 💡 Ejemplos de Aprendizaje

### Ejemplo 1: Ratios de Bebidas
**Interacción inicial:**
- Usuario: "Necesito bebidas para 100 personas en una boda"
- IA: Sugiere ratios estándar de Gula
- Usuario: 👍 (feedback positivo)

**Aprendizaje:**
```json
{
  "knowledge_type": "beverage_ratio",
  "knowledge_data": {
    "event_type": "boda",
    "guests": 100,
    "ratios": {
      "verdejo": 40,
      "rioja": 29,
      "cerveza": 350
    }
  },
  "confidence_score": 0.8
}
```

**Aplicación futura:**
Cuando otro usuario pregunte por bebidas para una boda, la IA recordará este patrón exitoso.

### Ejemplo 2: Composición de Menú
**Interacción inicial:**
- Usuario: "Crea un menú para evento corporativo de 50 personas"
- IA: Sugiere menú con entrantes, principal y postre
- Usuario: Ejecuta la acción ✅
- Usuario: 👍

**Aprendizaje:**
```json
{
  "pattern_type": "menu_composition",
  "pattern_data": {
    "courses": ["entrante", "principal", "postre"],
    "avg_cost_per_person": 45,
    "profit_margin": 68
  },
  "success_count": 1
}
```

## 🎯 Características Clave

### 1. Memoria Contextual
La IA recuerda:
- Preferencias del usuario
- Patrones que funcionaron bien
- Errores previos para evitarlos

### 2. Mejora Continua
- Cada feedback positivo aumenta la confianza en un patrón
- Cada feedback negativo reduce la probabilidad de repetirlo
- Los patrones más exitosos se priorizan

### 3. Personalización
- Cada usuario tiene su propia base de conocimiento
- La IA adapta sus respuestas según el historial del usuario

## 🔧 Uso en el Código

### Hook de Feedback
```typescript
import { useAIFeedback } from '@/hooks/useAIFeedback';

const { submitFeedback, submitting } = useAIFeedback();

// Dar feedback positivo
await submitFeedback({
  interactionId: msg.id,
  wasHelpful: true,
  rating: 5,
});
```

### Consulta de Conocimiento Previo
```typescript
// En ai-chat/index.ts
const learnedKnowledge = await getLearnedKnowledge(supabase, userId);
const patterns = await getEventPatterns(supabase, event.event_type);
```

## 📈 Métricas de Aprendizaje

El sistema rastrea:
- **Tasa de éxito**: % de acciones ejecutadas correctamente
- **Tiempo de respuesta**: Velocidad de la IA
- **Satisfacción del usuario**: Promedio de ratings
- **Patrones más usados**: Qué conocimiento se aplica más

## 🚀 Próximas Mejoras

1. **Análisis de sentimiento** en el feedback textual
2. **Clustering de patrones** similares
3. **Recomendaciones proactivas** basadas en contexto
4. **Dashboard de métricas** de aprendizaje
5. **Exportación de conocimiento** para análisis

## 🔒 Privacidad

- El conocimiento es específico por usuario
- No se comparten patrones entre usuarios sin consentimiento
- Los datos se pueden eliminar bajo solicitud (GDPR)

## 📝 Migración

Para aplicar el sistema de aprendizaje:

```bash
# Aplicar migración
supabase db push

# O manualmente
psql -h [host] -U [user] -d [database] -f supabase/migrations/20250120000000_ai_training_system.sql
```

## 🎓 Conclusión

Este sistema convierte a la IA de Gula en un asistente que **aprende y mejora con cada uso**, proporcionando recomendaciones cada vez más precisas y personalizadas.
