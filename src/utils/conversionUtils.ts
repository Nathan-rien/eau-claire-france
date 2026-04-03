import type { BottleWaterData } from '@/types/bottleTypes';
import { WaterData } from '@/data/bottleWaterData';

/**
 * Conversion utilities for bottle water data
 * Centralizes all conversion logic to avoid duplication
 */

export interface ConversionResult<T> {
  value: T;
  isValid: boolean;
  error?: string;
}

/**
 * Convert mg/L values to g/L
 */
export const mgToG = (value: number): number => value / 1000;

/**
 * Convert g/L values to mg/L
 */
export const gToMg = (value: number): number => value * 1000;

/**
 * Safely convert string to number with validation
 */
export const safeParseNumber = (value: unknown, fallback: number = 0): ConversionResult<number> => {
  if (typeof value === 'number' && !isNaN(value)) {
    return { value, isValid: true };
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return { value: parsed, isValid: true };
    }
  }
  
  return { 
    value: fallback, 
    isValid: false, 
    error: `Invalid number: ${value}` 
  };
};

/**
 * Normalize bottle name for display
 */
export const normalizeBottleName = (marque: string, nomBouteille: string): string => {
  return marque === nomBouteille ? marque : `${marque} - ${nomBouteille}`;
};

/**
 * Validate composition object structure
 */
export const validateComposition = (composition: unknown): composition is WaterData['composition'] => {
  if (!composition || typeof composition !== 'object') return false;
  
  const required = ['nitrates', 'sodium', 'calcium', 'magnesium', 'residusSec'];
  const comp = composition as Record<string, unknown>;
  
  return required.every(key => 
    key in comp && typeof comp[key] === 'number' && !isNaN(comp[key] as number)
  );
};

/**
 * Convert BottleWaterData to WaterData with validation
 */
export const convertBottleWaterDataToWaterData = (bottle: BottleWaterData): WaterData => {
  return {
    id: bottle.id.toString(),
    name: bottle.nom_bouteille,
    type: bottle.type_eau,
    source: bottle.source || 'Non spécifiée',
    price: safeParseNumber(bottle.prix_moyen_litre, 0).value,
    co2: safeParseNumber(bottle.impact_carbone_gCO2L, 0).value / 1000, // Convert g to kg
    composition: {
      nitrates: safeParseNumber(bottle.nitrates_mgL, 0).value,
      sodium: safeParseNumber(bottle.sodium_mgL, 0).value,
      calcium: safeParseNumber(bottle.calcium_mgL, 0).value,
      magnesium: safeParseNumber(bottle.magnesium_mgL, 0).value,
      residusSec: safeParseNumber(bottle.residu_sec_mgL, 0).value
    },
    producer: bottle.marque,
    packaging: bottle.emballage,
    volumeAnnuel: 0 // BottleWaterData doesn't have volume info
  };
};

/**
 * Convert WaterData to BottleWaterData with validation
 */
export const convertWaterDataToBottleWaterData = (favorite: WaterData): BottleWaterData => {
  // Safety check for composition property
  const composition = validateComposition(favorite.composition) 
    ? favorite.composition
    : {
        nitrates: 0,
        sodium: 0,
        calcium: 0,
        magnesium: 0,
        residusSec: 0
      };

  return {
    id: safeParseNumber(favorite.id, 0).value,
    marque: favorite.producer || 'Non spécifié',
    nom_bouteille: favorite.name,
    type_eau: favorite.type,
    source: favorite.source,
    format: '1L',
    prix_moyen_litre: safeParseNumber(favorite.price, 0).value,
    nitrates_mgL: composition.nitrates,
    sodium_mgL: composition.sodium,
    calcium_mgL: composition.calcium,
    magnesium_mgL: composition.magnesium,
    residu_sec_mgL: composition.residusSec,
    pH: 7,
    emballage: favorite.packaging || 'Non spécifié',
    recyclable: 'Oui',
    consigne: 'Non',
    impact_carbone_gCO2L: gToMg(safeParseNumber(favorite.co2, 0).value), // Convert kg to g
    ecoscore: 'C'
  };
};

/**
 * Format price for display with validation
 */
export const formatPrice = (price: number, decimals: number = 3): string => {
  // Apply sanity check
  import("@/lib/price").then(({ clampPriceForDisplay }) => {
    const kind = decimals === 3 ? "tap" : "bottle";
    const clamped = clampPriceForDisplay(price, kind);
    if (clamped !== price) {
      console.warn(`[formatPrice] Price ${price} was clamped to ${clamped} for ${kind}`);
    }
  });
  
  return `${price.toFixed(decimals)}€`;
};

/**
 * Format mineral value for display
 */
export const formatMineralValue = (value: number, unit: string = 'mg/L'): string => {
  return `${value} ${unit}`;
};