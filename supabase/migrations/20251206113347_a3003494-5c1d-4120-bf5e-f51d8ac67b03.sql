-- Tabla para bebidas/barra libre
CREATE TABLE public.beverages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'aperitivo', 'copas', 'corner_limonada', 'corner_cerveza'
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  price_per_person DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  is_extra BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.beverages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage beverages of their events"
ON public.beverages FOR ALL
USING (EXISTS (SELECT 1 FROM events WHERE events.id = beverages.event_id AND events.user_id = auth.uid()));

-- Tabla para equipamiento de sala
CREATE TABLE public.room_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'sala', 'cocina', 'cristaleria', 'manteleria'
  item_name TEXT NOT NULL,
  quantity TEXT, -- puede ser número o texto como "GRANDE Y NESPRESSO"
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.room_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage room equipment of their events"
ON public.room_equipment FOR ALL
USING (EXISTS (SELECT 1 FROM events WHERE events.id = room_equipment.event_id AND events.user_id = auth.uid()));

-- Tabla para corners especiales
CREATE TABLE public.corners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  corner_type TEXT NOT NULL, -- 'limonada', 'cervezas', 'queso', 'jamon'
  is_enabled BOOLEAN DEFAULT false,
  pax_count INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.corners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage corners of their events"
ON public.corners FOR ALL
USING (EXISTS (SELECT 1 FROM events WHERE events.id = corners.event_id AND events.user_id = auth.uid()));

-- Tabla para ingredientes de recetas del cocktail
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  recipe_name TEXT NOT NULL,
  ingredient_name TEXT NOT NULL,
  base_quantity DECIMAL(10,3) NOT NULL, -- cantidad base para 100 pax
  unit TEXT NOT NULL, -- 'kg', 'ud', 'L', 'paquetes'
  calculated_quantity DECIMAL(10,3), -- cantidad calculada según pax del evento
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage recipe ingredients of their events"
ON public.recipe_ingredients FOR ALL
USING (EXISTS (SELECT 1 FROM events WHERE events.id = recipe_ingredients.event_id AND events.user_id = auth.uid()));

-- Tabla para personal/staff
CREATE TABLE public.event_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'camarero', 'cocina', 'coordinador', etc.
  staff_count INTEGER NOT NULL DEFAULT 0,
  arrival_time TIME,
  departure_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage staff of their events"
ON public.event_staff FOR ALL
USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_staff.event_id AND events.user_id = auth.uid()));

-- Tabla para alquileres y seguimiento
CREATE TABLE public.rentals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'recogido', 'entregado'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage rentals of their events"
ON public.rentals FOR ALL
USING (EXISTS (SELECT 1 FROM events WHERE events.id = rentals.event_id AND events.user_id = auth.uid()));

-- Añadir campos extra a la tabla events para resopón, menú infantil, etc.
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS resopon TEXT,
ADD COLUMN IF NOT EXISTS children_menu TEXT,
ADD COLUMN IF NOT EXISTS tablecloth_color TEXT,
ADD COLUMN IF NOT EXISTS minutas_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ceremony_notes TEXT;