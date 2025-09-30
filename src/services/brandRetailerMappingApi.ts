import { supabase } from '@/integrations/supabase/client';

export interface BrandRetailerMapping {
  id: string;
  brand_name: string;
  retailer_id: string;
  retailer_name?: string;
  is_available: boolean;
  price_position?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

/**
 * Récupère le mapping marques-enseignes avec les noms des enseignes
 */
export const getBrandRetailerMapping = async (): Promise<BrandRetailerMapping[]> => {
  const { data, error } = await supabase
    .from('brand_retailer_mapping')
    .select(`
      *,
      retailers!inner(
        name,
        slug,
        status
      )
    `)
    .eq('is_available', true)
    .eq('retailers.status', 'active')
    .order('brand_name');

  if (error) throw error;

  // Sort by retailer name in JavaScript since PostgREST doesn't support nested ordering
  const sortedData = data?.sort((a, b) => {
    if (a.retailers?.name && b.retailers?.name) {
      return a.retailers.name.localeCompare(b.retailers.name);
    }
    return 0;
  });

  return sortedData?.map(item => ({
    ...item,
    retailer_name: item.retailers?.name
  })) as BrandRetailerMapping[];
};

/**
 * Récupère les marques disponibles pour un retailer spécifique
 */
export const getBrandsForRetailer = async (retailerId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('brand_retailer_mapping')
    .select('brand_name')
    .eq('retailer_id', retailerId)
    .eq('is_available', true)
    .order('brand_name');

  if (error) throw error;

  return data.map(item => item.brand_name);
};

/**
 * Récupère les enseignes où une marque est disponible
 */
export const getRetailersForBrand = async (brandName: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('brand_retailer_mapping')
    .select(`
      *,
      retailers!inner(
        id,
        name,
        slug,
        domain,
        status
      )
    `)
    .ilike('brand_name', brandName)
    .eq('is_available', true)
    .eq('retailers.status', 'active')
    .order('retailers.name');

  if (error) throw error;

  return data.map(item => ({
    ...item.retailers,
    price_position: item.price_position
  }));
};