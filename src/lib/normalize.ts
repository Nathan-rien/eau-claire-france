import CryptoJS from 'crypto-js';

export interface ParsedFormat {
  pack_count: number | null;
  unit_volume_l: number | null;
  total_volume_l: number | null;
}

export interface ScrapedItem {
  product_name: string;
  price_total_eur: number | null;
  price_per_l_eur: number | null;
  url: string;
  sku?: string | null;
  is_promo?: boolean;
  promo_label?: string | null;
  availability?: "in_stock" | "out_of_stock" | null;
  image_url?: string | null;
}

export interface NormalizedPrice {
  brand: string;
  product_name: string;
  pack_count: number | null;
  unit_volume_l: number | null;
  total_volume_l: number | null;
  price_total_eur: number | null;
  price_per_l_eur: number | null;
  is_promo: boolean;
  promo_label: string | null;
  availability: string;
  sku: string | null;
  url: string;
  image_url: string | null;
  unique_hash: string;
}

// Marques cibles avec variantes et synonymes
const BRAND_MAPPING: Record<string, string[]> = {
  'Evian': ['evian', 'évian'],
  'Volvic': ['volvic'],
  'Cristaline': ['cristaline', 'cristalline'],
  'Hépar': ['hepar', 'hépar'],
  'Contrex': ['contrex'],
  'Vittel': ['vittel'],
  'Badoit': ['badoit'],
  'Perrier': ['perrier'],
  'Saint-Amand': ['saint-amand', 'saint amand', 'st-amand'],
  'Mont Roucous': ['mont roucous', 'montroucous'],
  'Quézac': ['quezac', 'quézac'],
  'Salvetat': ['salvetat', 'la salvetat'],
  'Nestlé': ['nestle', 'nestlé'],
  'Carrefour': ['carrefour'],
  'Leclerc': ['leclerc', 'e.leclerc', 'e-leclerc'],
  'Intermarché': ['intermarche', 'intermarché'],
  'U': ['marque u', 'u', 'système u'],
  'Casino': ['casino'],
  'Monoprix': ['monoprix'],
};

/**
 * Parse le format d'un produit (pack x volume)
 * Gère "2x6x50cl", "6x1,5 l", "1 l", "12 x 1 l", et ignore "+ 2 offertes"
 */
export function parseFormat(productName: string): ParsedFormat {
  const name = productName.toLowerCase().trim();
  
  // Ignore les bonus/offres
  const cleanName = name.replace(/\+\s*\d+\s*(offerte?s?|gratuite?s?)/gi, '');
  
  // Pattern pour format complexe : "9 L (6x1,5 L)" ou "9L (6x1,5L)"
  const complexPattern = /(\d*[.,]?\d+)\s*l\s*\(\s*(\d+)\s*[x×]\s*(\d*[.,]?\d+)\s*l\s*\)/i;
  const complexMatch = cleanName.match(complexPattern);
  
  if (complexMatch) {
    const packCount = parseInt(complexMatch[2]);
    const unitVolume = parseFloat(complexMatch[3].replace(',', '.'));
    const totalVolume = parseFloat(complexMatch[1].replace(',', '.'));
    
    return {
      pack_count: packCount,
      unit_volume_l: unitVolume,
      total_volume_l: totalVolume
    };
  }
  
  // Pattern pour format imbriqué : 2x6x50cl
  const nestedPattern = /(\d+)\s*[x×]\s*(\d+)\s*[x×]\s*(\d*[.,]?\d+)\s*(l|cl)\b/i;
  const nestedMatch = cleanName.match(nestedPattern);
  
  if (nestedMatch) {
    const multiplier = parseInt(nestedMatch[1]);
    const packCount = parseInt(nestedMatch[2]);
    const volume = parseFloat(nestedMatch[3].replace(',', '.'));
    const unit = nestedMatch[4].toLowerCase();
    
    const volumeInL = unit === 'cl' ? volume / 100 : volume;
    const totalPacks = multiplier * packCount;
    
    return {
      pack_count: totalPacks,
      unit_volume_l: volumeInL,
      total_volume_l: totalPacks * volumeInL
    };
  }
  
  // Pattern inversé : "1.5L x6" ou "1,5L x 6"
  const reversedPattern = /(\d*[.,]?\d+)\s*(l|cl)\s*[x×]\s*(\d+)/i;
  const reversedMatch = cleanName.match(reversedPattern);
  
  if (reversedMatch) {
    const volume = parseFloat(reversedMatch[1].replace(',', '.'));
    const unit = reversedMatch[2].toLowerCase();
    const packCount = parseInt(reversedMatch[3]);
    
    const volumeInL = unit === 'cl' ? volume / 100 : volume;
    
    return {
      pack_count: packCount,
      unit_volume_l: volumeInL,
      total_volume_l: packCount * volumeInL
    };
  }
  
  // Pattern principal : 6x1,5L, 12 x 50cl, etc.
  const mainPattern = /(\d+)\s*[x×]\s*(\d*[.,]?\d+)\s*(l|cl)\b/i;
  const mainMatch = cleanName.match(mainPattern);
  
  if (mainMatch) {
    const packCount = parseInt(mainMatch[1]);
    const volume = parseFloat(mainMatch[2].replace(',', '.'));
    const unit = mainMatch[3].toLowerCase();
    
    const volumeInL = unit === 'cl' ? volume / 100 : volume;
    
    return {
      pack_count: packCount,
      unit_volume_l: volumeInL,
      total_volume_l: packCount * volumeInL
    };
  }
  
  // Pattern avec virgule française : "1,5 L", "1,0 L"
  const frenchPattern = /(\d+[.,]\d+)\s*(l|cl)\b/i;
  const frenchMatch = cleanName.match(frenchPattern);
  
  if (frenchMatch) {
    const volume = parseFloat(frenchMatch[1].replace(',', '.'));
    const unit = frenchMatch[2].toLowerCase();
    
    const volumeInL = unit === 'cl' ? volume / 100 : volume;
    
    return {
      pack_count: 1,
      unit_volume_l: volumeInL,
      total_volume_l: volumeInL
    };
  }
  
  // Pattern secondaire : volume simple (1.5L, 50cl, 1L)
  const simplePattern = /(\d*[.,]?\d+)\s*(l|cl)\b/i;
  const simpleMatch = cleanName.match(simplePattern);
  
  if (simpleMatch) {
    const volume = parseFloat(simpleMatch[1].replace(',', '.'));
    const unit = simpleMatch[2].toLowerCase();
    
    const volumeInL = unit === 'cl' ? volume / 100 : volume;
    
    return {
      pack_count: 1,
      unit_volume_l: volumeInL,
      total_volume_l: volumeInL
    };
  }
  
  return {
    pack_count: null,
    unit_volume_l: null,
    total_volume_l: null
  };
}

/**
 * Devine la marque à partir du nom du produit
 */
export function guessBrand(productName: string): string | null {
  const name = productName.toLowerCase()
    .replace(/\b(eau|pack|lot|source|minérale|naturelle|gazeuse|plate)\b/g, '')
    .trim();
  
  for (const [brand, variants] of Object.entries(BRAND_MAPPING)) {
    for (const variant of variants) {
      if (name.includes(variant.toLowerCase())) {
        return brand;
      }
    }
  }
  
  // Check for MDD brands by retailer indicators
  if (name.includes('carrefour')) return 'Carrefour';
  if (name.includes('leclerc') || name.includes('e.leclerc')) return 'Leclerc';
  if (name.includes('intermarché') || name.includes('intermarche')) return 'Intermarché';
  if (name.includes('auchan')) return 'Auchan';
  if (name.includes('monoprix')) return 'Monoprix';
  if (name.includes('casino')) return 'Casino';
  if (name.includes('système u') || name.includes('marque u')) return 'U';
  
  return null;
}

/**
 * Calcule le prix au litre
 */
export function computePricePerL(priceTotal: number, totalVolumeL: number): number | null {
  if (!priceTotal || !totalVolumeL || totalVolumeL <= 0) {
    return null;
  }
  
  return Math.round((priceTotal / totalVolumeL) * 10000) / 10000; // 4 décimales
}

/**
 * Calcule le prix au litre en fallback si manquant
 */
export function computeFallbackPricePerL(price: { price_total_eur?: number | null, total_volume_l?: number | null, price_per_l_eur?: number | null }): number | null {
  // Si le prix au litre existe déjà, le retourner
  if (price.price_per_l_eur) {
    return price.price_per_l_eur;
  }
  
  // Sinon, calculer en fallback si possible
  if (price.price_total_eur && price.total_volume_l && price.total_volume_l > 0) {
    return computePricePerL(price.price_total_eur, price.total_volume_l);
  }
  
  return null;
}

/**
 * Parse un prix depuis un texte (ex: "4,98 €", "€ 2.50", "1 23€", "1.23€")
 */
export function parsePrice(priceText: string): number | null {
  if (!priceText) return null;
  
  // Normalise les espaces (supprime espaces fines/insécables)
  let cleaned = priceText.replace(/[\u00A0\u2000-\u200B\u2028\u2029]/g, ' ').trim();
  
  // Patterns pour différents formats de prix
  const patterns = [
    /(\d+[\s,.]?\d*)\s*€/,           // "1,23 €", "1.23€", "1 23€"
    /€\s*(\d+[\s,.]?\d*)/,           // "€ 1,23", "€1.23"
    /(\d+[\s,.]?\d*)\s*eur/i,        // "1,23 eur"
    /(\d+[\s,.]?\d*)/                // fallback: juste le nombre
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let priceStr = match[1].replace(/\s/g, ''); // supprime espaces dans "1 23"
      priceStr = priceStr.replace(',', '.'); // virgule française -> point
      const price = parseFloat(priceStr);
      
      if (!isNaN(price) && price > 0) {
        return Math.round(price * 100) / 100; // 2 décimales
      }
    }
  }
  
  return null;
}

/**
 * Génère un hash unique pour identifier un produit
 */
export function generateUniqueHash(
  retailerSlug: string,
  sku: string | null,
  productName: string,
  totalVolumeL: number | null,
  packCount: number | null,
  url: string | null,
  scrapedDate: string
): string {
  const normalizedName = productName.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // More specific identifier to avoid duplicate detection between different formats
  let identifier = sku;
  if (!identifier && url) {
    // Use normalized URL without tracking parameters
    const cleanUrl = url.split('?')[0].split('#')[0];
    identifier = cleanUrl;
  }
  if (!identifier) {
    identifier = normalizedName;
  }
  
  const dateOnly = scrapedDate.split('T')[0]; // Garde seulement la date YYYY-MM-DD
  
  // Include pack count and volume to differentiate formats
  const input = `${retailerSlug}|${identifier}|${normalizedName}|${totalVolumeL || 0}|${packCount || 1}|${dateOnly}`;
  
  return CryptoJS.SHA256(input).toString();
}

/**
 * Détermine la disponibilité à partir des indicateurs DOM
 */
export function determineAvailability(hasAddToCartButton: boolean, outOfStockText?: string): string {
  if (outOfStockText && outOfStockText.toLowerCase().includes('stock')) {
    return 'out_of_stock';
  }
  
  return hasAddToCartButton ? 'in_stock' : 'unknown';
}

/**
 * Normalise un produit scrapé complet
 */
export function computeNormalized(product: {
  title: string;
  price_text: string;
  url: string;
  sku?: string | null;
  is_promo?: boolean;
  promo_label?: string | null;
  availability?: string | null;
  image_url?: string | null;
}, retailerSlug: string, scrapedAt: string): NormalizedPrice {
  
  const format = parseFormat(product.title);
  let brand = guessBrand(product.title);
  
  if (!brand) {
    brand = 'Inconnu';
  }
  
  // Parse le prix depuis le texte
  const priceTotal = parsePrice(product.price_text);
  
  // Calcule le prix au litre
  let pricePerL: number | null = null;
  if (priceTotal && format.total_volume_l && format.total_volume_l > 0) {
    pricePerL = computePricePerL(priceTotal, format.total_volume_l);
  }
  
  const uniqueHash = generateUniqueHash(
    retailerSlug,
    product.sku,
    product.title,
    format.total_volume_l,
    format.pack_count,
    product.url,
    scrapedAt
  );
  
  return {
    brand,
    product_name: product.title,
    pack_count: format.pack_count,
    unit_volume_l: format.unit_volume_l,
    total_volume_l: format.total_volume_l,
    price_total_eur: priceTotal,
    price_per_l_eur: pricePerL,
    is_promo: product.is_promo || false,
    promo_label: product.promo_label || null,
    availability: product.availability || 'unknown',
    sku: product.sku || null,
    url: product.url,
    image_url: product.image_url || null,
    unique_hash: uniqueHash
  };
}

/**
 * Normalise un produit scrapé (fonction legacy maintenue pour compatibilité)
 */
export function normalizeScrapedItem(
  item: ScrapedItem,
  retailerSlug: string,
  scrapedAt: string
): NormalizedPrice {
  return computeNormalized({
    title: item.product_name,
    price_text: item.price_total_eur?.toString() || '',
    url: item.url,
    sku: item.sku,
    is_promo: item.is_promo,
    promo_label: item.promo_label,
    availability: item.availability || undefined,
    image_url: item.image_url
  }, retailerSlug, scrapedAt);
}