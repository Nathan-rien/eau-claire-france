-- Idempotent migration for runs table schema
-- Table runs
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  status text not null default 'queued',
  payload jsonb default '{}'::jsonb,
  result jsonb,
  error jsonb,
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add missing columns if they don't exist (idempotent)
DO $$
BEGIN
  -- Check and add payload column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='runs' AND column_name='payload'
  ) THEN
    ALTER TABLE public.runs ADD COLUMN payload jsonb default '{}'::jsonb;
  END IF;
  
  -- Check and add result column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='runs' AND column_name='result'
  ) THEN
    ALTER TABLE public.runs ADD COLUMN result jsonb;
  END IF;
  
  -- Check and add error column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='runs' AND column_name='error'
  ) THEN
    ALTER TABLE public.runs ADD COLUMN error jsonb;
  END IF;
  
  -- Check and add type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='runs' AND column_name='type'
  ) THEN
    ALTER TABLE public.runs ADD COLUMN type text not null default 'unknown';
  END IF;
  
  -- Check and add queued_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='runs' AND column_name='queued_at'
  ) THEN
    ALTER TABLE public.runs ADD COLUMN queued_at timestamptz not null default now();
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_runs_created_at ON public.runs(created_at);
CREATE INDEX IF NOT EXISTS idx_runs_type_status ON public.runs(type, status);

-- Update function for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column() 
RETURNS trigger
LANGUAGE plpgsql 
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trg_runs_updated_at ON public.runs;
CREATE TRIGGER trg_runs_updated_at 
  BEFORE UPDATE ON public.runs
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS and create policies
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS runs_service_all ON public.runs;
DROP POLICY IF EXISTS runs_read_public ON public.runs;

-- Create service role policy (for Edge Functions)
CREATE POLICY runs_service_all ON public.runs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create public read policy for recent runs
CREATE POLICY runs_read_public ON public.runs
  FOR SELECT
  USING (created_at > (now() - interval '30 days'));