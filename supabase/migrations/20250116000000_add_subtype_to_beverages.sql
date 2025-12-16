-- Añadir campo subtype a la tabla beverages
ALTER TABLE public.beverages ADD COLUMN IF NOT EXISTS subtype TEXT;

-- Crear índice para mejorar consultas por subtype
CREATE INDEX IF NOT EXISTS idx_beverages_subtype ON public.beverages(subtype);
