
-- Add available column to menu_items table
ALTER TABLE public.menu_items 
ADD COLUMN available BOOLEAN NOT NULL DEFAULT true;

-- Update existing items to be available by default
UPDATE public.menu_items SET available = true WHERE available IS NULL;
