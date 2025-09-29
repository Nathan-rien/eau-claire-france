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

    // Récupérer le mapping des retailers
    const { data: retailers, error: retailersError } = await supabase
      .from('retailers')
      .select('id, name, slug, domain, status')
      .eq('status', 'active');

    if (retailersError) throw retailersError;

    // Créer un mapping pour résolution
    const retailerMapping = new Map();
    retailers?.forEach(retailer => {
      retailerMapping.set(retailer.slug, retailer);
      const normalizedName = retailer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      retailerMapping.set(normalizedName, retailer);
      if (retailer.domain) {
        retailerMapping.set(retailer.domain.replace('www.', ''), retailer);
      }
    });

    // Récupérer les prix avec des UUIDs génériques
    const { data: prices, error: pricesError } = await supabase
      .from('prices_history')
      .select('id, retailer_id, sku, url, unique_hash')
      .or('retailer_id.like.%1111111%,retailer_id.like.%2222222%,retailer_id.like.%3333333%,retailer_id.like.%4444444%,retailer_id.like.%5555555%,retailer_id.like.%6666666%')
      .limit(1000);

    if (pricesError) throw pricesError;

    let updatedCount = 0;
    const errors = [];

    for (const price of prices || []) {
      let correctRetailer = null;
      
      // Tentative de résolution par SKU
      if (price.sku) {
        const skuPrefix = price.sku.split('_')[0]?.toLowerCase();
        correctRetailer = retailerMapping.get(skuPrefix);
      }
      
      // Tentative par unique_hash
      if (!correctRetailer && price.unique_hash) {
        const hashPrefix = price.unique_hash.split('-')[0]?.toLowerCase();
        correctRetailer = retailerMapping.get(hashPrefix);
      }
      
      // Tentative par URL
      if (!correctRetailer && price.url) {
        try {
          const url = new URL(price.url);
          const domain = url.hostname.replace('www.', '');
          for (const [key, retailer] of retailerMapping.entries()) {
            if (key.includes(domain) || domain.includes(key)) {
              correctRetailer = retailer;
              break;
            }
          }
        } catch {
          // URL invalide, ignorer
        }
      }
      
      // Mettre à jour si trouvé
      if (correctRetailer && correctRetailer.id !== price.retailer_id) {
        const { error: updateError } = await supabase
          .from('prices_history')
          .update({ retailer_id: correctRetailer.id })
          .eq('id', price.id);
        
        if (updateError) {
          errors.push(`Failed to update ${price.id}: ${updateError.message}`);
        } else {
          updatedCount++;
        }
      }
    }

    // Mettre à jour également la table prices
    const { data: currentPrices, error: currentPricesError } = await supabase
      .from('prices')
      .select('id, retailer_id, sku, url, unique_hash')
      .or('retailer_id.like.%1111111%,retailer_id.like.%2222222%,retailer_id.like.%3333333%,retailer_id.like.%4444444%,retailer_id.like.%5555555%,retailer_id.like.%6666666%');

    if (!currentPricesError) {
      let currentUpdatedCount = 0;
      for (const price of currentPrices || []) {
        let correctRetailer = null;
        
        if (price.sku) {
          const skuPrefix = price.sku.split('_')[0]?.toLowerCase();
          correctRetailer = retailerMapping.get(skuPrefix);
        }
        
        if (!correctRetailer && price.unique_hash) {
          const hashPrefix = price.unique_hash.split('-')[0]?.toLowerCase();
          correctRetailer = retailerMapping.get(hashPrefix);
        }
        
        if (!correctRetailer && price.url) {
          try {
            const url = new URL(price.url);
            const domain = url.hostname.replace('www.', '');
            for (const [key, retailer] of retailerMapping.entries()) {
              if (key.includes(domain) || domain.includes(key)) {
                correctRetailer = retailer;
                break;
              }
            }
          } catch {
            // URL invalide, ignorer
          }
        }
        
        if (correctRetailer && correctRetailer.id !== price.retailer_id) {
          const { error: updateError } = await supabase
            .from('prices')
            .update({ retailer_id: correctRetailer.id })
            .eq('id', price.id);
          
          if (!updateError) {
            currentUpdatedCount++;
          }
        }
      }
      updatedCount += currentUpdatedCount;
    }

    return new Response(JSON.stringify({
      success: true,
      updated_count: updatedCount,
      total_processed: (prices?.length || 0) + (currentPrices?.length || 0),
      errors: errors,
      message: `Successfully updated ${updatedCount} records`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Fix retailer IDs error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: (error as any)?.message || 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});