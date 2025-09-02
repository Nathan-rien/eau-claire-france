import { PRICE_INPUTS } from "@/data/prices.example";
import { makeTapPrice, aggregateBottlePrices, PriceValue } from "@/lib/price";
import { useMemo } from "react";

export function usePrices(): { tap: PriceValue; bottle: PriceValue } {
  return useMemo(() => {
    const tap = PRICE_INPUTS.tap ? makeTapPrice(PRICE_INPUTS.tap) : {
      value: 0.004, 
      unit: "EUR_PER_L" as const, 
      source: "fallback", 
      updatedAt: new Date().toISOString(), 
      method: "converted" as const, 
      notes: "no_tap_input"
    };
    const bottle = aggregateBottlePrices(PRICE_INPUTS.bottle || []);
    
    // Log utile en dev
    console.log("[price:final]", { tap, bottle });
    return { tap, bottle };
  }, []);
}