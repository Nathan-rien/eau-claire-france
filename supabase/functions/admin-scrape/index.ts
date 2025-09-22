import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || req.headers.get('referer');
  const frontOrigin = Deno.env.get('FRONT_ORIGIN');
  
  let allowOrigin = frontOrigin ?? '*';
  if (frontOrigin && origin && origin !== frontOrigin) {
    allowOrigin = frontOrigin;
  } else if (origin) {
    allowOrigin = origin;
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'content-type, x-admin-token, authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
}

interface ScrapingResult {
  retailer: string;
  success: boolean;
  count: number;
  error?: string;
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders(req) });
  }

  try {
    // Verify admin token
    const adminToken = req.headers.get('x-admin-token');
    const expectedToken = Deno.env.get('ADMIN_DASHBOARD_TOKEN');
    
    if (!expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 401, 
          code: 'ADMIN_TOKEN_MISSING', 
          message: 'X-Admin-Token requis.', 
          hint: 'Définir ADMIN_DASHBOARD_TOKEN côté serveur.' 
        }),
        { status: 401, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }
    
    if (!adminToken || adminToken !== expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 403, 
          code: 'ADMIN_TOKEN_INVALID', 
          message: 'Jeton admin invalide.', 
          hint: 'Vérifier ADMIN_DASHBOARD_TOKEN.' 
        }),
        { status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('[admin-scrape] Request payload (without secrets):', JSON.stringify({
      ...body,
      // Don't log any sensitive data
    }, null, 2));
    
    // Set defaults for Wide Run
    const { 
      mode = 'wide', 
      action, 
      retailers = ['carrefour','auchan','leclerc','intermarche','u','monoprix'], 
      brands = ['cristaline','evian','volvic','hepar','contrex','perrier','vittel'], 
      formats = ['0,5 l','1 l','1,5 l'], 
      maxPages = 2, 
      headful = false, 
      dryRun = false 
    } = body;

    // Support both old 'action' field and new 'mode' field for backwards compatibility
    if (action === 'wide-run' || mode === 'wide') {
      // Use data from body destructuring above
      const actualRetailers = retailers || ['carrefour','auchan','leclerc','intermarche','u','monoprix'];
      const actualFormats = formats || ['0,5 l','1 l','1,5 l'];
      const actualBrands = brands || ['cristaline','evian','volvic','hepar','contrex','perrier','vittel'];
      
      console.log('Starting wide scraping run:', { 
        retailers: actualRetailers, 
        formats: actualFormats, 
        brands: actualBrands, 
        maxPages, 
        headful, 
        dryRun 
      });
      
      // Create a new run record with robust error handling
      let runData;
      try {
        console.log('[admin-scrape] Creating run record with type: wide');
        const { data, error: runError } = await supabase
          .from('runs')
          .insert({
            type: 'wide',
            status: 'running',
            payload: {
              retailers: actualRetailers,
              brands: actualBrands,
              formats: actualFormats,
              maxPages,
              headful,
              dryRun
            }
          })
          .select()
          .single();

        if (runError) {
          console.error('[admin-scrape] run insert failed', { 
            code: runError.code, 
            message: runError.message, 
            details: runError.details 
          });
          return new Response(
            JSON.stringify({ 
              ok: false, 
              status: 200, 
              code: 'RUN_CREATE_FAILED', 
              message: runError.message,
              hint: 'Check RLS and schema' 
            }),
            { status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
          );
        }

        runData = data;
        console.log('[admin-scrape] Run record created successfully:', runData.id);
      } catch (error) {
        console.error('[admin-scrape] run insert failed', { 
          code: error.code, 
          message: error.message, 
          details: error.details 
        });
        return new Response(
          JSON.stringify({ 
            ok: false, 
            status: 200, 
            code: 'RUN_CREATE_FAILED', 
            message: error.message,
            hint: 'Check RLS and schema' 
          }),
          { status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
        );
      }

      const results: Record<string, ScrapingResult> = {};
      let totalItemsFound = 0;
      let totalItemsSaved = 0;
      let successfulRetailers = 0;

      // Import the real scraping function
      const { runScraping } = await import('../../src/scripts/run-scrape.ts');
      
      // Configure real scraping
      const scrapingConfig = {
        retailers: actualRetailers,
        brands: actualBrands,
        formats: actualFormats,
        maxPages,
        throttleMs: 1000, // 1 second between requests
        headful: headful,
        dryRun: dryRun,
        debug: false
      };
      
      console.log('Starting real scraping with config:', scrapingConfig);
      
      // Run actual scraping
      try {
        await runScraping(scrapingConfig);
        
        // Check results from the run
        const { data: finalRun } = await supabase
          .from('runs')
          .select('items_found, items_saved, error_rate')
          .eq('id', runData.id)
          .single();
        
        if (finalRun) {
          totalItemsFound = finalRun.items_found || 0;
          totalItemsSaved = finalRun.items_saved || 0;
          successfulRetailers = actualRetailers.length - Math.floor((finalRun.error_rate || 0) * actualRetailers.length);
        }
        
        // Set all retailers as success for now (detailed results come from runScraping)
        for (const retailer of actualRetailers) {
          results[retailer] = { retailer, success: true, count: Math.floor(totalItemsSaved / actualRetailers.length) };
        }
        
      } catch (scrapingError) {
        console.error('Real scraping failed:', scrapingError);
        
        // Fallback: set all as failed
        for (const retailer of actualRetailers) {
          results[retailer] = { retailer, success: false, count: 0, error: scrapingError.message };
        }
      }

      // Refresh materialized view to show new data immediately
      try {
        await supabase.rpc('refresh_prices_view');
        console.log('Materialized view refreshed successfully');
      } catch (refreshError) {
        console.error('Failed to refresh materialized view:', refreshError);
      }

      // Update run record (if not already updated by runScraping)
      const { data: currentRun } = await supabase
        .from('runs')
        .select('status')
        .eq('id', runData.id)
        .single();

      if (currentRun?.status === 'running') {
        await supabase
          .from('runs')
          .update({
            status: totalItemsSaved > 0 ? 'success' : 'failed',
            finished_at: new Date().toISOString(),
            items_found: totalItemsFound,
            items_saved: totalItemsSaved,
            error_rate: (actualRetailers.length - successfulRetailers) / actualRetailers.length,
            quality_score: totalItemsSaved > 80 ? 1.0 : totalItemsSaved / 80
          })
          .eq('id', runData.id);
      }

      const response = {
        ok: true,
        status: 200,
        runId: runData.id,
        startedAt: new Date().toISOString(),
        retailersCount: actualRetailers.length,
        itemsSaved: totalItemsSaved,
        queued: true,
        hint: "Wide Run terminé, consultez /prix-eaux"
      };

      console.log('Wide run completed:', response);

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'export-csv') {
      console.log('Exporting prices to CSV...');
      
      const { data: prices, error: pricesError } = await supabase
        .from('prices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (pricesError) {
        return new Response(
          JSON.stringify({ 
            ok: false, 
            status: 500, 
            message: 'Failed to fetch prices',
            error: pricesError.message 
          }),
          { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
        );
      }

      // Generate CSV
      const headers = ['brand', 'product_name', 'retailer_id', 'pack_count', 'unit_volume_l', 'total_volume_l', 'price_total_eur', 'price_per_l_eur', 'is_promo', 'availability', 'scraped_at'];
      const csvContent = [
        headers.join(','),
        ...prices.map(price => headers.map(header => 
          JSON.stringify(price[header] || '')
        ).join(','))
      ].join('\n');

      return new Response(
        JSON.stringify({
          ok: true,
          status: 200,
          csv: csvContent,
          count: prices.length,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        ok: false, 
        status: 400, 
        message: 'Action non supportée',
        supportedActions: ['wide-run', 'export-csv']
      }),
      { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-scrape function:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        status: 500, 
        code: 'UNEXPECTED_ERROR', 
        message: 'Erreur serveur interne.', 
        hint: 'Consulter logs Edge Function.',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});

// Function removed - now using real scraping via runScraping()