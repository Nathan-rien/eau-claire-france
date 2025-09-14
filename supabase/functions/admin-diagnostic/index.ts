import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiagnosticResult {
  ok: boolean;
  details: {
    retailers_count: number;
    active_retailers_count: number;
    prices_count: number;
    history_90d_count: number;
    last_scraped_at: string | null;
    distinct_brands_count: number;
  };
  env: {
    has_service_role_key: boolean;
    has_anon_key: boolean;
    has_url: boolean;
  };
  errors?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('Starting diagnostic...');
    
    // Check environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    const env = {
      has_service_role_key: !!SUPABASE_SERVICE_ROLE_KEY,
      has_anon_key: !!SUPABASE_ANON_KEY,
      has_url: !!SUPABASE_URL,
    };

    const errors: string[] = [];

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      errors.push('La clé service (écriture) est absente. Ouvrez README > Configuration et collez la clé.');
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      errors.push('Configuration Supabase incomplète. Vérifiez les variables d\'environnement.');
    }

    if (errors.length > 0) {
      const result: DiagnosticResult = {
        ok: false,
        details: {
          retailers_count: 0,
          active_retailers_count: 0,
          prices_count: 0,
          history_90d_count: 0,
          last_scraped_at: null,
          distinct_brands_count: 0,
        },
        env,
        errors,
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create clients
    const anon = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    const service = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log('Running diagnostic checks...');

    // Get retailers count
    const { count: retailers_count } = await anon
      .from('retailers')
      .select('*', { count: 'exact', head: true });

    const { count: active_retailers_count } = await anon
      .from('retailers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get prices count
    const { count: prices_count } = await anon
      .from('prices')
      .select('*', { count: 'exact', head: true });

    // Get history count (last 90 days)
    const { count: history_90d_count } = await anon
      .from('prices_history')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', new Date(Date.now() - 90*24*60*60*1000).toISOString());

    // Get last scraped date
    const { data: lastScraped } = await anon
      .from('prices')
      .select('scraped_at')
      .order('scraped_at', { ascending: false })
      .limit(1);

    // Get distinct brands count
    const brandsRes = await anon.functions.invoke('debug-brands');
    const distinct_brands_count = brandsRes.error ? 0 : (brandsRes.data as string[]).length;

    const details = {
      retailers_count: retailers_count || 0,
      active_retailers_count: active_retailers_count || 0,
      prices_count: prices_count || 0,
      history_90d_count: history_90d_count || 0,
      last_scraped_at: lastScraped?.[0]?.scraped_at || null,
      distinct_brands_count,
    };

    const result: DiagnosticResult = {
      ok: details.retailers_count >= 3 && details.active_retailers_count >= 3,
      details,
      env,
    };

    console.log('Diagnostic completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Diagnostic error:', error);
    
    const result: DiagnosticResult = {
      ok: false,
      details: {
        retailers_count: 0,
        active_retailers_count: 0,
        prices_count: 0,
        history_90d_count: 0,
        last_scraped_at: null,
        distinct_brands_count: 0,
      },
      env: {
        has_service_role_key: false,
        has_anon_key: false,
        has_url: false,
      },
      errors: ['Erreur lors du diagnostic: ' + (error as Error).message],
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});