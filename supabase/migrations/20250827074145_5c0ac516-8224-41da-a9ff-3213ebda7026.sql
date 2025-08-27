-- Add explicit deny policy for anonymous users to prevent email exposure
CREATE POLICY "Deny anonymous access to alertes_utilisateurs" 
ON public.alertes_utilisateurs 
FOR SELECT 
TO anon 
USING (false);

-- Ensure the policy is applied with proper priority by recreating the authenticated user policy
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.alertes_utilisateurs;

CREATE POLICY "Authenticated users can view their own subscriptions" 
ON public.alertes_utilisateurs 
FOR SELECT 
TO authenticated
USING (email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text);