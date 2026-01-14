-- Añadir campos de entrenamiento a ai_interactions
ALTER TABLE public.ai_interactions 
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS was_helpful BOOLEAN,
ADD COLUMN IF NOT EXISTS execution_success BOOLEAN,
ADD COLUMN IF NOT EXISTS context_data JSONB,
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;

-- Crear tabla de conocimiento aprendido por la IA
CREATE TABLE IF NOT EXISTS public.ai_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'event_pattern', 'cost_optimization', 'menu_suggestion', 'beverage_ratio', etc.
  pattern_name TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0.5,
  learned_from_interactions INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear tabla de patrones de eventos exitosos
CREATE TABLE IF NOT EXISTS public.ai_event_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  guest_range TEXT NOT NULL, -- '50-100', '100-200', etc.
  avg_beverage_ratio JSONB,
  avg_staff_ratio JSONB,
  avg_cost_per_guest DECIMAL(10,2),
  success_indicators JSONB,
  sample_size INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_type, guest_range)
);

-- Habilitar RLS
ALTER TABLE public.ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_event_patterns ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (todos pueden leer, solo sistema puede escribir)
CREATE POLICY "Todos pueden leer conocimiento de IA"
  ON public.ai_knowledge FOR SELECT
  USING (true);

CREATE POLICY "Solo servicio puede escribir conocimiento"
  ON public.ai_knowledge FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Solo servicio puede actualizar conocimiento"
  ON public.ai_knowledge FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Todos pueden leer patrones de eventos"
  ON public.ai_event_patterns FOR SELECT
  USING (true);

CREATE POLICY "Solo servicio puede escribir patrones"
  ON public.ai_event_patterns FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Solo servicio puede actualizar patrones"
  ON public.ai_event_patterns FOR UPDATE
  USING (auth.role() = 'service_role');

-- Índices para mejorar performance
CREATE INDEX idx_ai_knowledge_category ON public.ai_knowledge(category);
CREATE INDEX idx_ai_knowledge_confidence ON public.ai_knowledge(confidence_score DESC);
CREATE INDEX idx_ai_knowledge_usage ON public.ai_knowledge(usage_count DESC);
CREATE INDEX idx_ai_event_patterns_type ON public.ai_event_patterns(event_type);
CREATE INDEX idx_ai_event_patterns_range ON public.ai_event_patterns(guest_range);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_ai_knowledge_updated_at BEFORE UPDATE ON public.ai_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_event_patterns_updated_at BEFORE UPDATE ON public.ai_event_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar conocimiento inicial basado en ratios de Gula
INSERT INTO public.ai_knowledge (category, pattern_name, pattern_data, confidence_score, usage_count) VALUES
('beverage_ratio', 'Vino Verdejo por 100 PAX', '{"bottles": 40, "per_guest": 0.4, "type": "white_wine"}', 0.95, 0),
('beverage_ratio', 'Vino Rioja por 100 PAX', '{"bottles": 29, "per_guest": 0.29, "type": "red_wine"}', 0.95, 0),
('beverage_ratio', 'Cerveza por 100 PAX', '{"units": 350, "per_guest": 3.5, "type": "beer"}', 0.95, 0),
('beverage_ratio', 'Agua por 100 PAX', '{"bottles": 100, "per_guest": 1.0, "type": "water"}', 0.95, 0),
('beverage_ratio', 'Refrescos por 100 PAX', '{"cans": 80, "per_guest": 0.8, "type": "soft_drink"}', 0.90, 0),
('beverage_ratio', 'Bebidas por persona/hora', '{"drinks_per_hour": 1.5, "safety_margin": 1.15}', 0.95, 0),
('staff_ratio', 'Camareros por invitados', '{"ratio": "1:20", "min_guests": 20, "max_guests": 200}', 0.90, 0),
('staff_ratio', 'Bartenders por barra', '{"ratio": "2:1", "per_bar": 2}', 0.85, 0),
('cost_threshold', 'Food Cost óptimo', '{"max_percent": 30, "optimal_range": [25, 28]}', 0.90, 0),
('cost_threshold', 'Staff Cost óptimo', '{"max_percent": 25, "optimal_range": [20, 23]}', 0.90, 0),
('cost_threshold', 'Margen bruto mínimo', '{"min_percent": 20, "optimal_range": [25, 35]}', 0.90, 0)
ON CONFLICT DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE public.ai_knowledge IS 'Almacena patrones y conocimiento aprendido por la IA';
COMMENT ON TABLE public.ai_event_patterns IS 'Patrones de eventos exitosos para recomendaciones';
COMMENT ON COLUMN public.ai_interactions.feedback IS 'Feedback del usuario sobre la respuesta';
COMMENT ON COLUMN public.ai_interactions.rating IS 'Calificación de 1 a 5 estrellas';
COMMENT ON COLUMN public.ai_interactions.was_helpful IS 'Si la respuesta fue útil';
COMMENT ON COLUMN public.ai_interactions.execution_success IS 'Si la acción se ejecutó correctamente';
