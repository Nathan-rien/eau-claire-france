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

    const results = [];
    let allPassed = true;

    // Test 1: Public read access to retailers
    try {
      const { data: retailers, error: retailersError } = await supabase
        .from('retailers')
        .select('id, name')
        .limit(1);
      
      if (retailersError) {
        results.push({
          test: 'retailers_public_read',
          status: 'FAIL',
          message: `Erreur lecture publique retailers: ${retailersError.message}`
        });
        allPassed = false;
      } else {
        results.push({
          test: 'retailers_public_read',
          status: 'PASS',
          message: 'Lecture publique retailers OK'
        });
      }
    } catch (error) {
      results.push({
        test: 'retailers_public_read',
        status: 'FAIL',
        message: `Exception retailers: ${error.message}`
      });
      allPassed = false;
    }

    // Test 2: Public read access to prices
    try {
      const { data: prices, error: pricesError } = await supabase
        .from('prices')
        .select('id, brand')
        .limit(1);
      
      if (pricesError) {
        results.push({
          test: 'prices_public_read',
          status: 'FAIL',
          message: `Erreur lecture publique prices: ${pricesError.message}`
        });
        allPassed = false;
      } else {
        results.push({
          test: 'prices_public_read',
          status: 'PASS',
          message: 'Lecture publique prices OK'
        });
      }
    } catch (error) {
      results.push({
        test: 'prices_public_read',
        status: 'FAIL',
        message: `Exception prices: ${error.message}`
      });
      allPassed = false;
    }

    // Test 3: Limited public read access to prices_history (90 days)
    try {
      const { data: history, error: historyError } = await supabase
        .from('prices_history')
        .select('id, brand')
        .gte('scraped_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);
      
      if (historyError) {
        results.push({
          test: 'prices_history_90d_read',
          status: 'FAIL',
          message: `Erreur lecture prices_history 90j: ${historyError.message}`
        });
        allPassed = false;
      } else {
        results.push({
          test: 'prices_history_90d_read',
          status: 'PASS',
          message: 'Lecture publique prices_history (90j) OK'
        });
      }
    } catch (error) {
      results.push({
        test: 'prices_history_90d_read',
        status: 'FAIL',
        message: `Exception prices_history: ${error.message}`
      });
      allPassed = false;
    }

    // Test 4: Service role can write to runs
    try {
      const testRun = {
        retailer_id: '00000000-0000-0000-0000-000000000000',
        status: 'test',
        notes: 'RLS test run - can be deleted'
      };
      
      const { data: runData, error: runError } = await supabase
        .from('runs')
        .insert(testRun)
        .select()
        .single();
      
      if (runError) {
        results.push({
          test: 'runs_service_write',
          status: 'FAIL',
          message: `Erreur écriture service runs: ${runError.message}`
        });
        allPassed = false;
      } else {
        // Clean up test data
        await supabase.from('runs').delete().eq('id', runData.id);
        results.push({
          test: 'runs_service_write',
          status: 'PASS',
          message: 'Écriture service runs OK'
        });
      }
    } catch (error) {
      results.push({
        test: 'runs_service_write',
        status: 'FAIL',
        message: `Exception runs service: ${error.message}`
      });
      allPassed = false;
    }

    // Test 5: Check audit_logs access (service role only)
    try {
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('id')
        .limit(1);
      
      if (auditError) {
        results.push({
          test: 'audit_logs_service_access',
          status: 'FAIL',
          message: `Erreur accès audit_logs: ${auditError.message}`
        });
        allPassed = false;
      } else {
        results.push({
          test: 'audit_logs_service_access',
          status: 'PASS',
          message: 'Accès service audit_logs OK'
        });
      }
    } catch (error) {
      results.push({
        test: 'audit_logs_service_access',
        status: 'FAIL',
        message: `Exception audit_logs: ${error.message}`
      });
      allPassed = false;
    }

    return new Response(
      JSON.stringify({
        ok: allPassed,
        message: allPassed ? 'Toutes les politiques RLS sont correctes' : 'Certaines politiques RLS ont échoué',
        tests: results,
        summary: {
          total: results.length,
          passed: results.filter(r => r.status === 'PASS').length,
          failed: results.filter(r => r.status === 'FAIL').length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('RLS check error:', error);
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