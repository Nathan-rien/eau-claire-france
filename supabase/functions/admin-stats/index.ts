import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check prices_history today
    const today = new Date().toISOString().split('T')[0];
    const { data: historyToday, error: historyError } = await supabase
      .from('prices_history')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', `${today}T00:00:00.000Z`)
      .lt('scraped_at', `${today}T23:59:59.999Z`);

    if (historyError) {
      throw new Error(`Error counting prices_history today: ${historyError.message}`);
    }

    // Check prices_history_last view
    const { data: historyLast, error: lastError } = await supabase
      .from('prices_history_last')
      .select('*', { count: 'exact', head: true });

    if (lastError) {
      throw new Error(`Error counting prices_history_last: ${lastError.message}`);
    }

    // Check current prices
    const { data: currentPrices, error: currentError } = await supabase
      .from('prices')
      .select('*', { count: 'exact', head: true });

    if (currentError) {
      throw new Error(`Error counting current prices: ${currentError.message}`);
    }

    const stats = {
      prices_history_today: historyToday?.length || 0,
      prices_history_last_count: historyLast?.length || 0,
      current_prices_count: currentPrices?.length || 0,
      timestamp: new Date().toISOString(),
      date_checked: today
    };

    console.log('Database stats:', stats);

    return new Response(
      JSON.stringify(stats),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error getting database stats:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});