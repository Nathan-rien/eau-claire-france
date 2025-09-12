import { supabase } from '@/integrations/supabase/client';

// Database stats service
export interface DataStats {
  hasPrices: boolean;
  totalPrices: number;
  lastScrapeAt?: string;
}

export const hasData = async (): Promise<DataStats> => {
  const { data, error } = await supabase.functions.invoke('debug-health');
  if (error) throw error;
  const stats = data as any;
  return {
    hasPrices: (stats?.prices_count || 0) > 0,
    totalPrices: stats?.prices_count || 0,
    lastScrapeAt: stats?.last_scraped_at || undefined,
  };
};

export const listDistinctBrands = async (): Promise<string[]> => {
  const { data, error } = await supabase.functions.invoke('debug-brands');
  if (error) throw error;
  return (data as string[]) || [];
};

export const listActiveRetailers = async () => {
  const { data, error } = await supabase.functions.invoke('debug-retailers');
  if (error) throw error;
  return (data as any[]) || [];
};