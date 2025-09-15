import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || req.headers.get('referer');
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS');
  
  let allowOrigin = '*';
  if (allowedOrigins && origin) {
    const allowed = allowedOrigins.split(',').map(o => o.trim());
    if (allowed.includes(origin) || allowed.includes('*')) {
      allowOrigin = origin;
    }
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'content-type, authorization, x-admin-token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin'
  };
}

interface EnvStatus {
  name: string;
  value?: string;
  maskedValue?: string;
  isDefined: boolean;
  isRequired: boolean;
}

function maskSecret(value: string | undefined): string {
  if (!value || value.length < 8) return value ? '****' : '';
  return `${value.substring(0, 4)}****${value.substring(value.length - 4)}`;
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  try {
    // Verify admin token
    const adminToken = req.headers.get('x-admin-token');
    const expectedToken = Deno.env.get('ADMIN_DASHBOARD_TOKEN');
    
    if (!expectedToken) {
      console.log('ADMIN_DASHBOARD_TOKEN not configured');
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 401, 
          code: 'ADMIN_TOKEN_MISSING', 
          message: 'X-Admin-Token requis.', 
          hint: 'Définir ADMIN_DASHBOARD_TOKEN côté serveur.' 
        }),
        { status: 401, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }
    
    if (!adminToken || adminToken !== expectedToken) {
      console.log('Unauthorized access attempt - invalid admin token');
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 403, 
          code: 'ADMIN_TOKEN_INVALID', 
          message: 'Jeton admin invalide.', 
          hint: 'Vérifier ADMIN_DASHBOARD_TOKEN.' 
        }),
        { status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Check IP allowlist if defined
    const allowlist = Deno.env.get('ADMIN_IP_ALLOWLIST');
    if (allowlist) {
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
      const allowedIPs = allowlist.split(',').map(ip => ip.trim());
      
      if (!allowedIPs.includes(clientIP)) {
        console.log(`Blocked IP: ${clientIP}, allowed: ${allowedIPs}`);
        return new Response(
          JSON.stringify({ 
            ok: false, 
            status: 403, 
            code: 'IP_NOT_ALLOWED', 
            message: `IP ${clientIP} non autorisée.`, 
            hint: `IPs autorisées: ${allowedIPs.join(', ')}` 
          }),
          { status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
        );
      }
    }

    // Collect environment status
    const envStatus: EnvStatus[] = [
      {
        name: 'SUPABASE_URL',
        value: Deno.env.get('SUPABASE_URL'),
        isDefined: !!Deno.env.get('SUPABASE_URL'),
        isRequired: true
      },
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        maskedValue: maskSecret(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')),
        isDefined: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        isRequired: true
      },
      {
        name: 'VITE_SUPABASE_URL',
        value: Deno.env.get('VITE_SUPABASE_URL'),
        isDefined: !!Deno.env.get('VITE_SUPABASE_URL'),
        isRequired: true
      },
      {
        name: 'VITE_SUPABASE_ANON_KEY',
        maskedValue: maskSecret(Deno.env.get('VITE_SUPABASE_ANON_KEY')),
        isDefined: !!Deno.env.get('VITE_SUPABASE_ANON_KEY'),
        isRequired: true
      },
      {
        name: 'ADMIN_DASHBOARD_TOKEN',
        maskedValue: maskSecret(Deno.env.get('ADMIN_DASHBOARD_TOKEN')),
        isDefined: !!Deno.env.get('ADMIN_DASHBOARD_TOKEN'),
        isRequired: true
      },
      {
        name: 'ADMIN_IP_ALLOWLIST',
        value: Deno.env.get('ADMIN_IP_ALLOWLIST') || 'non défini',
        isDefined: !!Deno.env.get('ADMIN_IP_ALLOWLIST'),
        isRequired: false
      }
    ];

    // Collect flags
    const flags = {
      FF_ADMIN_UI: Deno.env.get('FF_ADMIN_UI') === 'true',
      FF_DEBUG_ROUTES: Deno.env.get('FF_DEBUG_ROUTES') === 'true',
      FF_QUICKSTART: Deno.env.get('FF_QUICKSTART') === 'true',
      FF_SECURITY_HEADERS: Deno.env.get('FF_SECURITY_HEADERS') !== 'false', // true by default
      FF_RATE_LIMITING: Deno.env.get('FF_RATE_LIMITING') !== 'false', // true by default
      CRON_ENABLED: Deno.env.get('CRON_ENABLED') === 'true'
    };

    // Generate complete .env content
    const envContent = `# BACKEND (Node, server-side)
SUPABASE_URL=${Deno.env.get('SUPABASE_URL') || 'https://xblogttmomuogdhmaztf.supabase.co'}
SUPABASE_SERVICE_ROLE_KEY=${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'votre-clé-service-ici'}

# FRONT (Vite, navigateur) — prefix VITE_ OBLIGATOIRE
VITE_SUPABASE_URL=${Deno.env.get('VITE_SUPABASE_URL') || 'https://xblogttmomuogdhmaztf.supabase.co'}
VITE_SUPABASE_ANON_KEY=${Deno.env.get('VITE_SUPABASE_ANON_KEY') || 'votre-clé-anon-ici'}

# Sécurité / Admin
ADMIN_DASHBOARD_TOKEN=${Deno.env.get('ADMIN_DASHBOARD_TOKEN') || 'changez-moi-vers-un-token-très-long-et-aléatoire'}
ADMIN_IP_ALLOWLIST=${Deno.env.get('ADMIN_IP_ALLOWLIST') || '# 1.2.3.4,5.6.7.8'}

# Flags prod (sécurisé par défaut)
FF_ADMIN_UI=${flags.FF_ADMIN_UI}
FF_DEBUG_ROUTES=${flags.FF_DEBUG_ROUTES}
FF_QUICKSTART=${flags.FF_QUICKSTART}
FF_SECURITY_HEADERS=${flags.FF_SECURITY_HEADERS}
FF_RATE_LIMITING=${flags.FF_RATE_LIMITING}

# CORS (origines autorisées, CSV)
ALLOWED_ORIGINS=${Deno.env.get('ALLOWED_ORIGINS') || 'https://infoeau.fr,https://www.infoeau.fr'}

# CRON (désactivé tant que Security Smoke ≠ PASS)
CRON_ENABLED=${flags.CRON_ENABLED}

# Alertes (optionnel)
ALERT_WEBHOOK_URL=${Deno.env.get('ALERT_WEBHOOK_URL') || '# https://hooks.slack.com/services/XXX/YYY/ZZZ'}`;

    console.log('Environment status collected successfully');

    return new Response(
      JSON.stringify({
        ok: true,
        status: 200,
        env: {
          hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
          hasAnonKey: !!Deno.env.get('VITE_SUPABASE_ANON_KEY'),
          hasServerUrl: !!Deno.env.get('SUPABASE_URL'),
          hasFrontUrl: !!Deno.env.get('VITE_SUPABASE_URL'),
          adminTokenSet: !!Deno.env.get('ADMIN_DASHBOARD_TOKEN'),
          allowedOrigins: Deno.env.get('ALLOWED_ORIGINS') || ''
        },
        envStatus,
        flags,
        envContent,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in env-status function:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        status: 500, 
        code: 'UNEXPECTED_ERROR', 
        message: 'Erreur serveur interne.', 
        hint: 'Consulter logs Edge Function.',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});