/**
 * Product filtering rules for water bottle scraping
 * Ensures we only capture relevant water products and exclude off-topic items
 */

// Known water brands (case-insensitive matching)
const WATER_BRANDS = [
  'evian', 'évian', 'cristalline', 'cristaline', 'volvic', 'hépar', 'hepar',
  'contrex', 'vittel', 'perrier', 'badoit', 'mont roucous', 'saint-amand',
  'st amand', 'quézac', 'quezac', 'wattwiller', 'ozan', 'montcalm',
  'thonon', 'salvetat', 'rozana', 'arcens', 'vernière', 'abatilles',
  'carrefour', 'leclerc', 'auchan', 'monoprix', 'u', 'casino', 'intermarché',
  'franprix', 'cora', 'match', 'chronodrive', 'système u', 'marque u',
  'eau de source', 'eau minérale', 'source naturelle'
];

// Volume/pack patterns that indicate water bottles
const VOLUME_PATTERNS = [
  /\d+\s*[x×]\s*\d+\s*[cl|l]/i,           // "6x1.5L", "12×50cl"
  /\d+[\.,]\d+\s*[cl|l]/i,                // "1.5L", "50cl", "1,5l"
  /\d+\s*[cl|l]/i,                        // "1L", "50cl"
  /pack\s*\d+/i,                          // "pack 6"
  /lot\s*\d+/i,                           // "lot 6"
  /\d+\s*bouteilles?/i                    // "6 bouteilles"
];

// Terms that indicate flavored or non-plain water (to exclude)
const EXCLUDE_TERMS = [
  'aromatisé', 'aromatisée', 'saveur', 'goût', 'citron', 'lime', 'menthe',
  'fraise', 'pêche', 'orange', 'thé', 'infusion', 'boisson gazeuse',
  'soda', 'sirop', 'jus', 'cola', 'limonade', 'energy', 'sport',
  'machine sodastream', 'fontaine', 'carafe filtrante', 'bonbonne 19l',
  'distributeur', 'réservoir', 'glacière', 'frigo', 'bouchon sport'
];

// Terms that indicate uncertainty (flag for manual review)
const UNCERTAIN_TERMS = [
  'mélange', 'préparation', 'concentré', 'poudre', 'capsule',
  'recharge', 'cartouche', 'filtre'
];

export interface FilterResult {
  include: boolean;
  exclude: boolean;
  uncertain: boolean;
  reasons: string[];
}

/**
 * Filters a product title to determine if it's a valid water bottle product
 */
export function filterProduct(title: string, brand?: string): FilterResult {
  const titleLower = title.toLowerCase().trim();
  const reasons: string[] = [];
  
  let include = false;
  let exclude = false;
  let uncertain = false;

  // Check if title contains a known water brand
  const hasWaterBrand = WATER_BRANDS.some(waterBrand => {
    if (titleLower.includes(waterBrand.toLowerCase())) {
      reasons.push(`Contains water brand: ${waterBrand}`);
      return true;
    }
    return false;
  });

  // Check if title contains volume/pack patterns
  const hasVolumePattern = VOLUME_PATTERNS.some(pattern => {
    if (pattern.test(titleLower)) {
      reasons.push(`Contains volume pattern: ${pattern.source}`);
      return true;
    }
    return false;
  });

  // Check for basic water indicators (more lenient)
  const hasWaterIndicator = titleLower.includes('eau') || 
                           titleLower.includes('water') ||
                           titleLower.includes('minérale') ||
                           titleLower.includes('source') ||
                           titleLower.includes('plate') ||
                           titleLower.includes('gazeuse');

  // Include if has water brand OR volume pattern OR basic water indicator with volume
  if (hasWaterBrand || (hasVolumePattern && hasWaterIndicator) || hasVolumePattern) {
    include = true;
  }

  // Check for exclude terms
  const hasExcludeTerm = EXCLUDE_TERMS.some(term => {
    if (titleLower.includes(term.toLowerCase())) {
      reasons.push(`Contains exclude term: ${term}`);
      return true;
    }
    return false;
  });

  if (hasExcludeTerm) {
    exclude = true;
    include = false; // Override include
  }

  // Check for uncertain terms
  const hasUncertainTerm = UNCERTAIN_TERMS.some(term => {
    if (titleLower.includes(term.toLowerCase())) {
      reasons.push(`Contains uncertain term: ${term}`);
      return true;
    }
    return false;
  });

  if (hasUncertainTerm && !exclude) {
    uncertain = true;
  }

  // More lenient inclusion - if has volume pattern and basic water indicator, include
  if (hasVolumePattern && hasWaterIndicator && !exclude) {
    include = true;
    uncertain = false;
  }

  return {
    include: include && !exclude,
    exclude,
    uncertain: uncertain && !include && !exclude,
    reasons
  };
}

/**
 * Generates extended query combinations for water bottle scraping
 */
export function generateWaterQueries(): string[] {
  const brands = [
    'evian', 'évian', 'cristalline', 'cristaline', 'volvic', 'hépar', 'hepar',
    'contrex', 'vittel', 'perrier', 'badoit', 'mont roucous', 'saint-amand',
    'st amand', 'quézac', 'quezac', 'wattwiller', 'ozan', 'montcalm'
  ];

  const formatTokens = [
    '50cl', '50 cl', '0,5l', '0,5 l', '0.5l', '0.5 l',
    '1l', '1 l', '1,0l', '1,0 l', '1.0l', '1.0 l',
    '1,5l', '1,5 l', '1.5l', '1.5 l',
    '6x1,5l', '6x1,5 l', '6 x 1,5l', '6 x 1,5 l',
    '6x1l', '6x1 l', '6 x 1l', '6 x 1 l',
    '12x50cl', '12 x 50cl', '12x50 cl', '12 x 50 cl',
    'pack 6', 'lot 6', 'pack 12', 'lot 12',
    '9l', '9 l', '9,0l', '9,0 l'
  ];

  const queries = new Set<string>();

  // Brand + format combinations (limited to 6-8 per brand for performance)
  brands.forEach(brand => {
    // Brand only
    queries.add(brand);
    
    // Brand + most common formats (limit to 6)
    const commonFormats = formatTokens.slice(0, 6);
    commonFormats.forEach(format => {
      queries.add(`${brand} ${format}`);
    });
  });

  // Generic volume searches with normalization variants
  const genericFormats = [
    '50cl', '50 cl', '1l', '1 l', '1,5l', '1,5 l', '1.5l', '1.5 l',
    '6x1,5l', '6x1,5 l', '6 x 1,5l', '6 x 1,5 l'
  ];
  
  genericFormats.forEach(format => {
    queries.add(`eau ${format}`);
    queries.add(`eau minérale ${format}`);
  });

  // Generic searches
  queries.add('eau minérale');
  queries.add('eau de source');
  queries.add('eau plate');
  queries.add('eau gazeuse');
  queries.add('bouteille eau');
  queries.add('bouteilles eau');

  return Array.from(queries);
}

export { WATER_BRANDS, VOLUME_PATTERNS, EXCLUDE_TERMS, UNCERTAIN_TERMS };