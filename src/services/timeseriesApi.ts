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

async function fetchRetailersMap(): Promise<Record<string, { slug: string; name: string }>> {
  const { data, error } = await supabase
    .from('retailers')
    .select('id, slug, name');
  if (error) throw error;
  const map: Record<string, { slug: string; name: string }> = {};
  for (const r of data || []) {
    map[r.id] = { slug: r.slug, name: r.name };
  }
  return map;
}

export async function getBrandTimeseries(
  brand: string,
  days: number = 30,
  retailerSlug?: string
): Promise<BrandTimeseries[]> {
  const retailersMapPromise = fetchRetailersMap();

  let query = supabase
    .from('prices_history')
    .select('scraped_at, price_per_l_eur, retailer_id')
    .eq('brand', brand)
    .not('price_per_l_eur', 'is', null)
    .order('scraped_at', { ascending: true });

  if (days > 0) {
    query = query.gte('scraped_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
  }

  const [retailersMap, pricesResult] = await Promise.all([
    retailersMapPromise,
    query
  ]);

  if (pricesResult.error) throw pricesResult.error;
  const prices = pricesResult.data || [];

  // Filter by retailer slug if specified
  const filtered = retailerSlug
    ? prices.filter(p => retailersMap[p.retailer_id]?.slug === retailerSlug)
    : prices;

  // Group by retailer and date
  const retailerGroups: Record<string, Record<string, number[]>> = {};

  for (const price of filtered) {
    const retailer = retailersMap[price.retailer_id];
    if (!retailer) continue;
    const date = new Date(price.scraped_at).toISOString().split('T')[0];

    if (!retailerGroups[retailer.slug]) {
      retailerGroups[retailer.slug] = {};
    }
    if (!retailerGroups[retailer.slug][date]) {
      retailerGroups[retailer.slug][date] = [];
    }
    retailerGroups[retailer.slug][date].push(price.price_per_l_eur!);
  }

  const results: BrandTimeseries[] = [];

  for (const [slug, dateGroups] of Object.entries(retailerGroups)) {
    const retailer = Object.values(retailersMap).find(r => r.slug === slug);
    if (!retailer) continue;

    const points: TimeseriesPoint[] = [];
    for (const [date, pricesArray] of Object.entries(dateGroups)) {
      const sorted = pricesArray.sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      points.push({ date, median_price_per_l: median, sample_size: pricesArray.length });
    }

    results.push({
      brand,
      retailer_slug: slug,
      retailer_name: retailer.name,
      period_days: days,
      points: points.sort((a, b) => a.date.localeCompare(b.date))
    });
  }

  return results;
}

export async function getLatestRetailerMedians(brand: string): Promise<Array<{
  retailer_slug: string;
  retailer_name: string;
  median_price_per_l: number;
  last_updated: string;
  sample_size: number;
}>> {
  const [retailersMap, pricesResult] = await Promise.all([
    fetchRetailersMap(),
    supabase
      .from('prices')
      .select('price_per_l_eur, scraped_at, retailer_id')
      .eq('brand', brand)
      .not('price_per_l_eur', 'is', null)
      .gte('scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('scraped_at', { ascending: false })
  ]);

  if (pricesResult.error) throw pricesResult.error;
  const prices = pricesResult.data || [];

  const retailerGroups: Record<string, { prices: number[]; lastUpdate: string; name: string }> = {};

  for (const price of prices) {
    const retailer = retailersMap[price.retailer_id];
    if (!retailer) continue;

    if (!retailerGroups[retailer.slug]) {
      retailerGroups[retailer.slug] = { prices: [], lastUpdate: price.scraped_at, name: retailer.name };
    }
    retailerGroups[retailer.slug].prices.push(price.price_per_l_eur!);
    if (price.scraped_at > retailerGroups[retailer.slug].lastUpdate) {
      retailerGroups[retailer.slug].lastUpdate = price.scraped_at;
    }
  }

  return Object.entries(retailerGroups).map(([slug, data]) => {
    const sorted = data.prices.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return {
      retailer_slug: slug,
      retailer_name: data.name,
      median_price_per_l: median,
      last_updated: data.lastUpdate,
      sample_size: data.prices.length
    };
  }).sort((a, b) => a.median_price_per_l - b.median_price_per_l);
}
