-- Crear tabla para almacenar interacciones con IA
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  actions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Los usuarios pueden ver sus propias interacciones con IA"
  ON public.ai_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias interacciones con IA"
  ON public.ai_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Crear índices para mejorar performance
CREATE INDEX idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_event_id ON public.ai_interactions(event_id);
CREATE INDEX idx_ai_interactions_created_at ON public.ai_interactions(created_at DESC);

-- Crear bucket de storage para archivos subidos por IA
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-files', 'event-files', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Los usuarios pueden subir archivos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-files' AND auth.role() = 'authenticated');

CREATE POLICY "Los usuarios pueden ver archivos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-files');

CREATE POLICY "Los usuarios pueden eliminar sus archivos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-files' AND auth.uid()::text = (storage.foldername(name))[1]);
