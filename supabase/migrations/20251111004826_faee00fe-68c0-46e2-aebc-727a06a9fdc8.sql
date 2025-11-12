-- Add avatar_url and streak to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS streak integer DEFAULT 0;

-- Rename brand_url to external_url in marketplace_items for clarity
ALTER TABLE public.marketplace_items 
RENAME COLUMN brand_url TO external_url;