import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmokeResult {
  ok: boolean;
  items_found: number;
  items_saved: number;
  error_rate: number;
  started_at: string;
  finished_at: string;
  message?: string;
}

// Minimal scraper for smoke test
class SimpleScraper {
  constructor(private retailerSlug: string) {}

  async scrape(options: { brands: string[], format: string, maxPages: number }) {
    // This is a minimal mock scraper for the smoke test
    // In a real implementation, you'd have the actual scraping logic here
    console.log(`Mock scraping ${this.retailerSlug} for brands: ${options.brands.join(', ')}`);
    
    // Simulate some scraping time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data
      const mockItems = options.brands.map((brand, index) => ({
        brand,
        product_name: `${brand} ${options.format}`,
        price_total_eur: 1.50 + (index * 0.25),
        total_volume_l: options.format === '1,5 l' ? 1.5 : 0.5,
        unit_volume_l: options.format === '1,5 l' ? 1.5 : 0.5,
        pack_count: 1,
        price_per_l_eur: null, // Will be calculated
        is_promo: false,
        availability: 'in_stock',
        url: `https://example.com/${brand.toLowerCase()}`,
        image_url: null,
        sku: `${brand}-${options.format}`,
        promo_label: null,
      }));

    return mockItems;
  }
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

  const started_at = new Date().toISOString();
  
  try {
    console.log('Starting smoke test...');
    
    // Check environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      const result: SmokeResult = {
        ok: false,
        items_found: 0,
        items_saved: 0,
        error_rate: 1.0,
        started_at,
        finished_at: new Date().toISOString(),
        message: 'La clé service (écriture) est absente. Ouvrez README > Configuration et collez la clé.',
      };

      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get retailers for smoke test
    const { data: retailers } = await service
      .from('retailers')
      .select('id, slug, name')
      .eq('status', 'active')
      .in('slug', ['carrefour', 'auchan', 'leclerc']);

    if (!retailers || retailers.length === 0) {
      const result: SmokeResult = {
        ok: false,
        items_found: 0,
        items_saved: 0,
        error_rate: 1.0,
        started_at,
        finished_at: new Date().toISOString(),
        message: 'Aucune enseigne trouvée pour le smoke test. Vérifiez que Carrefour, Auchan et Leclerc sont présents et actifs.',
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a run record
    const { data: run, error: runError } = await service
      .from('runs')
      .insert({
        retailer_id: retailers[0].id,
        status: 'running',
        notes: 'Smoke test from admin interface',
      })
      .select()
      .single();

    if (runError) {
      throw new Error(`Failed to create run: ${runError.message}`);
    }

    let totalFound = 0;
    let totalSaved = 0;
    let totalErrors = 0;

    // Smoke test parameters
    const brands = ['Evian', 'Cristaline'];
    const format = '1,5 l';

    for (const retailer of retailers) {
      try {
        console.log(`Scraping ${retailer.name}...`);
        
        const scraper = new SimpleScraper(retailer.slug);
        const items = await scraper.scrape({ brands, format, maxPages: 1 });
        
        totalFound += items.length;

        // Process and save items
        const processedItems = items.map(item => {
          // Calculate price_per_l_eur if missing
          const price_per_l_eur = item.price_per_l_eur || 
            (item.price_total_eur && item.total_volume_l ? 
              Math.round((item.price_total_eur / item.total_volume_l) * 10000) / 10000 : null);

          const unique_hash = `${retailer.slug}-${item.brand}-${item.product_name}-${Date.now()}`.substring(0, 64);

          return {
            retailer_id: retailer.id,
            run_id: run.id,
            brand: item.brand,
            product_name: item.product_name,
            price_total_eur: item.price_total_eur,
            total_volume_l: item.total_volume_l,
            unit_volume_l: item.unit_volume_l,
            pack_count: item.pack_count,
            price_per_l_eur,
            is_promo: item.is_promo,
            availability: item.availability,
            url: item.url,
            image_url: item.image_url,
            sku: item.sku,
            promo_label: item.promo_label,
            unique_hash,
            scraped_at: new Date().toISOString(),
          };
        });

        // Insert into prices table
        const { error: insertError } = await service
          .from('prices')
          .insert(processedItems);

        if (insertError) {
          console.error(`Error inserting prices for ${retailer.name}:`, insertError);
          totalErrors += items.length;
        } else {
          totalSaved += items.length;
          console.log(`Saved ${items.length} items for ${retailer.name}`);
        }

        // Also insert into prices_history
        await service
          .from('prices_history')
          .insert(processedItems.map(item => ({ ...item, id: undefined })));

      } catch (error) {
        console.error(`Error scraping ${retailer.name}:`, error);
        totalErrors += brands.length; // Estimate
      }
    }

    const finished_at = new Date().toISOString();
    const error_rate = totalFound > 0 ? totalErrors / totalFound : 0;

    // Update run record
    await service
      .from('runs')
      .update({
        status: 'completed',
        finished_at,
        items_found: totalFound,
        items_saved: totalSaved,
        error_rate,
      })
      .eq('id', run.id);

    const result: SmokeResult = {
      ok: totalSaved > 0,
      items_found: totalFound,
      items_saved: totalSaved,
      error_rate,
      started_at,
      finished_at,
      message: totalSaved > 0 ? 
        `Smoke test réussi ! ${totalSaved} produits ajoutés.` :
        'Aucun produit sauvegardé. Vérifiez la configuration ou les sélecteurs.',
    };

    console.log('Smoke test completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Smoke test error:', error);
    
    const result: SmokeResult = {
      ok: false,
      items_found: 0,
      items_saved: 0,
      error_rate: 1.0,
      started_at,
      finished_at: new Date().toISOString(),
      message: 'Erreur lors du smoke test: ' + (error as Error).message,
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});