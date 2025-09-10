import type { Price } from '@/types/pricing';

export interface QualityIssue {
  type: 'outlier_price' | 'invalid_format' | 'unknown_brand';
  severity: 'high' | 'medium' | 'low';
  message: string;
  value?: string | number;
  expected?: string;
  price_id?: string;
}

export interface QualityReport {
  outliers_count: number;
  unknown_brands_count: number;
  invalid_formats_count: number;
  quality_score: number;
  issues: QualityIssue[];
}

const KNOWN_BRANDS = new Set([
  'evian', 'cristaline', 'volvic', 'hepar', 'hépar', 'contrex', 'vittel', 
  'badoit', 'perrier', 'saint-amand', 'st-amand', 'mont roucous', 
  'mont-roucous', 'quezac', 'quézac', 'wattwiller', 'thonon', 'spa',
  'fiji', 'san pellegrino', 'san-pellegrino', 'acqua panna', 'acqua-panna'
]);

const VALID_VOLUMES = [0.33, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 5, 6, 7.5, 9, 12, 18, 24];

/**
 * Check if a price per liter is within plausible range
 */
export function isPriceOutlier(pricePerL: number | null): boolean {
  if (!pricePerL || pricePerL <= 0) return true;
  return pricePerL < 0.05 || pricePerL > 5.00;
}

/**
 * Check if a volume format is plausible
 */
export function isValidVolume(volume: number | null): boolean {
  if (!volume || volume <= 0) return false;
  
  // Allow ±7% tolerance for valid volumes
  return VALID_VOLUMES.some(valid => 
    Math.abs(volume - valid) / valid <= 0.07
  );
}

/**
 * Check if a brand is recognized
 */
export function isKnownBrand(brand: string): boolean {
  if (!brand) return false;
  return KNOWN_BRANDS.has(brand.toLowerCase().trim());
}

/**
 * Normalize brand for recognition (remove accents, common variations)
 */
export function normalizeBrand(brand: string): string {
  if (!brand) return 'Inconnu';
  
  const normalized = brand
    .toLowerCase()
    .trim()
    .replace(/[àáâã]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõ]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[\s-_.]+/g, ' ');

  return isKnownBrand(normalized) ? normalized : 'Inconnu';
}

/**
 * Analyze quality issues in a batch of prices
 */
export function analyzeQuality(prices: Price[]): QualityReport {
  const issues: QualityIssue[] = [];
  let outliers = 0;
  let unknownBrands = 0;
  let invalidFormats = 0;

  for (const price of prices) {
    // Check price outliers
    if (isPriceOutlier(price.price_per_l_eur)) {
      outliers++;
      issues.push({
        type: 'outlier_price',
        severity: 'high',
        message: `Prix/L suspect: ${price.price_per_l_eur}€`,
        value: price.price_per_l_eur || 0,
        expected: '0.05€ - 5.00€',
        price_id: price.id
      });
    }

    // Check volume formats
    if (!isValidVolume(price.total_volume_l)) {
      invalidFormats++;
      issues.push({
        type: 'invalid_format',
        severity: 'medium',
        message: `Volume atypique: ${price.total_volume_l}L`,
        value: price.total_volume_l || 0,
        expected: 'Volumes standards: 0.33, 0.5, 1, 1.5, 2L...',
        price_id: price.id
      });
    }

    // Check unknown brands
    if (!isKnownBrand(price.brand)) {
      unknownBrands++;
      issues.push({
        type: 'unknown_brand',
        severity: 'low',
        message: `Marque inconnue: ${price.brand}`,
        value: price.brand,
        expected: 'Marques connues du catalogue',
        price_id: price.id
      });
    }
  }

  // Calculate quality score (0-1)
  const totalIssues = outliers + unknownBrands + invalidFormats;
  const totalPrices = prices.length;
  const qualityScore = totalPrices > 0 
    ? Math.max(0, 1 - (totalIssues / totalPrices))
    : 1;

  return {
    outliers_count: outliers,
    unknown_brands_count: unknownBrands,
    invalid_formats_count: invalidFormats,
    quality_score: Math.round(qualityScore * 100) / 100,
    issues: issues.slice(0, 100) // Limit to first 100 issues
  };
}

/**
 * Check if a run should be flagged for quality issues
 */
export function shouldFlagRun(report: QualityReport, totalItems: number): boolean {
  return (
    totalItems === 0 ||
    report.quality_score < 0.7 ||
    report.outliers_count > Math.max(5, totalItems * 0.1)
  );
}