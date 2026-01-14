# 🤖 Guía de Uso del Asistente IA de Gula

## Capacidades Mejoradas

El asistente IA de Gula ahora puede **modificar datos directamente** en tu evento. Solo tienes que pedirle lo que necesitas de forma natural.

## 📝 Ejemplos de Uso

### 1. Actualizar Número de Invitados
```
Usuario: "Cambia el número de invitados a 150 personas"
IA: "Perfecto, voy a actualizar el evento con 150 invitados. ¿Quieres que lo aplique ahora?"
Usuario: "Sí"
✅ Evento actualizado automáticamente
```

### 2. Añadir Bebidas
```
Usuario: "Añade 50 botellas de vino tinto al evento"
IA: "Entendido, añadiré 50 botellas de vino tinto. ¿Lo añado?"
Usuario: "Dale"
✅ Bebida añadida al evento
```

### 3. Añadir Personal
```
Usuario: "Necesito 3 camareros más para el evento"
IA: "Voy a añadir 3 camareros al equipo. ¿Confirmas?"
Usuario: "Ok"
✅ Personal añadido
```

### 4. Añadir Platos al Menú
```
Usuario: "Añade ensalada César al menú de cocktail"
IA: "Perfecto, añadiré ensalada César a la sección de cocktail. ¿Lo hago?"
Usuario: "Sí"
✅ Plato añadido al menú
```

### 5. Consultas y Cálculos
```
Usuario: "¿Cuántas bebidas necesito para 200 personas durante 5 horas?"
IA: "Para 200 personas durante 5 horas necesitas aproximadamente:
- 1,500 bebidas en total (1.5 por persona/hora)
- Con margen de seguridad: 1,725 bebidas
- Vino: 80 botellas de Verdejo, 58 de Rioja
- Cerveza: 700 unidades
- Agua: 200 botellas
- Refrescos: 160 latas

¿Quieres que añada estas bebidas al evento?"
```

### 6. Auditoría y Análisis
```
Usuario: "Analiza los costes de mi evento"
IA: "He analizado tu evento 'Boda Moli del Ballestar':
📊 Resumen financiero:
- Food Cost: 28% ✅ (óptimo)
- Staff Cost: 22% ✅ (óptimo)
- Margen bruto: 35% ✅ (excelente)

💡 Sugerencias:
- El margen es saludable
- Podrías aumentar ligeramente el precio del menú infantil
- Staff bien dimensionado para 150 PAX"
```

## 🎯 Palabras Clave para Acciones

El asistente reconoce estas palabras para ejecutar acciones:

**Para confirmar:**
- "Sí", "Si", "Yes", "Ok", "Dale", "Hazlo", "Aplica", "Ejecuta", "Confirma"

**Para solicitar acciones:**
- "Añade", "Agrega", "Pon", "Crea"
- "Cambia", "Actualiza", "Modifica"
- "Calcula", "Genera", "Sugiere"

## 🔄 Flujo de Trabajo

1. **Pide algo de forma natural** - No necesitas comandos específicos
2. **La IA te explica qué hará** - Siempre te informa antes de actuar
3. **Confirma la acción** - Di "sí", "ok" o similar
4. **Cambios aplicados** - La página se recarga automáticamente

## 🚀 Mejoras Implementadas

### ✅ Problemas Resueltos

1. **IA respondía con JSON** → Ahora responde de forma natural y conversacional
2. **Hovers invisibles** → Aumentado contraste de 5-10% a 15-20%
3. **No podía modificar datos** → Ahora ejecuta acciones directamente en la BD

### 🎨 Mejoras de UX

- **Contraste mejorado** en todos los hovers (de `/5` y `/10` a `/15` y `/20`)
- **Feedback visual claro** cuando pasas el mouse sobre elementos
- **Respuestas naturales** de la IA en modo streaming
- **Confirmación antes de ejecutar** acciones críticas
- **Toasts informativos** al completar acciones

### 🧠 Capacidades de la IA

**Modo Conversacional (Streaming):**
- Respuestas naturales y amigables
- Usa emojis para mejor comunicación
- Explica qué hará antes de actuar
- Pide confirmación para cambios importantes

**Modo Acción (JSON):**
- Ejecuta cambios directamente en la base de datos
- Soporta múltiples tipos de acciones:
  - `update_event_field` - Actualizar campos del evento
  - `update_guests` - Actualizar invitados
  - `add_beverage` - Añadir bebidas
  - `add_menu_item` - Añadir platos al menú
  - `add_staff` - Añadir personal

## 📊 Contexto que Maneja la IA

La IA tiene acceso a:
- ✅ Datos del evento actual (PAX, fecha, tipo, menú)
- ✅ Recetas y escandallos disponibles
- ✅ Ratios estándar de Gula Catering
- ✅ Página actual donde estás navegando
- ✅ Historial de la conversación

## 💡 Tips de Uso

1. **Sé específico pero natural** - "Añade 50 botellas de Verdejo" es mejor que "bebidas"
2. **Usa el contexto** - Si estás en un evento, la IA sabe de cuál hablas
3. **Pide cálculos** - La IA conoce los ratios estándar de Gula
4. **Solicita análisis** - Puede auditar costes y sugerir mejoras
5. **Confirma siempre** - La IA pedirá confirmación antes de cambios importantes

## 🔐 Seguridad

- ✅ Solo modifica datos del evento actual
- ✅ Requiere confirmación para acciones críticas
- ✅ Validación de permisos en backend
- ✅ Logs de todas las acciones ejecutadas

## 🎓 Ejemplos Avanzados

### Planificación Completa
```
Usuario: "Tengo una boda de 200 personas, 6 horas de barra, necesito calcular todo"
IA: "Perfecto, para una boda de 200 PAX con 6 horas de barra te sugiero:

🍷 BEBIDAS (basado en ratios Gula):
- Vino Verdejo: 80 botellas
- Vino Rioja: 58 botellas
- Cerveza: 700 unidades
- Agua: 200 botellas
- Refrescos: 160 latas
Total estimado: 1,725 bebidas

👥 PERSONAL RECOMENDADO:
- 8 camareros (ratio 1:25)
- 2 bartenders
- 1 jefe de sala
- 2 ayudantes de cocina

💰 COSTE ESTIMADO:
- Bebidas: ~2,500€
- Personal: ~1,800€
- Total: ~4,300€

¿Quieres que añada estas bebidas y personal al evento?"
```

### Optimización de Costes
```
Usuario: "¿Cómo puedo reducir costes en este evento?"
IA: "He analizado tu evento y encontré estas oportunidades:

📉 OPTIMIZACIONES:
1. Staff: Tienes 10 camareros para 120 PAX (ratio 1:12)
   → Recomendación: Reduce a 6 camareros (ratio 1:20)
   → Ahorro: ~400€

2. Bebidas: Tienes 100 botellas de vino premium
   → Recomendación: Mezcla 70% premium + 30% estándar
   → Ahorro: ~300€

3. Menú: 3 opciones de postre
   → Recomendación: 2 opciones + café
   → Ahorro: ~150€

💰 Ahorro total potencial: ~850€
📊 Margen mejorado: de 25% a 32%

¿Quieres que aplique alguna de estas optimizaciones?"
```

## 🐛 Solución de Problemas

**La IA no responde:**
- Verifica tu conexión a internet
- Revisa que las API keys estén configuradas en Supabase

**La IA responde con JSON:**
- Esto solo debería pasar en modo no-streaming
- Si pasa en chat normal, reporta el bug

**Los cambios no se aplican:**
- Verifica que estés en un evento específico
- Confirma que tienes permisos de edición
- Revisa los logs en la consola del navegador

## 📈 Próximas Mejoras

- [ ] Soporte para modificar múltiples campos a la vez
- [ ] Deshacer última acción
- [ ] Historial de cambios realizados por IA
- [ ] Sugerencias proactivas basadas en eventos similares
- [ ] Integración con calendario para recordatorios
- [ ] Exportar conversación como PDF

---

**Versión:** 2.0  
**Última actualización:** Enero 2025  
**Mejoras implementadas:** Respuestas naturales, acciones directas, mejor UX
