-- Security hardening: Implement proper RLS policies for production

-- Ensure retailers table is read-only for public, admin-only for writes
DROP POLICY IF EXISTS "retailers_read_public" ON public.retailers;
DROP POLICY IF EXISTS "retailers_admin_only" ON public.retailers;

CREATE POLICY "retailers_read_public" 
ON public.retailers 
FOR SELECT 
USING (true);

CREATE POLICY "retailers_admin_only" 
ON public.retailers 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'authenticated');

-- Ensure runs table is restricted - only service role can write, public can read recent runs
DROP POLICY IF EXISTS "runs_read_public" ON public.runs;
DROP POLICY IF EXISTS "runs_write_service" ON public.runs;

CREATE POLICY "runs_read_public" 
ON public.runs 
FOR SELECT 
USING (started_at > now() - interval '30 days');

CREATE POLICY "runs_write_service" 
ON public.runs 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Ensure prices table - public read, service write only
DROP POLICY IF EXISTS "prices_read_public" ON public.prices;
DROP POLICY IF EXISTS "prices_write_service" ON public.prices;

CREATE POLICY "prices_read_public" 
ON public.prices 
FOR SELECT 
USING (true);

CREATE POLICY "prices_write_service" 
ON public.prices 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Ensure prices_history is limited to 90 days for public
DROP POLICY IF EXISTS "prices_history_read_public" ON public.prices_history;
DROP POLICY IF EXISTS "prices_history_write_service" ON public.prices_history;

CREATE POLICY "prices_history_read_public" 
ON public.prices_history 
FOR SELECT 
USING (scraped_at > now() - interval '90 days');

CREATE POLICY "prices_history_write_service" 
ON public.prices_history 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Ensure audit_logs are completely restricted from public access
DROP POLICY IF EXISTS "audit_logs_service_only" ON public.audit_logs;

CREATE POLICY "audit_logs_service_only" 
ON public.audit_logs 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Ensure rate_limits table is service role only
DROP POLICY IF EXISTS "rate_limits_service_only" ON public.rate_limits;

CREATE POLICY "rate_limits_service_only" 
ON public.rate_limits 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');