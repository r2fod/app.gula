-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enum para tipos de evento
CREATE TYPE public.event_type AS ENUM ('boda', 'produccion', 'evento_privado', 'delivery', 'comunion');

-- Tabla principal de eventos
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type public.event_type NOT NULL,
  event_date DATE NOT NULL,
  venue TEXT NOT NULL,
  total_guests INTEGER NOT NULL DEFAULT 0,
  adults INTEGER,
  children INTEGER,
  staff INTEGER,
  canapes_per_person INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propios eventos"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios eventos"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios eventos"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios eventos"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id);

-- Tabla de horarios
CREATE TABLE public.event_timings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_arrival TIME,
  ceremony TIME,
  cocktail_start TIME,
  banquet_start TIME,
  bar_start TIME,
  bar_end TIME,
  bar_hours INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.event_timings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar horarios de sus eventos"
  ON public.event_timings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_timings.event_id
    AND events.user_id = auth.uid()
  ));

-- Tabla de resumen/características del evento
CREATE TABLE public.event_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  lemonade_corner BOOLEAN DEFAULT false,
  beer_corner BOOLEAN DEFAULT false,
  cheese_corner BOOLEAN DEFAULT false,
  cheese_corner_pax INTEGER,
  ham_cutter BOOLEAN DEFAULT false,
  ham_cutter_notes TEXT,
  cocktail_bar BOOLEAN DEFAULT false,
  drinks_bar BOOLEAN DEFAULT false,
  extra_bar_hours BOOLEAN DEFAULT false,
  cake BOOLEAN DEFAULT false,
  candy_bar BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.event_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar características de sus eventos"
  ON public.event_features FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_features.event_id
    AND events.user_id = auth.uid()
  ));

-- Tabla de items del menú
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'cocktail', 'primer_plato', 'segundo_plato', 'postre', 'sorbete', 'resopon', 'infantil'
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar items del menú de sus eventos"
  ON public.menu_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = menu_items.event_id
    AND events.user_id = auth.uid()
  ));

-- Tabla de suministros/menaje
CREATE TABLE public.supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_type TEXT,
  quantity DECIMAL NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar suministros de sus eventos"
  ON public.supplies FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = supplies.event_id
    AND events.user_id = auth.uid()
  ));

-- Tabla de alergias/intolerancias
CREATE TABLE public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  table_number TEXT,
  allergy TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar alergias de sus eventos"
  ON public.allergies FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = allergies.event_id
    AND events.user_id = auth.uid()
  ));

-- Tabla de mobiliario
CREATE TABLE public.furniture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.furniture ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar mobiliario de sus eventos"
  ON public.furniture FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = furniture.event_id
    AND events.user_id = auth.uid()
  ));

-- Tabla de distribución de mesas
CREATE TABLE public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  guests INTEGER NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar mesas de sus eventos"
  ON public.tables FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = tables.event_id
    AND events.user_id = auth.uid()
  ));

-- Tabla de otros requisitos
CREATE TABLE public.other_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.other_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar otros requisitos de sus eventos"
  ON public.other_requirements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = other_requirements.event_id
    AND events.user_id = auth.uid()
  ));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();