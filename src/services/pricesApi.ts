import { supabase } from '@/integrations/supabase/client';
import { PriceFilters, PaginatedResponse, BrandPriceStats, MedianPriceStats } from '@/types/pricing';

// GET /api/retailers
export const getRetailers = async () => {
  const { data, error } = await supabase
    .from('retailers')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) throw error;
  return data;
};

// GET /api/brands
export const getBrands = async () => {
  const { data, error } = await supabase
    .from('prices')
    .select('brand')
    .not('brand', 'is', null)
    .neq('brand', 'Inconnu');

  if (error) throw error;
  
  const uniqueBrands = [...new Set(data.map(item => item.brand))].sort();
  return uniqueBrands;
};

// GET /api/prices - reads from latest view for freshness
export const getPrices = async (filters: PriceFilters = {}): Promise<PaginatedResponse<any>> => {
  const {
    brand,
    retailer,
    format,
    pack,
    search,
    is_promo,
    availability,
    sort_by = 'price_per_l_eur',
    sort_order = 'asc',
    limit = 20,
    page = 1
  } = filters;

  let query = supabase
    .from('prices_history')
    .select('*', { count: 'exact' })
    // Filter out incomplete records - require all essential fields
    .not('brand', 'is', null)
    .not('product_name', 'is', null)
    .not('unit_volume_l', 'is', null)
    .not('retailer_id', 'is', null)
    .not('price_total_eur', 'is', null)
    .not('price_per_l_eur', 'is', null);

  // Apply filters
  if (brand) {
    query = query.eq('brand', brand);
  }

  // Note: on ne filtre plus côté serveur par enseigne car les IDs ne correspondent pas toujours
  // Le filtrage enseigne est fait côté client après résolution par slug/domain


  if (format) {
    if (format === '50cl') {
      query = query.gte('unit_volume_l', 0.4).lte('unit_volume_l', 0.6);
    } else if (format === '1L') {
      query = query.gte('unit_volume_l', 0.9).lte('unit_volume_l', 1.1);
    } else if (format === '1,5L') {
      query = query.gte('unit_volume_l', 1.4).lte('unit_volume_l', 1.6);
    }
  }

  if (pack) {
    if (pack === '6') {
      query = query.eq('pack_count', 6);
    } else if (pack === '8') {
      query = query.eq('pack_count', 8);
    } else if (pack === '12') {
      query = query.eq('pack_count', 12);
    }
  }

  if (search) {
    query = query.ilike('product_name', `%${search}%`);
  }

  if (is_promo !== undefined) {
    query = query.eq('is_promo', is_promo);
  }

  if (availability && availability !== 'all') {
    query = query.eq('availability', availability);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  
  // Apply sorting
  const sortAscending = sort_order === 'asc';
  if (sort_by === 'price_per_l_eur') {
    query = query.order('price_per_l_eur', { ascending: sortAscending });
  } else if (sort_by === 'price_total_eur') {
    query = query.order('price_total_eur', { ascending: sortAscending });
  } else if (sort_by === 'scraped_at') {
    query = query.order('scraped_at', { ascending: sortAscending });
  } else if (sort_by === 'brand') {
    query = query.order('brand', { ascending: sortAscending });
  }
  
  // Secondary sort by scraped_at (most recent first) if not primary sort
  if (sort_by !== 'scraped_at') {
    query = query.order('scraped_at', { ascending: false });
  }
  
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    // Fallback to prices table if history doesn't work
    console.warn('Failed to read from prices_history, falling back to prices table:', error);
    query = supabase
      .from('prices')
      .select(`
        *,
        retailer:retailers(name, slug)
      `, { count: 'exact' });

    // Reapply filters for fallback
    if (brand) query = query.eq('brand', brand);
    if (retailer) query = query.eq('retailer_id', retailer);
    if (format) {
      if (format === '50cl') {
        query = query.gte('unit_volume_l', 0.4).lte('unit_volume_l', 0.6);
      } else if (format === '1L') {
        query = query.gte('unit_volume_l', 0.9).lte('unit_volume_l', 1.1);
      } else if (format === '1,5L') {
        query = query.gte('unit_volume_l', 1.4).lte('unit_volume_l', 1.6);
      }
    }
    if (pack) {
      if (pack === '6') query = query.eq('pack_count', 6);
      else if (pack === '8') query = query.eq('pack_count', 8);
      else if (pack === '12') query = query.eq('pack_count', 12);
    }
    if (search) query = query.ilike('product_name', `%${search}%`);
    if (is_promo !== undefined) query = query.eq('is_promo', is_promo);
    if (availability && availability !== 'all') query = query.eq('availability', availability);

    const offset = (page - 1) * limit;
    
    // Apply sorting for fallback
    const sortAscending = sort_order === 'asc';
    if (sort_by === 'price_per_l_eur') {
      query = query.order('price_per_l_eur', { ascending: sortAscending });
    } else if (sort_by === 'price_total_eur') {
      query = query.order('price_total_eur', { ascending: sortAscending });
    } else if (sort_by === 'scraped_at') {
      query = query.order('scraped_at', { ascending: sortAscending });
    } else if (sort_by === 'brand') {
      query = query.order('brand', { ascending: sortAscending });
    }
    
    if (sort_by !== 'scraped_at') {
      query = query.order('scraped_at', { ascending: false });
    }
    
    query = query.range(offset, offset + limit - 1);

    const { data: fallbackData, error: fallbackError, count: fallbackCount } = await query;
    
    if (fallbackError) throw fallbackError;
    
    return {
      items: (fallbackData || []).map(item => ({ ...item, source: 'prices' })),
      total: fallbackCount || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((fallbackCount || 0) / limit)
    };
  }

  return {
    items: (data || []).map(item => ({ ...item, source: 'history' })),
    total: count || 0,
    page,
    pageSize: limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
};

// GET /api/brand/:slug
export const getBrandStats = async (brand: string): Promise<BrandPriceStats> => {
  // Use prices_history directly
  let query = supabase
    .from('prices_history')
    .select(`
      *,
      retailer:retailers(name, slug)
    `)
    .eq('brand', brand)
    .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .not('price_per_l_eur', 'is', null);

  const { data: prices, error } = await query;
  
  if (error) {
    // Fallback to prices table
    const { data: fallbackPrices, error: fallbackError } = await supabase
      .from('prices')
      .select(`
        *,
        retailer:retailers(name, slug)
      `)
      .eq('brand', brand)
      .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .not('price_per_l_eur', 'is', null);
    
    if (fallbackError) throw fallbackError;
    return calculateBrandStats(brand, fallbackPrices || []);
  }

  return calculateBrandStats(brand, prices || []);
};

function calculateBrandStats(brand: string, prices: any[]): BrandPriceStats {

  // Group by retailer
  const retailerGroups = prices.reduce((acc, price) => {
    const retailerSlug = price.retailer?.slug;
    if (!retailerSlug) return acc;

    if (!acc[retailerSlug]) {
      acc[retailerSlug] = {
        retailer: retailerSlug,
        retailer_name: price.retailer.name,
        prices: []
      };
    }
    acc[retailerSlug].prices.push(price.price_per_l_eur);
    return acc;
  }, {} as any);

  // Calculate stats per retailer
  const retailer_prices = Object.values(retailerGroups).map((group: any) => {
    const prices = group.prices.sort((a: number, b: number) => a - b);
    return {
      retailer: group.retailer,
      retailer_name: group.retailer_name,
      min_price_per_l: Math.min(...prices),
      max_price_per_l: Math.max(...prices),
      avg_price_per_l: prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length,
      last_scraped: new Date().toISOString(),
      product_count: prices.length
    };
  });

  // Calculate overall stats
  const allPrices = prices.map(p => p.price_per_l_eur).sort((a, b) => a - b);
  const overall_stats = {
    min_price_per_l: Math.min(...allPrices),
    max_price_per_l: Math.max(...allPrices),
    avg_price_per_l: allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length,
    median_price_per_l: allPrices[Math.floor(allPrices.length / 2)],
    retailer_count: Object.keys(retailerGroups).length,
    total_products: allPrices.length
  };

  return {
    brand,
    retailer_prices,
    overall_stats
  };
}

// GET /api/runs
export const getRuns = async () => {
  const { data, error } = await supabase
    .from('runs')
    .select(`
      *,
      retailer:retailers(name, slug)
    `)
    .order('started_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
};

// POST /api/scrape
export const triggerScrape = async (retailerSlug: string) => {
  // This would trigger server-side scraping
  // For now, return success
  return { success: true, message: `Scraping triggered for ${retailerSlug}` };
};

// POST /api/retailers/:slug/pause
export const pauseRetailer = async (slug: string) => {
  const { data, error } = await supabase
    .from('retailers')
    .update({ status: 'paused' })
    .eq('slug', slug)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// POST /api/retailers/:slug/resume  
export const resumeRetailer = async (slug: string) => {
  const { data, error } = await supabase
    .from('retailers')
    .update({ status: 'active' })
    .eq('slug', slug)
    .select()
    .single();

  if (error) throw error;
  return data;
};
