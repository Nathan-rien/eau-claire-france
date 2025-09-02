/**
 * Centralized price logic with safeguards and metadata
 * Audit: Prix eau robinet vs bouteille - cohérence et vérifications
 */

export type PriceValue = {
  value: number;              // toujours en €/L
  unit: "EUR_PER_L";
  source: string;             // ex: "DGCL 2024 / Syndicats des eaux / CSV interne"
  updatedAt: string;          // ISO
  method: "converted"|"direct"|"aggregated";
  notes?: string;
};

export type PriceInputs = {
  tap?: { price: number; unit: "EUR_PER_M3"|"EUR_PER_L"; source: string; updatedAt: string; };
  bottle?: (
    | { pricePerPack: number; bottlesPerPack: number; volumePerBottleL: number; source: string; updatedAt: string; }
    | { pricePerBottle: number; volumePerBottleL: number; source: string; updatedAt: string; }
    | { pricePerLitre: number; source: string; updatedAt: string; }
  )[];
};

/**
 * Convert tap water price to €/L
 */
export function toEuroPerLitreTap(input: { price: number; unit: "EUR_PER_M3"|"EUR_PER_L" }): number {
  console.log("[price:audit]", { tapRaw: input.price, tapUnit: input.unit });
  return input.unit === "EUR_PER_M3" ? input.price / 1000 : input.price;
}

/**
 * Convert bottle water price to €/L
 */
export function toEuroPerLitreBottle(input:
  { pricePerPack: number; bottlesPerPack: number; volumePerBottleL: number } |
  { pricePerBottle: number; volumePerBottleL: number } |
  { pricePerLitre: number }
): number {
  if ("pricePerLitre" in input) {
    console.log("[price:audit]", { bottleRaw: input.pricePerLitre, bottleUnit: "EUR_PER_L" });
    return input.pricePerLitre;
  }
  
  if ("pricePerBottle" in input) {
    const result = input.pricePerBottle / input.volumePerBottleL;
    console.log("[price:audit]", { 
      bottleRaw: input.pricePerBottle, 
      bottleUnit: "EUR_PER_BOTTLE", 
      bottleVolumeL: input.volumePerBottleL,
      calculated: result 
    });
    return result;
  }
  
  // pack
  const totalL = input.bottlesPerPack * input.volumePerBottleL;
  const result = input.pricePerPack / totalL;
  console.log("[price:audit]", { 
    packPrice: input.pricePerPack, 
    packSize: input.bottlesPerPack, 
    bottleVolumeL: input.volumePerBottleL,
    totalL,
    calculated: result
  });
  return result;
}

/**
 * Détection d'anomalies (bornes réalistes)
 */
export function sanityCheckEuroPerL(v: number, kind: "tap"|"bottle"): { ok: boolean; reason?: string } {
  const range = kind === "tap" ? [0.0005, 0.02] : [0.05, 5]; // bornes larges mais réalistes
  if (!Number.isFinite(v)) return { ok: false, reason: "NaN/Inf" };
  if (v < range[0] || v > range[1]) return { ok: false, reason: `out_of_range_${range[0]}_${range[1]}` };
  return { ok: true };
}

/**
 * Aggregate bottle prices from multiple inputs
 */
export function aggregateBottlePrices(inputs: PriceInputs["bottle"]): PriceValue {
  const values = (inputs ?? []).map(toEuroPerLitreBottle).filter(n => Number.isFinite(n));
  const median = values.length ? values.sort((a,b)=>a-b)[Math.floor(values.length/2)] : NaN;
  const pick = Number.isFinite(median) ? median : (values[0] ?? NaN);
  const check = sanityCheckEuroPerL(pick, "bottle");

  return {
    value: check.ok ? pick : 0.5, // fallback raisonnable 0.50 €/L si anomalie
    unit: "EUR_PER_L",
    source: (inputs?.[0] as any)?.source ?? "N/A",
    updatedAt: (inputs?.[0] as any)?.updatedAt ?? new Date().toISOString(),
    method: Number.isFinite(median) ? "aggregated" : "converted",
    notes: check.ok ? undefined : `fallback_due_to_${check.reason}`,
  };
}

/**
 * Create tap water price with validation
 */
export function makeTapPrice(input: NonNullable<PriceInputs["tap"]>): PriceValue {
  const v = toEuroPerLitreTap(input);
  const check = sanityCheckEuroPerL(v, "tap");
  return {
    value: check.ok ? v : 0.004, // fallback 0.004 €/L
    unit: "EUR_PER_L",
    source: input.source,
    updatedAt: input.updatedAt,
    method: "converted",
    notes: check.ok ? undefined : `fallback_due_to_${check.reason}`,
  };
}

/**
 * Validate price for display (clamp extremes)
 */
export function clampPriceForDisplay(price: number, kind: "tap"|"bottle"): number {
  const bounds = kind === "tap" ? [0.0005, 0.02] : [0.05, 5];
  return Math.max(bounds[0], Math.min(bounds[1], price));
}