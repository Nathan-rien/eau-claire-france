import { supabase } from "@/integrations/supabase/client";
import { PriceFilters, PaginatedResponse, Price, BrandPriceStats, MedianPriceStats } from '@/types/pricing';

export async function getRetailers() {
  const { data, error } = await supabase
    .from('retailers')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getBrands() {
  const { data, error } = await supabase
    .from('prices')
    .select('brand')
    .not('brand', 'is', null)
    .order('brand');

  if (error) throw error;
  return [...new Set(data.map(item => item.brand))].filter(Boolean);
}

export async function getPrices(filters: PriceFilters): Promise<PaginatedResponse<Price>> {
  const {
    brand,
    retailer,
    format,
    pack,
    search,
    limit = 50,
    page = 1
  } = filters;

  const pageSize = Math.min(limit, 100);
  const currentPage = Math.max(page, 1);
  const offset = (currentPage - 1) * pageSize;

  let query = supabase
    .from('prices')
    .select(`
      *,
      retailers!inner(name, slug)
    `, { count: 'exact' });

  // Apply filters
  if (brand) {
    query = query.ilike('brand', `%${brand}%`);
  }

  if (retailer) {
    query = query.eq('retailers.slug', retailer);
  }

  if (search) {
    query = query.or(`product_name.ilike.%${search}%,brand.ilike.%${search}%`);
  }

  if (format) {
    switch (format) {
      case '50cl':
        query = query.eq('unit_volume_l', 0.5);
        break;
      case '1L':
        query = query.eq('unit_volume_l', 1);
        break;
      case '1.5L':
        query = query.eq('unit_volume_l', 1.5);
        break;
    }
  }

  if (pack) {
    switch (pack) {
      case '6':
        query = query.eq('pack_count', 6);
        break;
      case '8':
        query = query.eq('pack_count', 8);
        break;
      case '12':
        query = query.eq('pack_count', 12);
        break;
    }
  }

  // Order by price per liter and recent scraping
  query = query
    .order('price_per_l_eur', { ascending: true, nullsFirst: false })
    .order('scraped_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  const totalPages = Math.ceil((count || 0) / pageSize);

  return {
    items: (data || []) as Price[],
    total: count || 0,
    page: currentPage,
    pageSize,
    totalPages
  };
}

export async function getBrandStats(brand: string): Promise<BrandPriceStats> {
  // Get prices grouped by retailer for this brand
  const { data: pricesData, error: pricesError } = await supabase
    .from('prices')
    .select(`
      retailer_id,
      price_per_l_eur,
      scraped_at,
      retailers!inner(name, slug)
    `)
    .ilike('brand', `%${brand}%`)
    .not('price_per_l_eur', 'is', null)
    .order('scraped_at', { ascending: false });

  if (pricesError) throw pricesError;

  if (!pricesData || pricesData.length === 0) {
    throw new Error('Brand not found');
  }

  // Group by retailer and calculate stats
  const retailerMap = new Map<string, {
    retailer: string;
    retailer_name: string;
    prices: number[];
    last_scraped: string;
  }>();

  pricesData.forEach(item => {
    const retailerId = item.retailer_id;
    const retailerSlug = (item.retailers as any).slug;
    const retailerName = (item.retailers as any).name;
    
    if (!retailerMap.has(retailerId)) {
      retailerMap.set(retailerId, {
        retailer: retailerSlug,
        retailer_name: retailerName,
        prices: [],
        last_scraped: item.scraped_at
      });
    }

    const retailerData = retailerMap.get(retailerId)!;
    retailerData.prices.push(item.price_per_l_eur);
    
    // Keep the most recent scraped_at
    if (item.scraped_at > retailerData.last_scraped) {
      retailerData.last_scraped = item.scraped_at;
    }
  });

  // Calculate statistics for each retailer
  const retailerPrices = Array.from(retailerMap.values()).map(retailerData => {
    const prices = retailerData.prices;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return {
      retailer: retailerData.retailer,
      retailer_name: retailerData.retailer_name,
      min_price_per_l: Number(minPrice.toFixed(4)),
      max_price_per_l: Number(maxPrice.toFixed(4)),
      avg_price_per_l: Number(avgPrice.toFixed(4)),
      last_scraped: retailerData.last_scraped,
      product_count: prices.length
    };
  });

  // Calculate overall statistics
  const allPrices = Array.from(retailerMap.values()).flatMap(r => r.prices);
  const sortedPrices = allPrices.sort((a, b) => a - b);
  const medianPrice = sortedPrices.length % 2 === 0
    ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
    : sortedPrices[Math.floor(sortedPrices.length / 2)];

  const overallStats = {
    min_price_per_l: Number(Math.min(...allPrices).toFixed(4)),
    max_price_per_l: Number(Math.max(...allPrices).toFixed(4)),
    avg_price_per_l: Number((allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length).toFixed(4)),
    median_price_per_l: Number(medianPrice.toFixed(4)),
    retailer_count: retailerMap.size,
    total_products: allPrices.length
  };

  return {
    brand,
    retailer_prices: retailerPrices,
    overall_stats: overallStats
  };
}

export async function getMedianStats(brand: string, days: number = 7): Promise<MedianPriceStats> {
  const periodDays = Math.min(days, 30);

  const { data, error } = await supabase
    .from('prices')
    .select(`
      retailer_id,
      price_per_l_eur,
      retailers!inner(name, slug)
    `)
    .ilike('brand', `%${brand}%`)
    .not('price_per_l_eur', 'is', null)
    .gte('scraped_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString());

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error('No data found for this brand');
  }

  // Group by retailer
  const retailerMap = new Map<string, {
    retailer: string;
    retailer_name: string;
    prices: number[];
  }>();

  data.forEach(item => {
    const retailerId = item.retailer_id;
    const retailerSlug = (item.retailers as any).slug;
    const retailerName = (item.retailers as any).name;

    if (!retailerMap.has(retailerId)) {
      retailerMap.set(retailerId, {
        retailer: retailerSlug,
        retailer_name: retailerName,
        prices: []
      });
    }

    retailerMap.get(retailerId)!.prices.push(item.price_per_l_eur);
  });

  // Calculate median for each retailer
  const retailerMedians = Array.from(retailerMap.values()).map(retailerData => {
    const sortedPrices = retailerData.prices.sort((a, b) => a - b);
    const median = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length / 2)];

    return {
      retailer: retailerData.retailer,
      retailer_name: retailerData.retailer_name,
      median_price_per_l: Number(median.toFixed(4)),
      sample_size: retailerData.prices.length
    };
  });

  return {
    brand,
    period_days: periodDays,
    retailer_medians: retailerMedians
  };
}
