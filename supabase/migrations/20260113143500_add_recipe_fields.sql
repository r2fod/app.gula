-- Migration: Add new fields for detailed recipe calculations
-- Description: Adds cost_per_unit, waste_percentage, supplier_id to 'ingredients' and model_3d_url to 'recipes'.

-- 1. Add columns to 'ingredients' table
ALTER TABLE ingredients
ADD COLUMN IF NOT EXISTS cost_per_unit numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS waste_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS supplier_id text DEFAULT NULL; 
-- Note: supplier_id is defined as text/uuid but not strictly FK constrained to a 'suppliers' table 
-- to ensure compatibility if 'suppliers' table is not yet created.
-- If 'suppliers' table exists and you want a FK, uncomment the following line:
-- ALTER TABLE ingredients ADD CONSTRAINT fk_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

-- 2. Add columns to 'recipes' table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS model_3d_url text DEFAULT NULL;

-- Note: 'profit_margin' logic is handled by existing 'margin_percent' column or calculated on the fly.
