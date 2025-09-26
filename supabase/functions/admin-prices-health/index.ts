import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Query today's stats
    const { count: todayCount, error: todayError } = await supabase
      .from('prices_history')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', new Date().toISOString().split('T')[0]);

    if (todayError) throw todayError;

    // Count rows with null volume today
    const { count: nullVolumeCount, error: nullVolumeError } = await supabase
      .from('prices_history')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', new Date().toISOString().split('T')[0])
      .or('total_volume_l.is.null,total_volume_l.eq.0');

    if (nullVolumeError) throw nullVolumeError;

    // Count rows with null price per liter today
    const { count: nullPplCount, error: nullPplError } = await supabase
      .from('prices_history')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', new Date().toISOString().split('T')[0])
      .is('price_per_l_eur', null);

    if (nullPplError) throw nullPplError;

    // Count rows in prices_history_last
    const { count: lastCount, error: lastError } = await supabase
      .from('prices_history_last')
      .select('*', { count: 'exact', head: true });

    if (lastError) throw lastError;

    // Get some sample rows
    const { data: sampleRows, error: sampleError } = await supabase
      .from('prices_history')
      .select('brand, product_name, total_volume_l, price_per_l_eur, scraped_at')
      .gte('scraped_at', new Date().toISOString().split('T')[0])
      .order('scraped_at', { ascending: false })
      .limit(5);

    if (sampleError) throw sampleError;

    const result = {
      rows_today: todayCount || 0,
      rows_with_null_volume: nullVolumeCount || 0,
      rows_with_null_ppl: nullPplCount || 0,
      rows_in_last_view: lastCount || 0,
      sample_rows: sampleRows || []
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin prices health error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});