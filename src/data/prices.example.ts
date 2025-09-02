import { PriceInputs } from "@/lib/price";

/**
 * Example price inputs with realistic French market data
 * Source documentation and update tracking
 */
export const PRICE_INPUTS: PriceInputs = {
  tap: { 
    price: 4, 
    unit: "EUR_PER_M3", 
    source: "Valeur FR de travail (à confirmer avec DGCL/Syndicats des eaux)", 
    updatedAt: "2025-01-01" 
  },
  bottle: [
    { 
      pricePerPack: 2.40, 
      bottlesPerPack: 6, 
      volumePerBottleL: 1.5, 
      source: "Exemple supermarché low-cost", 
      updatedAt: "2025-01-01" 
    },
    { 
      pricePerBottle: 0.60, 
      volumePerBottleL: 1.0, 
      source: "Exemple supermarché standard", 
      updatedAt: "2025-01-01" 
    },
    { 
      pricePerLitre: 0.85, 
      source: "Exemple premium", 
      updatedAt: "2025-01-01" 
    },
  ],
};