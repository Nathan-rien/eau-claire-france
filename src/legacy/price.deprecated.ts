export function throwLegacyPriceUse(where: string): never {
  throw new Error(`[DEPRECATED] Legacy price read at ${where}. Use usePrices()`);
}