-- Tabla para menús de Gula Catering
CREATE TABLE public.menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  menu_type TEXT NOT NULL DEFAULT 'cocktail', -- cocktail, banquete, postre, infantil, etc.
  file_url TEXT, -- URL del PDF o imagen
  file_type TEXT, -- pdf, image
  items JSONB DEFAULT '[]'::jsonb, -- Array de platos si es manual
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own menus" ON public.menus FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own menus" ON public.menus FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own menus" ON public.menus FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own menus" ON public.menus FOR DELETE USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.menus 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabla para análisis de eventos
CREATE TABLE public.event_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL, -- performance, costs, suggestions
  content JSONB NOT NULL,
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.event_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage analysis of their events" ON public.event_analysis FOR ALL
USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_analysis.event_id AND events.user_id = auth.uid()));

-- Bucket para archivos de menús
INSERT INTO storage.buckets (id, name, public) VALUES ('menus', 'menus', true);

-- Políticas de storage
CREATE POLICY "Users can upload menu files" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'menus' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view menu files" ON storage.objects FOR SELECT 
USING (bucket_id = 'menus');

CREATE POLICY "Users can update their menu files" ON storage.objects FOR UPDATE 
USING (bucket_id = 'menus' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their menu files" ON storage.objects FOR DELETE 
USING (bucket_id = 'menus' AND auth.uid()::text = (storage.foldername(name))[1]);