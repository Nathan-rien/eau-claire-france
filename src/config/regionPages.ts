import type { WaterRegion } from '@/config/waterRegions';

/**
 * Regions that get a dedicated SEO page (≥ 3 bottled waters in the dataset).
 * The region → brand mapping itself stays in waterRegions.ts (single source).
 */
export const REGION_PAGE_SLUGS = {
  alpes: 'eaux-minerales-alpes',
  vosges: 'eaux-minerales-vosges',
  auvergne: 'eaux-minerales-auvergne',
  pyrenees: 'eaux-minerales-pyrenees',
  mediterranee: 'eaux-minerales-mediterranee',
} as const satisfies Partial<Record<WaterRegion, string>>;

export type RegionPageKey = keyof typeof REGION_PAGE_SLUGS;

export const REGION_PAGE_KEYS = Object.keys(REGION_PAGE_SLUGS) as RegionPageKey[];

export const REGION_PAGE_PATHS = REGION_PAGE_KEYS.map((k) => `/${REGION_PAGE_SLUGS[k]}`);
