import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

async function callSecurityEndpoint(endpoint: string, adminToken: string) {
  try {
    const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/admin-security-${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
  }
});

async function updateSecurityReport(smokeResult: any) {
  try {
    const timestamp = new Date().toLocaleString('fr-FR');
    const globalStatus = smokeResult.ok ? 'PASS' : 'FAIL';
    const cronStatus = Deno.env.get('CRON_ENABLED') === 'true' ? 'ENABLED' : 'DISABLED';

    const reportContent = `# InfoEau - Rapport de Sécurité

**Date:** ${timestamp}
**Statut Global:** ${globalStatus === 'PASS' ? '✅' : '❌'} ${globalStatus}
**CRON Status:** ${cronStatus === 'ENABLED' ? '✅' : '❌'} ${cronStatus}

## Résumé des Vérifications

${smokeResult.steps?.map((step: any) => 
  `- **${step.name}:** ${step.ok ? '✅ PASS' : '❌ FAIL'} - ${step.message}`
).join('\n') || ''}

## Configuration Actuelle

### Variables d'Environnement Critiques

- **SUPABASE_URL:** ${Deno.env.get('SUPABASE_URL') ? '✅ Défini' : '❌ Manquant'}
- **SUPABASE_SERVICE_ROLE_KEY:** ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? '✅ Défini' : '❌ Manquant'}
- **ADMIN_DASHBOARD_TOKEN:** ${Deno.env.get('ADMIN_DASHBOARD_TOKEN') ? '✅ Défini' : '❌ Manquant'}

### Feature Flags

- **FF_ADMIN_UI:** ${Deno.env.get('FF_ADMIN_UI') || 'false'}
- **FF_DEBUG_ROUTES:** ${Deno.env.get('FF_DEBUG_ROUTES') || 'false'}
- **FF_QUICKSTART:** ${Deno.env.get('FF_QUICKSTART') || 'false'}
- **FF_SECURITY_HEADERS:** ${Deno.env.get('FF_SECURITY_HEADERS') || 'true'}
- **FF_RATE_LIMITING:** ${Deno.env.get('FF_RATE_LIMITING') || 'true'}

### CORS Configuration

- **ALLOWED_ORIGINS:** ${Deno.env.get('ALLOWED_ORIGINS') || 'Non défini'}

## Prochaines Étapes

${globalStatus === 'FAIL' ? `
⚠️ **Actions requises pour la mise en production:**

${smokeResult.steps?.filter((step: any) => !step.ok).map((step: any) => 
  `- ${step.name}: ${step.message}`
).join('\n') || ''}

1. Consultez ENV_SAMPLE.md pour la configuration complète
2. Corrigez les problèmes identifiés ci-dessus
3. Relancez le Security Smoke Test
4. Activez le CRON une fois tous les tests PASS
` : `
✅ **Système sécurisé - Prêt pour la production**

1. CRON peut être activé en toute sécurité
2. Surveillance des alertes opérationnelle
3. Accès administrateur protégé
`}

---
*Rapport généré automatiquement le ${timestamp}*
*Accès Security Dashboard: \`/admin/security\`*
`;

    console.log('Security report updated');
  } catch (error) {
    console.error('Failed to update security report:', error);
  }
}

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
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

    const steps = [];
    let overallPass = true;

    console.log('Starting Security Smoke Test...');

    // Step 1: RLS Check
    try {
      console.log('Running RLS check...');
      const rlsResult = await callSecurityEndpoint('rls', adminToken);
      steps.push({
        name: 'RLS Policies',
        ok: rlsResult.ok,
        message: rlsResult.message,
        details: rlsResult.summary
      });
      if (!rlsResult.ok) overallPass = false;
    } catch (error) {
      steps.push({
        name: 'RLS Policies',
        ok: false,
        message: `Erreur lors de la vérification RLS: ${error.message}`,
        details: null
      });
      overallPass = false;
    }

    // Step 2: Hardening Check
    try {
      console.log('Running hardening check...');
      const hardeningResult = await callSecurityEndpoint('hardening', adminToken);
      steps.push({
        name: 'Security Hardening',
        ok: hardeningResult.ok,
        message: hardeningResult.message,
        details: hardeningResult.summary
      });
      if (!hardeningResult.ok) overallPass = false;
    } catch (error) {
      steps.push({
        name: 'Security Hardening',
        ok: false,
        message: `Erreur lors de la vérification hardening: ${error.message}`,
        details: null
      });
      overallPass = false;
    }

    // Step 3: Environment Diagnostic
    try {
      console.log('Running diagnostic...');
      const diagnosticResult = await callSecurityEndpoint('diagnostic', adminToken);
      steps.push({
        name: 'Environment & Config',
        ok: diagnosticResult.ok,
        message: diagnosticResult.message,
        details: diagnosticResult.summary
      });
      if (!diagnosticResult.ok) overallPass = false;
    } catch (error) {
      steps.push({
        name: 'Environment & Config',
        ok: false,
        message: `Erreur lors du diagnostic: ${error.message}`,
        details: null
      });
      overallPass = false;
    }

    // Additional validation for CRON eligibility
    const cronEligible = overallPass && steps.every(step => step.ok);
    
    if (cronEligible) {
      steps.push({
        name: 'CRON Eligibility',
        ok: true,
        message: 'Tous les checks passés - CRON peut être activé',
        details: { eligible: true, reason: 'All security checks passed' }
      });
    } else {
      const failedSteps = steps.filter(step => !step.ok).map(step => step.name);
      steps.push({
        name: 'CRON Eligibility',
        ok: false,
        message: `CRON verrouillé - échecs: ${failedSteps.join(', ')}`,
        details: { eligible: false, failedSteps }
      });
    }

    // Generate recommendations
    const recommendations = [];
    
    if (!overallPass) {
      recommendations.push('Corriger tous les problèmes de sécurité avant activation CRON');
    }
    
    const failedChecks = steps.filter(step => !step.ok);
    if (failedChecks.length > 0) {
      recommendations.push(...failedChecks.map(check => 
        `Résoudre: ${check.name} - ${check.message}`
      ));
    }

    if (overallPass) {
      recommendations.push('Configuration sécurisée - CRON peut être activé en toute sécurité');
    }

    const summary = {
      total_checks: steps.length - 1, // Exclude CRON Eligibility from count
      passed: steps.filter(step => step.ok && step.name !== 'CRON Eligibility').length,
      failed: steps.filter(step => !step.ok && step.name !== 'CRON Eligibility').length,
      cron_eligible: cronEligible,
      security_level: overallPass ? 'production_ready' : 'needs_attention'
    };

    console.log('Security Smoke Test completed:', { overallPass, cronEligible, summary });

    return new Response(
      JSON.stringify({
        ok: overallPass,
        status: 200,
        pass: cronEligible,
        message: overallPass 
          ? 'Security Smoke Test PASSED - Prêt pour production'
          : 'Security Smoke Test FAILED - Corrections requises',
        steps,
        summary,
        recommendations,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Security smoke test error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false,
        status: 500,
        code: "UNEXPECTED_ERROR",
        pass: false,
        message: `Erreur serveur interne: ${error.message}`,
        hint: "Consulter logs Edge Function.",
        steps: [],
        summary: { total_checks: 0, passed: 0, failed: 1, cron_eligible: false, security_level: 'error' }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
      }
    );
  }
})