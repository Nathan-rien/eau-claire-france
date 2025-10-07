-- ============================================================================
-- PHASE 1: Infrastructure d'authentification sécurisée
-- ============================================================================

-- 1. Créer l'enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Créer la table user_roles (séparée de profiles pour éviter l'escalade de privilèges)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, role)
);

-- 3. Activer RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Politique RLS: Seul le service_role peut gérer les rôles
CREATE POLICY "Service role manages user roles"
ON public.user_roles FOR ALL
USING (auth.role() = 'service_role');

-- 5. Politique RLS: Les utilisateurs peuvent voir leurs propres rôles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 6. Créer la fonction de vérification de rôle (SECURITY DEFINER pour éviter la récursion RLS)
CREATE OR REPLACE FUNCTION public.has_admin_role(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'admin'::app_role
  );
$$;

-- 7. Fonction helper pour vérifier si l'utilisateur courant est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_admin_role(auth.uid());
$$;

-- ============================================================================
-- PHASE 2: Corriger les RLS overpermissives
-- ============================================================================

-- 8. Corriger raw_products: Supprimer la politique trop permissive
DROP POLICY IF EXISTS "Authenticated users can manage raw products" ON public.raw_products;

-- 9. raw_products: Service role seulement
CREATE POLICY "Service role can manage raw products"
ON public.raw_products FOR ALL
USING (auth.role() = 'service_role');

-- 10. raw_products: Admins peuvent voir (lecture seule)
CREATE POLICY "Admins can view raw products"
ON public.raw_products FOR SELECT
TO authenticated
USING (public.is_admin());

-- 11. Corriger alertes_utilisateurs: Supprimer la politique publique d'insertion
DROP POLICY IF EXISTS "Public can insert subscriptions with email validation" ON public.alertes_utilisateurs;

-- 12. alertes_utilisateurs: Nécessiter l'authentification pour l'insertion
CREATE POLICY "Authenticated users can subscribe"
ON public.alertes_utilisateurs FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND email IS NOT NULL 
  AND commune IS NOT NULL
  AND length(email) <= 255 
  AND length(commune) <= 100
  AND email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  AND consent_rgpd = true
);

-- ============================================================================
-- PHASE 3: Sécuriser la fonction refresh_prices_view
-- ============================================================================

-- 13. Créer une table de logs pour le rate limiting de refresh_prices_view
CREATE TABLE IF NOT EXISTS public.prices_view_refresh_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  refreshed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.prices_view_refresh_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view refresh logs"
ON public.prices_view_refresh_log FOR SELECT
TO authenticated
USING (public.is_admin());

-- 14. Recréer refresh_prices_view avec contrôles de sécurité
CREATE OR REPLACE FUNCTION public.refresh_prices_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  last_refresh TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Vérification: Seuls les admins peuvent rafraîchir
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Rate limiting: Maximum 1 refresh toutes les 5 minutes
  SELECT MAX(refreshed_at) INTO last_refresh
  FROM public.prices_view_refresh_log;
  
  IF last_refresh IS NOT NULL AND last_refresh > NOW() - INTERVAL '5 minutes' THEN
    RAISE EXCEPTION 'Rate limit: view was refreshed % ago. Wait % seconds.',
      NOW() - last_refresh,
      EXTRACT(EPOCH FROM (last_refresh + INTERVAL '5 minutes' - NOW()));
  END IF;
  
  -- Rafraîchir la vue
  REFRESH MATERIALIZED VIEW prices_history_last;
  
  -- Logger le rafraîchissement
  INSERT INTO public.prices_view_refresh_log (refreshed_by)
  VALUES (auth.uid());
END;
$function$;

-- 15. Révoquer l'accès public et autoriser uniquement les utilisateurs authentifiés
REVOKE EXECUTE ON FUNCTION public.refresh_prices_view() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_prices_view() TO authenticated;

-- ============================================================================
-- PHASE 4: Trigger pour updated_at sur user_roles
-- ============================================================================

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- COMMENTAIRES ET DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.user_roles IS 'Stores user roles separately from profiles to prevent privilege escalation attacks';
COMMENT ON FUNCTION public.has_admin_role IS 'Security definer function to check admin role without RLS recursion';
COMMENT ON FUNCTION public.is_admin IS 'Helper function to check if current user is admin';
COMMENT ON FUNCTION public.refresh_prices_view IS 'Admin-only function to refresh materialized view with rate limiting';