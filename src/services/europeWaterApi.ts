import { parseCSV, toNumber } from '@/utils/csv';
import { supabase } from '@/integrations/supabase/client';

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
  dataSource?: 'api' | 'csv';
}

export interface DiscodataPollutant {
  countryCode: string;
  pollutant: string;
  avgValue: number;
  unit: string;
  samples: number;
}

// Country coordinates for map display
export const EU_COUNTRY_COORDS: Record<string, [number, number]> = {
  AT: [47.5162, 14.5501], BE: [50.8503, 4.3517], BG: [42.7339, 25.4858],
  HR: [45.1000, 15.2000], CY: [35.1264, 33.4299], CZ: [49.8175, 15.4730],
  DK: [56.2639, 9.5018], EE: [58.5953, 25.0136], FI: [61.9241, 25.7482],
  FR: [46.2276, 2.2137], DE: [51.1657, 10.4515], GR: [39.0742, 21.8243],
  HU: [47.1625, 19.5033], IE: [53.4129, -8.2439], IT: [41.8719, 12.5674],
  LV: [56.8796, 24.6032], LT: [55.1694, 23.8813], LU: [49.8153, 6.1296],
  MT: [35.9375, 14.3754], NL: [52.1326, 5.2913], PL: [51.9194, 19.1451],
  PT: [39.3999, -8.2245], RO: [45.9432, 24.9668], SK: [48.6690, 19.6990],
  SI: [46.1512, 14.9955], ES: [40.4637, -3.7492], SE: [60.1282, 18.6435],
};

let cachedQuality: EUCountryWaterQuality[] | null = null;
let cachedPollutants: EUPollutant[] | null = null;
let lastApiCheck: string | null = null;

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
    reportYear: toNumber(r.report_year) ?? 2024,
    qualityScore: r.quality_score || 'B',
  }));

  return cachedQuality;
}

/**
 * Fetch DISCODATA pollutants for a specific country via edge function
 */
async function fetchDiscodataPollutants(countryCode: string): Promise<DiscodataPollutant[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke('eu-water-quality', {
      body: null,
      headers: { 'Content-Type': 'application/json' },
    });

    // Use URL params approach since invoke doesn't support query params directly
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    if (!projectId) return null;

    const url = `https://${projectId}.supabase.co/functions/v1/eu-water-quality?type=pollutants&country=${countryCode}`;
    const res = await fetch(url, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
      },
    });

    if (!res.ok) return null;
    const result = await res.json();
    lastApiCheck = new Date().toISOString();

    if (result.source === 'discodata' && result.data) {
      return result.data as DiscodataPollutant[];
    }
    return null;
  } catch {
    return null;
  }
}

export async function getEUPollutants(): Promise<EUPollutant[]> {
  if (cachedPollutants) return cachedPollutants;

  // Load CSV baseline
  const res = await fetch('/data/eu/eu_pollutants_by_country.csv');
  const text = await res.text();
  const { rows } = parseCSV(text);

  const csvPollutants: EUPollutant[] = rows.map(r => ({
    countryCode: r.country_code,
    countryName: r.country_name,
    pollutant: r.pollutant,
    category: r.category,
    avgValue: toNumber(r.avg_value) ?? 0,
    unit: r.unit,
    limitValue: toNumber(r.limit_value) ?? 0,
    exceedanceRatePct: toNumber(r.exceedance_rate_pct) ?? 0,
    affectedZones: toNumber(r.affected_zones) ?? 0,
    reportYear: toNumber(r.report_year) ?? 2024,
    dataSource: 'csv' as const,
  }));

  // Try enriching with DISCODATA for key countries
  const discodataCountries = ['AT', 'BE', 'CZ', 'DE', 'DK', 'ES', 'MT', 'RO'];
  
  try {
    // Attempt DISCODATA enrichment in parallel for available countries
    const enrichmentPromises = discodataCountries.map(async (cc) => {
      const apiData = await fetchDiscodataPollutants(cc);
      if (!apiData) return [];
      
      const countryName = csvPollutants.find(p => p.countryCode === cc)?.countryName || cc;
      
      // Map known DISCODATA determinands to our pollutant names
      const determinandMap: Record<string, { name: string; category: string; limit: number }> = {
        'Nitrate': { name: 'Nitrates', category: 'Chimique', limit: 50 },
        'Lead and its compounds': { name: 'Plomb', category: 'Métaux lourds', limit: 10 },
        'Pesticides - Total': { name: 'Pesticides total', category: 'Chimique', limit: 0.5 },
      };

      return apiData
        .filter(d => determinandMap[d.pollutant])
        .map(d => {
          const mapping = determinandMap[d.pollutant];
          // Find existing CSV entry to preserve exceedance/zone data
          const csvEntry = csvPollutants.find(
            p => p.countryCode === cc && p.pollutant === mapping.name
          );
          return {
            countryCode: cc,
            countryName,
            pollutant: mapping.name,
            category: mapping.category,
            avgValue: d.avgValue,
            unit: d.unit || csvEntry?.unit || 'mg/L',
            limitValue: mapping.limit,
            exceedanceRatePct: csvEntry?.exceedanceRatePct ?? 0,
            affectedZones: csvEntry?.affectedZones ?? 0,
            reportYear: 2024,
            dataSource: 'api' as const,
          } as EUPollutant;
        });
    });

    const enrichments = await Promise.allSettled(enrichmentPromises);
    const apiEntries: EUPollutant[] = enrichments
      .filter((r): r is PromiseFulfilledResult<EUPollutant[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Merge: API entries override CSV entries for matching country+pollutant
    if (apiEntries.length > 0) {
      const merged = csvPollutants.map(csvEntry => {
        const apiEntry = apiEntries.find(
          a => a.countryCode === csvEntry.countryCode && a.pollutant === csvEntry.pollutant
        );
        return apiEntry || csvEntry;
      });
      cachedPollutants = merged;
    } else {
      cachedPollutants = csvPollutants;
    }
  } catch {
    // Fallback to CSV on any error
    cachedPollutants = csvPollutants;
  }

  return cachedPollutants;
}

export function getLastApiCheck(): string | null {
  return lastApiCheck;
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

// ── EU Water Composition (physico-chemical parameters) ──

export interface EUWaterComposition {
  countryCode: string;
  countryName: string;
  parameter: string;
  avgValue: number;
  minValue: number;
  maxValue: number;
  unit: string;
  samples: number;
  dataYear: number;
  dataSource?: 'api' | 'csv';
}

let cachedComposition: EUWaterComposition[] | null = null;

export async function getEUWaterComposition(countryCode?: string): Promise<EUWaterComposition[]> {
  if (cachedComposition) {
    return countryCode
      ? cachedComposition.filter(c => c.countryCode === countryCode)
      : cachedComposition;
  }

  // Try edge function first
  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    if (projectId) {
      const country = countryCode || 'all';
      const url = `https://${projectId}.supabase.co/functions/v1/eu-water-quality?type=composition&country=${country}`;
      const res = await fetch(url, {
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '' },
      });

      if (res.ok) {
        const result = await res.json();
        if (result.source === 'discodata' && result.data) {
          cachedComposition = (result.data as any[]).map(d => ({
            ...d,
            dataSource: 'api' as const,
          }));
          return countryCode
            ? cachedComposition.filter(c => c.countryCode === countryCode)
            : cachedComposition;
        }
      }
    }
  } catch { /* fallback to CSV */ }

  // Fallback: load CSV baseline
  const res = await fetch('/data/eu/eu_water_composition.csv');
  const text = await res.text();
  const { rows } = parseCSV(text);

  cachedComposition = rows.map(r => ({
    countryCode: r.country_code,
    countryName: r.country_name,
    parameter: r.parameter,
    avgValue: toNumber(r.avg_value) ?? 0,
    minValue: toNumber(r.min_value) ?? 0,
    maxValue: toNumber(r.max_value) ?? 0,
    unit: r.unit || 'mg/L',
    samples: toNumber(r.samples) ?? 0,
    dataYear: toNumber(r.data_year) ?? 2024,
    dataSource: 'csv' as const,
  }));

  return countryCode
    ? cachedComposition.filter(c => c.countryCode === countryCode)
    : cachedComposition;
}
