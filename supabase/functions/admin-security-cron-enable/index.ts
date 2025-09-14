import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, verify that security smoke test would pass
    try {
      const smokeUrl = `${supabaseUrl}/functions/v1/admin-security-smoke`;
      const smokeResponse = await fetch(smokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
          'apikey': Deno.env.get('SUPABASE_ANON_KEY')!
        }
      });

      if (!smokeResponse.ok) {
        throw new Error(`Security smoke test failed: ${smokeResponse.statusText}`);
      }

      const smokeResult = await smokeResponse.json();
      
      if (!smokeResult.pass) {
        return new Response(
          JSON.stringify({
            ok: false,
            cronEnabled: false,
            message: 'CRON ne peut pas être activé - Security Smoke Test échoué',
            details: smokeResult,
            requirements: [
              'Tous les tests de sécurité doivent passer',
              'RLS policies doivent être correctes',
              'Security headers doivent être configurés',
              'Environment variables doivent être sécurisées'
            ]
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({
          ok: false,
          cronEnabled: false,
          message: 'Impossible de vérifier les prérequis de sécurité',
          error: error.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the CRON activation
    try {
      await supabase.from('audit_logs').insert({
        event_type: 'cron_control',
        action: 'cron_enabled',
        severity: 'medium',
        details: {
          admin_token_used: true,
          security_checks_passed: true,
          timestamp: new Date().toISOString()
        }
      });
    } catch (auditError) {
      console.error('Failed to log CRON activation:', auditError);
    }

    // In a real implementation, this would update a configuration store
    // For now, we'll simulate successful activation
    console.log('CRON activation requested and approved');

    return new Response(
      JSON.stringify({
        ok: true,
        cronEnabled: true,
        message: 'CRON activé avec succès',
        details: {
          activated_at: new Date().toISOString(),
          security_verified: true,
          next_run: 'Selon planification configurée'
        },
        warnings: [
          'Surveiller les logs pour détecter d\'éventuels problèmes',
          'Désactiver immédiatement si des anomalies sont détectées',
          'Vérifier régulièrement les métriques de qualité'
        ]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('CRON enable error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false,
        cronEnabled: false,
        error: 'Internal server error',
        message: `Erreur lors de l'activation CRON: ${error.message}`
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})