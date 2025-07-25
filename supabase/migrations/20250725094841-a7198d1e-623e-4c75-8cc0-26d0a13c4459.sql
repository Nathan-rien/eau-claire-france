-- Fix critical RLS policy vulnerabilities on alertes_utilisateurs table
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Permettre lecture abonnements" ON public.alertes_utilisateurs;
DROP POLICY IF EXISTS "Permettre insertion publique abonnements" ON public.alertes_utilisateurs;

-- Create secure user-specific policies
CREATE POLICY "Users can view their own subscriptions" ON public.alertes_utilisateurs
FOR SELECT 
USING (email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text);

CREATE POLICY "Public can insert subscriptions with email validation" ON public.alertes_utilisateurs
FOR INSERT 
WITH CHECK (
  email IS NOT NULL 
  AND commune IS NOT NULL 
  AND length(email) <= 255 
  AND length(commune) <= 100
  AND email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
);

-- Create missing rate_limits table for edge function
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  type text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  last_reset timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, type)
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rate_limits (prevent user manipulation)
CREATE POLICY "Rate limits are read-only for authenticated users" ON public.rate_limits
FOR SELECT 
TO authenticated
USING (false); -- No one can read rate limits

CREATE POLICY "Only service role can manage rate limits" ON public.rate_limits
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE last_reset < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();