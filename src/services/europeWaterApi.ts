import { parseCSV, toNumber } from '@/utils/csv';

export interface EUCountryWaterQuality {
  countryCode: string;
  countryName: string;
  complianceRate: number;
  nitrateAvg: number;
  pesticideViolations: number;
  leadViolations: number;
  bacteriaViolations: number;
  populationServedMillions: number;
  waterSupplyZones: number;
  reportYear: number;
  qualityScore: string;
}

export interface EUPollutant {
  countryCode: string;
  countryName: string;
  pollutant: string;
  category: string;
  avgValue: number;
  unit: string;
  limitValue: number;
  exceedanceRatePct: number;
  affectedZones: number;
  reportYear: number;
}

// Country coordinates for map display
export const EU_COUNTRY_COORDS: Record<string, [number, number]> = {
  AT: [47.5162, 14.5501],
  BE: [50.8503, 4.3517],
  BG: [42.7339, 25.4858],
  HR: [45.1000, 15.2000],
  CY: [35.1264, 33.4299],
  CZ: [49.8175, 15.4730],
  DK: [56.2639, 9.5018],
  EE: [58.5953, 25.0136],
  FI: [61.9241, 25.7482],
  FR: [46.2276, 2.2137],
  DE: [51.1657, 10.4515],
  GR: [39.0742, 21.8243],
  HU: [47.1625, 19.5033],
  IE: [53.4129, -8.2439],
  IT: [41.8719, 12.5674],
  LV: [56.8796, 24.6032],
  LT: [55.1694, 23.8813],
  LU: [49.8153, 6.1296],
  MT: [35.9375, 14.3754],
  NL: [52.1326, 5.2913],
  PL: [51.9194, 19.1451],
  PT: [39.3999, -8.2245],
  RO: [45.9432, 24.9668],
  SK: [48.6690, 19.6990],
  SI: [46.1512, 14.9955],
  ES: [40.4637, -3.7492],
  SE: [60.1282, 18.6435],
};

let cachedQuality: EUCountryWaterQuality[] | null = null;
let cachedPollutants: EUPollutant[] | null = null;

export async function getEUWaterQuality(): Promise<EUCountryWaterQuality[]> {
  if (cachedQuality) return cachedQuality;

  const res = await fetch('/data/eu/wise_dwd_quality.csv');
  const text = await res.text();
  const { rows } = parseCSV(text);

  cachedQuality = rows.map(r => ({
    countryCode: r.country_code,
    countryName: r.country_name,
    complianceRate: toNumber(r.compliance_rate) ?? 0,
    nitrateAvg: toNumber(r.nitrate_avg_mg_l) ?? 0,
    pesticideViolations: toNumber(r.pesticide_violations) ?? 0,
    leadViolations: toNumber(r.lead_violations) ?? 0,
    bacteriaViolations: toNumber(r.bacteria_violations) ?? 0,
    populationServedMillions: toNumber(r.population_served_millions) ?? 0,
    waterSupplyZones: toNumber(r.water_supply_zones) ?? 0,
    reportYear: toNumber(r.report_year) ?? 2023,
    qualityScore: r.quality_score || 'B',
  }));

  return cachedQuality;
}

export async function getEUPollutants(): Promise<EUPollutant[]> {
  if (cachedPollutants) return cachedPollutants;

  const res = await fetch('/data/eu/eu_pollutants_by_country.csv');
  const text = await res.text();
  const { rows } = parseCSV(text);

  cachedPollutants = rows.map(r => ({
    countryCode: r.country_code,
    countryName: r.country_name,
    pollutant: r.pollutant,
    category: r.category,
    avgValue: toNumber(r.avg_value) ?? 0,
    unit: r.unit,
    limitValue: toNumber(r.limit_value) ?? 0,
    exceedanceRatePct: toNumber(r.exceedance_rate_pct) ?? 0,
    affectedZones: toNumber(r.affected_zones) ?? 0,
    reportYear: toNumber(r.report_year) ?? 2023,
  }));

  return cachedPollutants;
}

export function getScoreColor(score: string): string {
  switch (score) {
    case 'A': return 'hsl(var(--chart-2))';
    case 'B': return 'hsl(var(--chart-4))';
    case 'C': return 'hsl(var(--destructive))';
    default: return 'hsl(var(--muted-foreground))';
  }
}

export function getScoreBadgeClass(score: string): string {
  switch (score) {
    case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'B': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'C': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-muted text-muted-foreground';
  }
}
