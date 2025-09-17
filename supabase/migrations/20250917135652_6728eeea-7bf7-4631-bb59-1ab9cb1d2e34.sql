-- RLS Policies Setup for InfoEau Security
-- Idempotent migrations for Row Level Security policies

-- Enable RLS on all tables first
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts (idempotent)
DO $$ 
BEGIN
    -- Drop retailers policies
    DROP POLICY IF EXISTS retailers_public_select ON public.retailers;
    DROP POLICY IF EXISTS retailers_read_public ON public.retailers;
    
    -- Drop prices policies  
    DROP POLICY IF EXISTS prices_public_select ON public.prices;
    DROP POLICY IF EXISTS prices_read_public ON public.prices;
    
    -- Drop prices_history policies
    DROP POLICY IF EXISTS prices_history_public_select_90d ON public.prices_history;
    DROP POLICY IF EXISTS prices_history_read_public ON public.prices_history;
    
    -- Drop runs policies
    DROP POLICY IF EXISTS runs_service_all ON public.runs;
    DROP POLICY IF EXISTS runs_write_service ON public.runs;
    DROP POLICY IF EXISTS "Public can view recent runs" ON public.runs;
    
    -- Drop audit_logs policies
    DROP POLICY IF EXISTS audit_logs_service_all ON public.audit_logs;
    DROP POLICY IF EXISTS "Allow service role access to audit logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Deny all public access to audit logs" ON public.audit_logs;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if policies don't exist
    NULL;
END $$;

-- Create new RLS policies
-- retailers: public read access limited to active and beta status
CREATE POLICY retailers_public_select ON public.retailers
FOR SELECT USING (status IN ('active','beta'));

-- prices: public read access for all
CREATE POLICY prices_public_select ON public.prices
FOR SELECT USING (true);

-- prices_history: public read access for last 90 days
CREATE POLICY prices_history_public_select_90d ON public.prices_history
FOR SELECT USING (scraped_at > (now() - interval '90 days'));

-- runs: service role only access
CREATE POLICY runs_service_all ON public.runs
FOR ALL USING (auth.role() = 'service_role');

-- audit_logs: service role only access  
CREATE POLICY audit_logs_service_all ON public.audit_logs
FOR ALL USING (auth.role() = 'service_role');

-- rate_limits: service role only access
CREATE POLICY rate_limits_service_all ON public.rate_limits
FOR ALL USING (auth.role() = 'service_role');

-- Verify RLS is enabled on all critical tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('retailers', 'prices', 'prices_history', 'runs', 'audit_logs', 'rate_limits')
ORDER BY tablename;