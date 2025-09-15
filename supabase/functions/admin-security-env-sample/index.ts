import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-admin-token, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Vary': 'Origin'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const adminToken = req.headers.get('x-admin-token');
    const expectedToken = Deno.env.get('ADMIN_DASHBOARD_TOKEN');
    
    if (!expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 401, 
          code: 'ADMIN_TOKEN_MISSING', 
          message: 'X-Admin-Token requis.', 
          hint: 'Définir ADMIN_DASHBOARD_TOKEN côté serveur.' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!adminToken || adminToken !== expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 403, 
          code: 'ADMIN_TOKEN_INVALID', 
          message: 'Jeton admin invalide.', 
          hint: 'Vérifier ADMIN_DASHBOARD_TOKEN.' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const envSample = `# InfoEau - Configuration Environnement
# =========================================

# BACKEND (Node.js/Edge Functions) - Variables serveur UNIQUEMENT
# ----------------------------------------------------------------
SUPABASE_URL=${Deno.env.get('SUPABASE_URL') || 'https://xblogttmomuogdhmaztf.supabase.co'}
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key-here...

# FRONTEND (Vite/React) - Prefix VITE_ OBLIGATOIRE pour exposition client
# ------------------------------------------------------------------------
VITE_SUPABASE_URL=${Deno.env.get('SUPABASE_URL') || 'https://xblogttmomuogdhmaztf.supabase.co'}
VITE_SUPABASE_ANON_KEY=${Deno.env.get('SUPABASE_ANON_KEY') || 'eyJ...your-anon-key-here...'}

# SÉCURITÉ & ADMIN
# ----------------
# Token d'accès admin (générer un token fort et aléatoire)
ADMIN_DASHBOARD_TOKEN=change-me-to-a-very-long-random-secure-token-here

# Liste d'IPs autorisées pour l'admin (optionnel, CSV)
# Exemple: ADMIN_IP_ALLOWLIST=192.168.1.100,203.0.113.0/24
ADMIN_IP_ALLOWLIST=

# FEATURE FLAGS - PRODUCTION (sécurisé par défaut)
# ------------------------------------------------
FF_ADMIN_UI=false
FF_DEBUG_ROUTES=false
FF_QUICKSTART=false
FF_SECURITY_HEADERS=true
FF_RATE_LIMITING=true
FF_AUDIT_LOGGING=true
FF_PUBLIC_TIMESERIES_API=true

# CORS - Origines autorisées (CSV, pas de wildcard * en production)
# -----------------------------------------------------------------
ALLOWED_ORIGINS=https://infoeau.fr,https://www.infoeau.fr

# CRON & AUTOMATION (désactivé par défaut, activation via Security Dashboard)
# ---------------------------------------------------------------------------
CRON_ENABLED=false

# ALERTES & MONITORING (optionnel)
# --------------------------------
# Webhook Slack/Discord pour alertes sécurité
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Variables CSVs locaux (optionnel si données en local)
# -----------------------------------------------------
VITE_WATER_COMPO_CSV_URL=/data/infoeau_emn_composition_v2_partial.csv
VITE_WATER_CATALOG_CSV_URL=/data/infoeau_catalog_eaux_v3.csv
VITE_WATER_MDD_CSV_URL=/data/eaux_MDD_par_distributeur_et_source_FR_v3.csv

# INSTRUCTIONS DE SÉCURITÉ
# ========================
# 1. JAMAIS exposer SERVICE_ROLE_KEY côté client (pas de VITE_ prefix)
# 2. Générer un ADMIN_DASHBOARD_TOKEN fort (min 32 caractères aléatoires)
# 3. En production: FF_DEBUG_ROUTES=false, FF_QUICKSTART=false
# 4. CORS: jamais de wildcard (*), uniquement domaines spécifiques
# 5. CRON_ENABLED=false tant que Security Smoke Test n'est pas PASS
# 6. Surveiller les logs d'audit pour tentatives d'intrusion

# VÉRIFICATION
# ============
# 1. npm run security:smoke  # Lancer tous les tests de sécurité
# 2. npm run harden:check    # Vérifier configuration de sécurité
# 3. npm run rls:check       # Tester les politiques RLS Supabase
`;

    // Check for missing variables
    const missing = [];
    if (!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!Deno.env.get('VITE_SUPABASE_ANON_KEY')) missing.push('VITE_SUPABASE_ANON_KEY');
    if (!Deno.env.get('ADMIN_DASHBOARD_TOKEN')) missing.push('ADMIN_DASHBOARD_TOKEN');

    return new Response(
      JSON.stringify({
        ok: true,
        status: 200,
        envSample,
        missing,
        instructions: [
          'Copier ce contenu dans votre fichier .env',
          'Remplacer les valeurs placeholder par vos vraies clés',
          'Générer un ADMIN_DASHBOARD_TOKEN sécurisé',
          'Vérifier les domaines CORS en production',
          'Lancer npm run security:smoke après configuration'
        ],
        warnings: [
          'Ne jamais commiter les vraies clés dans Git',
          'SERVICE_ROLE_KEY ne doit jamais avoir le prefix VITE_',
          'Tester la configuration avec le Security Dashboard',
          'Garder CRON_ENABLED=false jusqu\'à validation complète'
        ]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('ENV sample error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        status: 500, 
        code: 'UNEXPECTED_ERROR', 
        message: 'Erreur serveur interne.', 
        hint: 'Consulter logs Edge Function.',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})