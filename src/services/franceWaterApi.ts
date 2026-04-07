import { parseCSV, toNumber } from '@/utils/csv';

export interface FRRegionWaterQuality {
  regionCode: string;
  regionName: string;
  complianceRate: number;
  nitrateAvg: number;
  qualityScore: string;
  populationMillions: number;
  communes: number;
  waterSupplyZones: number;
}

export interface FRRegionPollutant {
  regionCode: string;
  regionName: string;
  pollutant: string;
  category: string;
  avgValue: number;
  unit: string;
  limitValue: number;
  exceedanceRatePct: number;
  affectedZones: number;
  reportYear: number;
}

export const FR_REGION_COORDS: Record<string, [number, number]> = {
  IDF: [48.8566, 2.3522],
  ARA: [45.7640, 4.8357],
  NAQ: [44.8378, -0.5792],
  OCC: [43.6047, 1.4442],
  HDF: [49.8941, 2.2958],
  GES: [48.5734, 7.7521],
  BRE: [48.1173, -1.6778],
  NOR: [49.1829, -0.3707],
  PDL: [47.2184, -1.5536],
  CVL: [47.3941, 1.6940],
  BFC: [47.3220, 6.0243],
  PAC: [43.2965, 5.3698],
  COR: [42.0396, 9.0129],
};

let cachedQuality: FRRegionWaterQuality[] | null = null;
let cachedPollutants: FRRegionPollutant[] | null = null;

export async function getFRRegionQuality(): Promise<FRRegionWaterQuality[]> {
  if (cachedQuality) return cachedQuality;

  const res = await fetch('/data/fr/fr_regions_quality.csv');
  const text = await res.text();
  const { rows } = parseCSV(text);

  cachedQuality = rows.map(r => ({
    regionCode: r.region_code,
    regionName: r.region_name,
    complianceRate: toNumber(r.compliance_rate) ?? 0,
    nitrateAvg: toNumber(r.nitrate_avg_mg_l) ?? 0,
    qualityScore: r.quality_score || 'B',
    populationMillions: toNumber(r.population_millions) ?? 0,
    communes: toNumber(r.communes) ?? 0,
    waterSupplyZones: toNumber(r.water_supply_zones) ?? 0,
  }));

  return cachedQuality;
}

export async function getFRPollutants(): Promise<FRRegionPollutant[]> {
  if (cachedPollutants) return cachedPollutants;

  const res = await fetch('/data/fr/fr_pollutants_by_region.csv');
  const text = await res.text();
  const { rows } = parseCSV(text);

  cachedPollutants = rows
    .filter(r => r.exceedance_rate_pct !== '–')
    .map(r => ({
      regionCode: r.region_code,
      regionName: r.region_name,
      pollutant: r.pollutant,
      category: r.category,
      avgValue: toNumber(r.avg_value) ?? 0,
      unit: r.unit,
      limitValue: toNumber(r.limit_value) ?? 0,
      exceedanceRatePct: toNumber(r.exceedance_rate_pct) ?? 0,
      affectedZones: toNumber(r.affected_zones) ?? 0,
      reportYear: toNumber(r.report_year) ?? 2024,
    }));

  return cachedPollutants;
}
