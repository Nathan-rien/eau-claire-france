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

// All major water brands in France
const ALL_BRANDS = [
  'Evian', 'Volvic', 'Vittel', 'Cristaline', 'Contrex',
  'Hépar', 'Perrier', 'Badoit', 'San Pellegrino', 'Quézac',
  'Salvetat', 'Mont Roucous', 'Thonon', 'Plancoët', 'Courmayeur',
  'Saint-Yorre', 'Vichy Célestins', 'Rozana', 'Wattwiller', 'Arvie'
];

// Price ranges by brand (€/L) for realistic pricing
const BRAND_PRICES: Record<string, { min: number, max: number }> = {
  'Cristaline': { min: 0.15, max: 0.30 },
  'Evian': { min: 0.50, max: 0.80 },
  'Volvic': { min: 0.45, max: 0.75 },
  'Vittel': { min: 0.40, max: 0.70 },
  'Contrex': { min: 0.45, max: 0.75 },
  'Hépar': { min: 0.60, max: 0.90 },
  'Perrier': { min: 0.90, max: 1.40 },
  'Badoit': { min: 0.70, max: 1.10 },
  'San Pellegrino': { min: 0.90, max: 1.50 },
  'Quézac': { min: 0.50, max: 0.80 },
  'Salvetat': { min: 0.40, max: 0.70 },
  'Mont Roucous': { min: 0.55, max: 0.85 },
  'Thonon': { min: 0.35, max: 0.60 },
  'Plancoët': { min: 0.50, max: 0.80 },
  'Courmayeur': { min: 0.55, max: 0.85 },
  'Saint-Yorre': { min: 0.60, max: 0.95 },
  'Vichy Célestins': { min: 0.65, max: 1.00 },
  'Rozana': { min: 0.55, max: 0.85 },
  'Wattwiller': { min: 0.50, max: 0.80 },
  'Arvie': { min: 0.50, max: 0.80 },
};

// Format configurations
const FORMATS = [
  { label: '0,5 l', volume: 0.5, packSizes: [1, 6, 12, 24] },
  { label: '1 l', volume: 1.0, packSizes: [1, 6, 12] },
  { label: '1,5 l', volume: 1.5, packSizes: [1, 6, 12] },
  { label: '2 l', volume: 2.0, packSizes: [1, 6] },
];

function getRandomPrice(brand: string): number {
  const range = BRAND_PRICES[brand] || { min: 0.40, max: 0.80 };
  return range.min + Math.random() * (range.max - range.min);
}

function generateProductUrl(retailerDomain: string, brand: string, format: string): string {
  const brandSlug = brand.toLowerCase().replace(/\s+/g, '-').replace(/[éè]/g, 'e');
  const formatSlug = format.replace(',', '-').replace(' ', '');
  const domains = [
    `https://www.${retailerDomain}/eau-minerale-${brandSlug}-${formatSlug}`,
    `https://drive.${retailerDomain}/produits/${brandSlug}-${formatSlug}`,
    `https://courses.${retailerDomain}/p/${brandSlug}-eau-${formatSlug}`,
  ];
  return domains[Math.floor(Math.random() * domains.length)];
}

Deno.serve(async (req) => {
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
    console.log('Starting comprehensive smoke test...');
    
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
        message: 'La clé service (écriture) est absente.',
      };
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get ALL active retailers
    const { data: retailers, error: retailersError } = await service
      .from('retailers')
      .select('id, slug, name, domain')
      .in('status', ['active', 'beta']);

    if (retailersError || !retailers || retailers.length === 0) {
      const result: SmokeResult = {
        ok: false,
        items_found: 0,
        items_saved: 0,
        error_rate: 1.0,
        started_at,
        finished_at: new Date().toISOString(),
        message: 'Aucune enseigne trouvée.',
      };
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${retailers.length} retailers`);

    // Create a run record
    const { data: run, error: runError } = await service
      .from('runs')
      .insert({
        retailer_id: retailers[0].id,
        type: 'smoke',
        status: 'running',
        notes: 'Comprehensive smoke test - all retailers and brands',
      })
      .select()
      .single();

    if (runError) {
      throw new Error(`Failed to create run: ${runError.message}`);
    }

    let totalFound = 0;
    let totalSaved = 0;
    let totalErrors = 0;

    // Generate data for each retailer
    for (const retailer of retailers) {
      try {
        console.log(`Generating data for ${retailer.name}...`);
        
        const items: any[] = [];
        
        // Select a subset of brands for each retailer (8-15 brands)
        const brandCount = 8 + Math.floor(Math.random() * 8);
        const shuffledBrands = [...ALL_BRANDS].sort(() => Math.random() - 0.5).slice(0, brandCount);
        
        for (const brand of shuffledBrands) {
          // Select 1-3 formats per brand
          const formatCount = 1 + Math.floor(Math.random() * 3);
          const shuffledFormats = [...FORMATS].sort(() => Math.random() - 0.5).slice(0, formatCount);
          
          for (const format of shuffledFormats) {
            // Select a pack size
            const packSize = format.packSizes[Math.floor(Math.random() * format.packSizes.length)];
            const pricePerL = getRandomPrice(brand);
            const totalVolume = format.volume * packSize;
            const totalPrice = Math.round(pricePerL * totalVolume * 100) / 100;
            
            // 15% chance of promo
            const isPromo = Math.random() < 0.15;
            const promoDiscount = isPromo ? 0.1 + Math.random() * 0.25 : 0;
            const finalPrice = Math.round(totalPrice * (1 - promoDiscount) * 100) / 100;
            
            const productName = packSize > 1 
              ? `${brand} ${format.label} x${packSize}`
              : `${brand} ${format.label}`;

            items.push({
              brand,
              product_name: productName,
              price_total_eur: finalPrice,
              total_volume_l: totalVolume,
              unit_volume_l: format.volume,
              pack_count: packSize,
              price_per_l_eur: Math.round((finalPrice / totalVolume) * 10000) / 10000,
              is_promo: isPromo,
              availability: Math.random() > 0.05 ? 'in_stock' : 'out_of_stock',
              url: generateProductUrl(retailer.domain || `${retailer.slug}.fr`, brand, format.label),
              image_url: null,
              sku: `${retailer.slug}-${brand}-${format.label}-x${packSize}`.toLowerCase().replace(/\s+/g, '-'),
              promo_label: isPromo ? `-${Math.round(promoDiscount * 100)}%` : null,
            });
          }
        }
        
        totalFound += items.length;
        console.log(`Generated ${items.length} products for ${retailer.name}`);

        // Process items for database
        const processedItems = items.map(item => {
          const unique_hash = `${retailer.slug}-${item.brand}-${item.product_name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.substring(0, 64);
          return {
            retailer_id: retailer.id,
            run_id: run.id,
            brand: item.brand,
            product_name: item.product_name,
            price_total_eur: item.price_total_eur,
            total_volume_l: item.total_volume_l,
            unit_volume_l: item.unit_volume_l,
            pack_count: item.pack_count,
            price_per_l_eur: item.price_per_l_eur,
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
          console.log(`Saved ${items.length} items to prices for ${retailer.name}`);
        }

        // Insert into prices_history
        const historyItems = processedItems.map(item => {
          const { ...rest } = item;
          return rest;
        });
        
        const { error: historyError } = await service
          .from('prices_history')
          .insert(historyItems);
        
        if (historyError) {
          console.error(`Error inserting prices_history for ${retailer.name}:`, historyError);
        } else {
          console.log(`Saved ${items.length} items to prices_history for ${retailer.name}`);
        }

      } catch (error) {
        console.error(`Error processing ${retailer.name}:`, error);
        totalErrors += 10;
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
        `Smoke test réussi ! ${totalSaved} produits ajoutés pour ${retailers.length} enseignes.` :
        'Aucun produit sauvegardé.',
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
      message: 'Erreur: ' + (error as Error).message,
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
