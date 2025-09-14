import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const adminToken = req.headers.get('x-admin-token');
    const expectedToken = Deno.env.get('ADMIN_DASHBOARD_TOKEN');
    
    if (!expectedToken || adminToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Environment diagnostic
    const env = {
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
      hasUrl: !!Deno.env.get('SUPABASE_URL'),
      adminTokenSet: !!Deno.env.get('ADMIN_DASHBOARD_TOKEN'),
      cronEnabled: Deno.env.get('CRON_ENABLED') === 'true',
      nodeEnv: Deno.env.get('NODE_ENV') || 'development',
      hasWebhookUrl: !!Deno.env.get('ALERT_WEBHOOK_URL'),
      hasIpAllowlist: !!Deno.env.get('ADMIN_IP_ALLOWLIST')
    };

    // Feature flags
    const flags = {
      FF_ADMIN_UI: Deno.env.get('FF_ADMIN_UI') === 'true',
      FF_DEBUG_ROUTES: Deno.env.get('FF_DEBUG_ROUTES') === 'true',
      FF_QUICKSTART: Deno.env.get('FF_QUICKSTART') === 'true',
      FF_SECURITY_HEADERS: Deno.env.get('FF_SECURITY_HEADERS') !== 'false',
      FF_RATE_LIMITING: Deno.env.get('FF_RATE_LIMITING') !== 'false',
      FF_AUDIT_LOGGING: Deno.env.get('FF_AUDIT_LOGGING') !== 'false',
      FF_PUBLIC_TIMESERIES_API: Deno.env.get('FF_PUBLIC_TIMESERIES_API') !== 'false'
    };

    // CORS configuration
    const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS') || '';
    const cors = {
      allowedOrigins: allowedOrigins ? allowedOrigins.split(',') : ['http://localhost:5173'],
      hasWildcard: allowedOrigins.includes('*'),
      configured: !!allowedOrigins
    };

    // Security assessment
    const issues = [];
    const warnings = [];

    if (!env.hasServiceKey) {
      issues.push('SUPABASE_SERVICE_ROLE_KEY manquant');
    }
    if (!env.hasAnonKey) {
      issues.push('SUPABASE_ANON_KEY manquant');
    }
    if (!env.hasUrl) {
      issues.push('SUPABASE_URL manquant');
    }
    if (!env.adminTokenSet) {
      issues.push('ADMIN_DASHBOARD_TOKEN manquant');
    }

    if (env.nodeEnv === 'production') {
      if (flags.FF_DEBUG_ROUTES) {
        issues.push('FF_DEBUG_ROUTES activé en production');
      }
      if (flags.FF_QUICKSTART) {
        warnings.push('FF_QUICKSTART activé en production');
      }
      if (cors.hasWildcard) {
        issues.push('CORS utilise wildcard (*) en production');
      }
    }

    if (env.cronEnabled && issues.length > 0) {
      issues.push('CRON activé malgré des problèmes de sécurité');
    }

    // Calculate overall status
    const isHealthy = issues.length === 0;
    const hasWarnings = warnings.length > 0;

    // Build configuration summary
    const summary = {
      environment: env.nodeEnv,
      security_level: isHealthy ? (hasWarnings ? 'medium' : 'high') : 'low',
      issues_count: issues.length,
      warnings_count: warnings.length,
      cron_status: env.cronEnabled ? 'enabled' : 'disabled',
      admin_access: env.adminTokenSet ? 'configured' : 'not_configured'
    };

    return new Response(
      JSON.stringify({
        ok: isHealthy,
        warning: hasWarnings,
        message: isHealthy 
          ? (hasWarnings ? 'Configuration valide avec avertissements' : 'Configuration optimale')
          : 'Configuration incomplète ou dangereuse',
        env,
        flags,
        cors,
        issues,
        warnings,
        summary,
        recommendations: [
          ...(issues.length > 0 ? ['Corriger les problèmes critiques avant activation CRON'] : []),
          ...(env.nodeEnv === 'production' && flags.FF_QUICKSTART ? ['Désactiver FF_QUICKSTART en production'] : []),
          ...(!env.hasIpAllowlist ? ['Considérer ADMIN_IP_ALLOWLIST pour sécuriser l\'accès admin'] : []),
          ...(!env.hasWebhookUrl ? ['Configurer ALERT_WEBHOOK_URL pour monitoring'] : [])
        ]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Diagnostic error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})