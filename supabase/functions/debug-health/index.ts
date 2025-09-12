import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Counts
    const { count: retailers_count } = await supabase
      .from('retailers')
      .select('*', { count: 'exact', head: true });

    const { count: active_retailers_count } = await supabase
      .from('retailers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: prices_count } = await supabase
      .from('prices')
      .select('*', { count: 'exact', head: true });

    const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { count: history_90d_count } = await supabase
      .from('prices_history')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', since90);

    const { data: lastScraped } = await supabase
      .from('prices')
      .select('scraped_at')
      .order('scraped_at', { ascending: false })
      .limit(1);

    const { data: brandRows } = await supabase
      .from('prices')
      .select('brand')
      .not('brand', 'is', null)
      .neq('brand', 'Inconnu');

    const distinctBrands = Array.from(new Set((brandRows || []).map(r => r.brand))).filter(Boolean);

    const body = {
      retailers_count: retailers_count || 0,
      active_retailers_count: active_retailers_count || 0,
      prices_count: prices_count || 0,
      history_90d_count: history_90d_count || 0,
      last_scraped_at: (lastScraped && lastScraped[0]?.scraped_at) || null,
      distinct_brands_count: distinctBrands.length
    };

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'internal_error', message: e instanceof Error ? e.message : String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
