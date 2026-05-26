
-- 1. Fix retailers privilege escalation: restrict writes to admins / service_role only
DROP POLICY IF EXISTS "retailers_admin_only" ON public.retailers;

CREATE POLICY "retailers_service_write"
ON public.retailers
FOR ALL
TO public
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "retailers_admin_write"
ON public.retailers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. Restrict runs internal metadata to admins only
DROP POLICY IF EXISTS "runs_read_public" ON public.runs;

CREATE POLICY "runs_read_admin"
ON public.runs
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3. Explicit deny on anonymous DELETE/UPDATE for alertes_utilisateurs
CREATE POLICY "Deny anonymous delete on alertes_utilisateurs"
ON public.alertes_utilisateurs
FOR DELETE
TO anon
USING (false);

CREATE POLICY "Deny anonymous update on alertes_utilisateurs"
ON public.alertes_utilisateurs
FOR UPDATE
TO anon
USING (false)
WITH CHECK (false);

-- 4. Add service_role DELETE policy on blog-images bucket
CREATE POLICY "blog_images_service_delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'blog-images' AND auth.role() = 'service_role');

-- 5. Fix mutable search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 6. Revoke API access to materialized view prices_history_last
REVOKE ALL ON public.prices_history_last FROM anon, authenticated;
