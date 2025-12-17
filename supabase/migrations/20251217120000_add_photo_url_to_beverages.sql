-- Add photo_url column to beverages table
ALTER TABLE public.beverages ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Enable storage for menus bucket if not already enabled (optional check, usually setup elsewhere but good to note)
-- Policy updates might be needed if not using signed URLs, but 'menus' bucket seems to be used in useBeverages.ts
