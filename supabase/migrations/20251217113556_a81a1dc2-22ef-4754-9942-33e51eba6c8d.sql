-- Add photo_url and unit_price columns to supplies table
ALTER TABLE public.supplies 
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS unit_price numeric DEFAULT 0;