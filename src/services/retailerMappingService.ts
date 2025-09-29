import { supabase } from '@/integrations/supabase/client';
import { createServiceClient } from '@/integrations/supabase/serviceClient';

/**
 * Service pour gérer le mapping des retailers et améliorer le système de scraping
 */

export interface RetailerMapping {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: string;
}

/**
 * Récupère le mapping complet des retailers
 */
export async function getRetailerMapping(): Promise<Map<string, RetailerMapping>> {
  const { data, error } = await supabase
    .from('retailers')
    .select('id, name, slug, domain, status')
    .eq('status', 'active');

  if (error) throw error;

  const mapping = new Map<string, RetailerMapping>();
  
  data.forEach(retailer => {
    // Mappage par slug
    mapping.set(retailer.slug, retailer);
    
    // Mappage par nom normalisé
    const normalizedName = retailer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    mapping.set(normalizedName, retailer);
    
    // Mappage par domaine
    if (retailer.domain) {
      mapping.set(retailer.domain.replace('www.', ''), retailer);
    }
  });

  return mapping;
}

/**
 * Résout un retailer ID à partir de différents identifiants
 */
export async function resolveRetailerId(identifier: string): Promise<string | null> {
  const mapping = await getRetailerMapping();
  
  // Essai direct avec l'identifiant
  const direct = mapping.get(identifier);
  if (direct) return direct.id;
  
  // Essai avec normalisation
  const normalized = identifier.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const normalized_result = mapping.get(normalized);
  if (normalized_result) return normalized_result.id;
  
  // Essai par domaine si c'est une URL
  try {
    const url = new URL(identifier);
    const domain = url.hostname.replace('www.', '');
    const domain_result = mapping.get(domain);
    if (domain_result) return domain_result.id;
  } catch {
    // Ce n'est pas une URL valide, ignorer
  }
  
  return null;
}

/**
 * Met à jour les retailer_id incorrects dans prices_history
 * Cette fonction doit être exécutée côté serveur (edge function)
 */
export async function fixRetailerIds() {
  const supabaseService = createServiceClient();
  
  // Récupérer tous les prix avec des UUIDs génériques
  const { data: prices, error: pricesError } = await supabaseService
    .from('prices_history')
    .select('id, retailer_id, sku, url, unique_hash')
    .like('retailer_id', '%1111111%'); // UUIDs génériques

  if (pricesError) throw pricesError;

  const mapping = await getRetailerMapping();
  let updatedCount = 0;

  for (const price of prices || []) {
    let correctRetailerId: string | null = null;
    
    // Tentative de résolution par SKU
    if (price.sku) {
      const skuPrefix = price.sku.split('_')[0]?.toLowerCase();
      correctRetailerId = await resolveRetailerId(skuPrefix);
    }
    
    // Tentative par unique_hash
    if (!correctRetailerId && price.unique_hash) {
      const hashPrefix = price.unique_hash.split('-')[0]?.toLowerCase();
      correctRetailerId = await resolveRetailerId(hashPrefix);
    }
    
    // Tentative par URL
    if (!correctRetailerId && price.url) {
      correctRetailerId = await resolveRetailerId(price.url);
    }
    
    // Mettre à jour si trouvé
    if (correctRetailerId && correctRetailerId !== price.retailer_id) {
      const { error: updateError } = await supabaseService
        .from('prices_history')
        .update({ retailer_id: correctRetailerId })
        .eq('id', price.id);
      
      if (!updateError) {
        updatedCount++;
      }
    }
  }
  
  return { updatedCount, totalProcessed: prices?.length || 0 };
}

/**
 * Valide la cohérence du mapping marques-enseignes
 */
export async function validateBrandRetailerConsistency() {
  const { data: mappings, error: mappingError } = await supabase
    .from('brand_retailer_mapping')
    .select(`
      brand_name,
      retailer_id,
      retailers!inner(name, status)
    `)
    .eq('is_available', true);

  if (mappingError) throw mappingError;

  const { data: actualPrices, error: pricesError } = await supabase
    .from('prices_history')
    .select('DISTINCT brand, retailer_id')
    .not('brand', 'is', null)
    .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 derniers jours

  if (pricesError) throw pricesError;

  const actualCombinations = new Set(
    actualPrices?.map(p => `${p.brand}|${p.retailer_id}`) || []
  );
  
  const mappedCombinations = new Set(
    mappings?.map(m => `${m.brand_name}|${m.retailer_id}`) || []
  );

  const missingMappings = Array.from(actualCombinations).filter(
    combo => !mappedCombinations.has(combo)
  );

  const unusedMappings = Array.from(mappedCombinations).filter(
    combo => !actualCombinations.has(combo)
  );

  return {
    missingMappings: missingMappings.map(combo => {
      const [brand, retailerId] = combo.split('|');
      return { brand, retailerId };
    }),
    unusedMappings: unusedMappings.map(combo => {
      const [brand, retailerId] = combo.split('|');
      return { brand, retailerId };
    }),
    totalMappings: mappings?.length || 0,
    totalActualCombinations: actualCombinations.size
  };
}