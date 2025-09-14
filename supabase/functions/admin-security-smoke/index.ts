import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
}

async function callSecurityEndpoint(endpoint: string, adminToken: string) {
  try {
    const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/admin-security-${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
        'apikey': Deno.env.get('SUPABASE_ANON_KEY')!
      }
    });

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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Security smoke test error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false,
        pass: false,
        error: 'Internal server error',
        message: `Erreur durant Security Smoke Test: ${error.message}`,
        steps: [],
        summary: { total_checks: 0, passed: 0, failed: 1, cron_eligible: false, security_level: 'error' }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})