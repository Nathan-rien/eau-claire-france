-- Make retailer_id nullable for wide runs that don't target a specific retailer
ALTER TABLE public.runs ALTER COLUMN retailer_id DROP NOT NULL;