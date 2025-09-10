import { supabase } from '@/integrations/supabase/client';

export interface TimeseriesPoint {
  date: string;
  median_price_per_l: number;
  sample_size: number;
}

export interface BrandTimeseries {
  brand: string;
  retailer_slug?: string;
  retailer_name?: string;
  period_days: number;
  points: TimeseriesPoint[];
}

/**
 * Get price timeseries for a brand across all retailers or specific retailer
 */
export async function getBrandTimeseries(
  brand: string, 
  days: number = 30,
  retailerSlug?: string
): Promise<BrandTimeseries[]> {
  let query = supabase
    .from('prices_history')
    .select(`
      scraped_at,
      price_per_l_eur,
      retailer_id,
      retailers!inner(slug, name)
    `)
    .eq('brand', brand)
    .gte('scraped_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .not('price_per_l_eur', 'is', null)
    .order('scraped_at', { ascending: true });

  if (retailerSlug) {
    query = query.eq('retailers.slug', retailerSlug);
  }

  const { data: prices, error } = await query;
  
  if (error) throw error;
  if (!prices) return [];

  // Group by retailer and date (daily aggregation)
  const retailerGroups: Record<string, Record<string, number[]>> = {};
  
  for (const price of prices) {
    const retailer = (price as any).retailers;
    const date = new Date(price.scraped_at).toISOString().split('T')[0];
    const priceValue = price.price_per_l_eur;
    
    if (!retailerGroups[retailer.slug]) {
      retailerGroups[retailer.slug] = {};
    }
    
    if (!retailerGroups[retailer.slug][date]) {
      retailerGroups[retailer.slug][date] = [];
    }
    
    retailerGroups[retailer.slug][date].push(priceValue);
  }

  // Calculate daily medians for each retailer
  const results: BrandTimeseries[] = [];
  
  for (const [retailerSlug, dateGroups] of Object.entries(retailerGroups)) {
    const retailer = prices.find(p => (p as any).retailers.slug === retailerSlug);
    if (!retailer) continue;

    const points: TimeseriesPoint[] = [];
    
    for (const [date, pricesArray] of Object.entries(dateGroups)) {
      const sortedPrices = pricesArray.sort((a, b) => a - b);
      const median = sortedPrices[Math.floor(sortedPrices.length / 2)];
      
      points.push({
        date,
        median_price_per_l: median,
        sample_size: pricesArray.length
      });
    }
    
    results.push({
      brand,
      retailer_slug: retailerSlug,
      retailer_name: (retailer as any).retailers.name,
      period_days: days,
      points: points.sort((a, b) => a.date.localeCompare(b.date))
    });
  }

  return results;
}

/**
 * Get latest median prices by retailer for a brand
 */
export async function getLatestRetailerMedians(brand: string): Promise<Array<{
  retailer_slug: string;
  retailer_name: string;
  median_price_per_l: number;
  last_updated: string;
  sample_size: number;
}>> {
  const { data: prices, error } = await supabase
    .from('prices')
    .select(`
      price_per_l_eur,
      scraped_at,
      retailer_id,
      retailers!inner(slug, name)
    `)
    .eq('brand', brand)
    .not('price_per_l_eur', 'is', null)
    .gte('scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('scraped_at', { ascending: false });

  if (error) throw error;
  if (!prices) return [];

  // Group by retailer
  const retailerGroups: Record<string, { prices: number[], lastUpdate: string, name: string }> = {};
  
  for (const price of prices) {
    const retailer = (price as any).retailers;
    
    if (!retailerGroups[retailer.slug]) {
      retailerGroups[retailer.slug] = {
        prices: [],
        lastUpdate: price.scraped_at,
        name: retailer.name
      };
    }
    
    retailerGroups[retailer.slug].prices.push(price.price_per_l_eur);
    
    // Keep the most recent date
    if (price.scraped_at > retailerGroups[retailer.slug].lastUpdate) {
      retailerGroups[retailer.slug].lastUpdate = price.scraped_at;
    }
  }

  return Object.entries(retailerGroups).map(([slug, data]) => {
    const sortedPrices = data.prices.sort((a, b) => a - b);
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)];
    
    return {
      retailer_slug: slug,
      retailer_name: data.name,
      median_price_per_l: median,
      last_updated: data.lastUpdate,
      sample_size: data.prices.length
    };
  }).sort((a, b) => a.median_price_per_l - b.median_price_per_l);
}
