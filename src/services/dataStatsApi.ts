import { supabase } from '@/integrations/supabase/client';

// Database stats service
export interface DataStats {
  hasPrices: boolean;
  totalPrices: number;
  lastScrapeAt?: string;
}

export const hasData = async (): Promise<DataStats> => {
  const { data, error } = await supabase
    .from('prices')
    .select('scraped_at', { count: 'exact' })
    .order('scraped_at', { ascending: false })
    .limit(1);

  if (error) throw error;

  const count = data?.length || 0;
  const hasPrices = count > 0;
  const lastScrapeAt = hasPrices && data?.[0]?.scraped_at ? data[0].scraped_at : undefined;

  // Get total count
  const { count: totalCount } = await supabase
    .from('prices')
    .select('*', { count: 'exact', head: true });

  return {
    hasPrices,
    totalPrices: totalCount || 0,
    lastScrapeAt
  };
};

export const listDistinctBrands = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('prices')
    .select('brand')
    .not('brand', 'is', null)
    .neq('brand', 'Inconnu')
    .order('brand');

  if (error) throw error;
  
  // Remove duplicates and normalize case insensitive sorting
  const uniqueBrands = [...new Set(data.map(item => item.brand))]
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  
  return uniqueBrands;
};

export const listActiveRetailers = async () => {
  const { data, error } = await supabase
    .from('retailers')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) throw error;
  return data || [];
};