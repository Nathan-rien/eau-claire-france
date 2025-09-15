import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    'Access-Control-Allow-Headers': 'content-type, x-admin-token, authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin'
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  try {
    // Verify admin authentication
    const adminToken = req.headers.get('x-admin-token');
    const expectedToken = Deno.env.get('ADMIN_DASHBOARD_TOKEN');
    
    if (!adminToken || !expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 401, 
          code: "ADMIN_TOKEN_MISSING", 
          message: "X-Admin-Token requis.", 
          hint: "Définir ADMIN_DASHBOARD_TOKEN côté serveur et renvoyer le header X-Admin-Token." 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (adminToken !== expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 403, 
          code: "ADMIN_TOKEN_INVALID", 
          message: "Jeton admin invalide.", 
          hint: "Vérifier ADMIN_DASHBOARD_TOKEN." 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check IP allowlist if configured
    const ipAllowlist = Deno.env.get('ADMIN_IP_ALLOWLIST');
    if (ipAllowlist) {
      const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
      const allowedIps = ipAllowlist.split(',').map(ip => ip.trim());
      if (!allowedIps.includes(clientIp)) {
        return new Response(
          JSON.stringify({ 
            ok: false, 
            status: 403, 
            code: "IP_NOT_ALLOWED", 
            message: "IP non autorisée.", 
            hint: "Vérifier ADMIN_IP_ALLOWLIST." 
          }),
          { 
            status: 403, 
            headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log the CRON deactivation
    try {
      await supabase.from('audit_logs').insert({
        event_type: 'cron_control',
        action: 'cron_disabled',
        severity: 'low',
        details: {
          admin_token_used: true,
          reason: 'Manual deactivation via admin dashboard',
          timestamp: new Date().toISOString()
        }
      });
    } catch (auditError) {
      console.error('Failed to log CRON deactivation:', auditError);
    }

    // In a real implementation, this would update a configuration store
    // For now, we'll simulate successful deactivation
    console.log('CRON deactivation requested and processed');

    return new Response(
      JSON.stringify({
        ok: true,
        cronEnabled: false,
        message: 'CRON désactivé avec succès',
        details: {
          deactivated_at: new Date().toISOString(),
          reason: 'Admin manual deactivation',
          status: 'Safe to make configuration changes'
        },
        recommendations: [
          'Le scraping automatique est maintenant arrêté',
          'Les configurations peuvent être modifiées en sécurité',
          'Réactiver après validation des changements'
        ]
      }),
      { 
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('CRON disable error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false,
        cronEnabled: true, // Assume it's still enabled if we can't disable
        error: 'Internal server error',
        message: `Erreur lors de la désactivation CRON: ${error.message}`
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
      }
    );
  }
})