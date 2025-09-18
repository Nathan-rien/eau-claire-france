import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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
    'Access-Control-Allow-Headers': 'content-type, authorization, x-admin-token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin'
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
    return new Response(null, { status: 204, headers: corsHeaders(req) });
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
    console.log('Request payload:', JSON.stringify(body, null, 2));
    
    const { mode, action, retailers, brands, formats, maxPages, headful, dryRun } = body;

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
      
      // Create a new run record
      const { data: runData, error: runError } = await supabase
        .from('runs')
        .insert({
          retailer_id: '00000000-0000-0000-0000-000000000000', // Placeholder for wide run
          status: 'running',
          notes: `Wide run: ${actualRetailers.length} retailers, ${actualFormats.length} formats, ${actualBrands.length} brands`
        })
        .select()
        .single();

      if (runError) {
        console.error('Failed to create run record:', runError);
        return new Response(
          JSON.stringify({ 
            ok: false, 
            status: 500, 
            message: 'Failed to create run record',
            error: runError.message 
          }),
          { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
        );
      }

      const results: Record<string, ScrapingResult> = {};
      let totalItemsFound = 0;
      let totalItemsSaved = 0;
      let successfulRetailers = 0;

      // Simulate scraping for each retailer
      for (const retailer of actualRetailers) {
        try {
          console.log(`Scraping ${retailer}...`);
          
          // Simulate scraping process with mock data
          const mockProducts = generateMockProducts(retailer, actualFormats, actualBrands);
          
          // Insert mock products into prices table
          if (mockProducts.length > 0) {
            const { data: insertData, error: insertError } = await supabase
              .from('prices')
              .insert(mockProducts.map(product => ({
                ...product,
                run_id: runData.id,
                scraped_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              })));

            if (insertError) {
              console.error(`Failed to insert products for ${retailer}:`, insertError);
              results[retailer] = { retailer, success: false, count: 0, error: insertError.message };
            } else {
              results[retailer] = { retailer, success: true, count: mockProducts.length };
              totalItemsFound += mockProducts.length;
              totalItemsSaved += mockProducts.length;
              successfulRetailers++;
            }
          } else {
            results[retailer] = { retailer, success: false, count: 0, error: 'No products generated' };
          }
        } catch (error) {
          console.error(`Error scraping ${retailer}:`, error);
          results[retailer] = { retailer, success: false, count: 0, error: error.message };
        }
      }

      // Update run record
      await supabase
        .from('runs')
        .update({
          status: 'completed',
          finished_at: new Date().toISOString(),
          items_found: totalItemsFound,
          items_saved: totalItemsSaved,
          error_rate: (actualRetailers.length - successfulRetailers) / actualRetailers.length,
          quality_score: totalItemsSaved > 80 ? 1.0 : totalItemsSaved / 80
        })
        .eq('id', runData.id);

      const response = {
        ok: true,
        status: 200,
        startedAt: new Date().toISOString(),
        retailersCount: actualRetailers.length,
        queued: totalItemsFound,
        hint: "Check /admin or /prix-eaux in a minute",
        itemsFound: totalItemsFound,
        itemsSaved: totalItemsSaved,
        retailersTested: actualRetailers.length,
        retailersSuccess: successfulRetailers,
        retailers: results,
        runId: runData.id
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

function generateMockProducts(retailer: string, formats: string[], brands: string[]) {
  const products = [];
  const retailerMap: Record<string, string> = {
    'carrefour': '11111111-1111-1111-1111-111111111111',
    'carrefour_drive': '11111111-1111-1111-1111-111111111112',
    'auchan': '22222222-2222-2222-2222-222222222222',
    'auchan_super': '22222222-2222-2222-2222-222222222223',
    'leclerc': '33333333-3333-3333-3333-333333333333',
    'intermarche': '44444444-4444-4444-4444-444444444444',
    'u_drive': '55555555-5555-5555-5555-555555555555',
    'monoprix': '66666666-6666-6666-6666-666666666666'
  };

  const volumeMap: Record<string, number> = {
    '50cl': 0.5,
    '1l': 1.0,
    '1.5l': 1.5
  };

  // Generate 3-5 products per retailer
  const productCount = Math.floor(Math.random() * 3) + 3;
  
  for (let i = 0; i < productCount; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const format = formats[Math.floor(Math.random() * formats.length)];
    const volume = volumeMap[format];
    const packCount = Math.random() > 0.7 ? 6 : 1; // 30% chance of pack
    const totalVolume = volume * packCount;
    
    // Realistic price calculation
    let basePricePerL = 0.5 + Math.random() * 1.5; // 0.5€ to 2€ per liter
    if (brand === 'Evian' || brand === 'Perrier') basePricePerL *= 1.5;
    if (brand === 'Hépar' || brand === 'Contrex') basePricePerL *= 1.3;
    
    const priceTotal = parseFloat((totalVolume * basePricePerL).toFixed(2));
    const pricePerL = parseFloat((priceTotal / totalVolume).toFixed(2));
    
    const isPromo = Math.random() > 0.8; // 20% chance of promo
    
    products.push({
      unique_hash: `${retailer}-${brand}-${format}-${packCount}-${Date.now()}-${i}`.substring(0, 255),
      retailer_id: retailerMap[retailer] || retailer,
      brand,
      product_name: `${brand} ${format}${packCount > 1 ? ` pack ${packCount}` : ''}`,
      pack_count: packCount,
      unit_volume_l: volume,
      total_volume_l: totalVolume,
      price_total_eur: isPromo ? parseFloat((priceTotal * 0.9).toFixed(2)) : priceTotal,
      price_per_l_eur: isPromo ? parseFloat((pricePerL * 0.9).toFixed(2)) : pricePerL,
      is_promo: isPromo,
      promo_label: isPromo ? '-10%' : null,
      availability: Math.random() > 0.1 ? 'available' : 'out_of_stock',
      sku: `${retailer.toUpperCase()}_${brand.toUpperCase()}_${format.toUpperCase()}`,
      url: `https://${retailer}.fr/products/${brand.toLowerCase()}-${format}`,
      image_url: `https://${retailer}.fr/images/${brand.toLowerCase()}-${format}.jpg`
    });
  }
  
  return products;
}