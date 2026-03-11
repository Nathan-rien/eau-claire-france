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

const COUNTRY_NAMES: Record<string, string> = {
  AT: 'Autriche', BE: 'Belgique', BG: 'Bulgarie', HR: 'Croatie', CY: 'Chypre',
  CZ: 'Tchéquie', DK: 'Danemark', EE: 'Estonie', FI: 'Finlande', FR: 'France',
  DE: 'Allemagne', GR: 'Grèce', HU: 'Hongrie', IE: 'Irlande', IT: 'Italie',
  LV: 'Lettonie', LT: 'Lituanie', LU: 'Luxembourg', MT: 'Malte', NL: 'Pays-Bas',
  PL: 'Pologne', PT: 'Portugal', RO: 'Roumanie', SK: 'Slovaquie', SI: 'Slovénie',
  ES: 'Espagne', SE: 'Suède',
};

let cachedQuality: EUCountryWaterQuality[] | null = null;
let cachedPollutants: EUPollutant[] | null = null;

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'xblogttmomuogdhmaztf';
const EDGE_FN_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/eu-water-quality`;

// --- DISCODATA via Edge Function ---

interface DiscodataRow {
  [key: string]: string | number | null;
}

async function fetchEdgeFunction(type: string): Promise<DiscodataRow[]> {
  const res = await fetch(`${EDGE_FN_BASE}?type=${type}`, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    },
  });
  if (!res.ok) throw new Error(`Edge function returned ${res.status}`);
  const json = await res.json();
  // DISCODATA returns { results: [...] } or direct array
  return Array.isArray(json) ? json : (json.results || json.data || []);
}

function computeQualityScore(complianceRate: number): string {
  if (complianceRate >= 99) return 'A';
  if (complianceRate >= 97) return 'B';
  return 'C';
}

function mapNationalSummaryToQuality(rows: DiscodataRow[]): EUCountryWaterQuality[] {
  const byCountry = new Map<string, DiscodataRow>();
  for (const r of rows) {
    const cc = String(r.CountryCode || '').trim();
    if (cc && COUNTRY_NAMES[cc]) {
      // Keep the latest reporting period per country
      const existing = byCountry.get(cc);
      if (!existing || String(r.ReportingPeriod || '') > String(existing.ReportingPeriod || '')) {
        byCountry.set(cc, r);
      }
    }
  }

  return Array.from(byCountry.entries()).map(([cc, r]) => {
    const complianceRate = Number(r.ComplianceRateTotal) || 0;
    return {
      countryCode: cc,
      countryName: COUNTRY_NAMES[cc] || cc,
      complianceRate,
      nitrateAvg: 0, // Will be enriched from quality-info
      pesticideViolations: 0,
      leadViolations: 0,
      bacteriaViolations: 0,
      populationServedMillions: (Number(r.PopulationServed) || 0) / 1_000_000,
      waterSupplyZones: Number(r.NumberWSZ) || 0,
      reportYear: Number(String(r.ReportingPeriod || '').slice(0, 4)) || 2023,
      qualityScore: computeQualityScore(complianceRate),
    };
  });
}

function enrichQualityWithPollutantData(
  quality: EUCountryWaterQuality[],
  qiRows: DiscodataRow[]
): void {
  // Group exceedances by country
  const countryExceedances = new Map<string, { nitrate: number; pesticide: number; lead: number; bacteria: number }>();
  
  for (const r of qiRows) {
    const cc = String(r.CountryCode || '').trim();
    if (!cc) continue;
    
    if (!countryExceedances.has(cc)) {
      countryExceedances.set(cc, { nitrate: 0, pesticide: 0, lead: 0, bacteria: 0 });
    }
    const entry = countryExceedances.get(cc)!;
    const param = String(r.ParameterName || '').toLowerCase();
    const exceeding = Number(r.SamplesExceedingPV) || 0;
    
    if (param.includes('nitrat')) entry.nitrate = exceeding;
    else if (param.includes('pesticid')) entry.pesticide += exceeding;
    else if (param.includes('lead') || param.includes('plomb')) entry.lead = exceeding;
    else if (param.includes('coliform') || param.includes('e.coli') || param.includes('enterococci')) entry.bacteria += exceeding;
  }

  for (const q of quality) {
    const exc = countryExceedances.get(q.countryCode);
    if (exc) {
      q.pesticideViolations = exc.pesticide;
      q.leadViolations = exc.lead;
      q.bacteriaViolations = exc.bacteria;
      // Try to extract nitrate avg from QI data
    }
  }
}

function mapQualityInfoToPollutants(rows: DiscodataRow[]): EUPollutant[] {
  return rows
    .filter(r => {
      const cc = String(r.CountryCode || '').trim();
      return cc && COUNTRY_NAMES[cc];
    })
    .map(r => {
      const cc = String(r.CountryCode || '').trim();
      const samples = Number(r.SamplesNumber) || 1;
      const exceeding = Number(r.SamplesExceedingPV) || 0;
      const paramGroup = String(r.ParameterGroup || 'Chimique');
      
      let category = 'Chimique';
      if (paramGroup.toLowerCase().includes('micro')) category = 'Microbiologique';
      else if (paramGroup.toLowerCase().includes('metal') || paramGroup.toLowerCase().includes('heavy')) category = 'Métaux lourds';
      else if (paramGroup.toLowerCase().includes('pestici')) category = 'Pesticides';

      return {
        countryCode: cc,
        countryName: COUNTRY_NAMES[cc] || cc,
        pollutant: String(r.ParameterName || 'Inconnu'),
        category,
        avgValue: 0, // DISCODATA QI doesn't provide avg values directly
        unit: String(r.Unit || ''),
        limitValue: Number(r.ParametricValue) || 0,
        exceedanceRatePct: samples > 0 ? Math.round((exceeding / samples) * 1000) / 10 : 0,
        affectedZones: Number(r.NumberWSZExceeding) || 0,
        reportYear: 2023,
      };
    })
    .filter(p => p.exceedanceRatePct > 0 || p.affectedZones > 0);
}

// --- CSV Fallback ---

async function loadQualityFromCSV(): Promise<EUCountryWaterQuality[]> {
  const res = await fetch('/data/eu/wise_dwd_quality.csv');
  const text = await res.text();
  const { rows } = parseCSV(text);

  return rows.map(r => ({
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
}

async function loadPollutantsFromCSV(): Promise<EUPollutant[]> {
  const res = await fetch('/data/eu/eu_pollutants_by_country.csv');
  const text = await res.text();
  const { rows } = parseCSV(text);

  return rows.map(r => ({
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
}

// --- Public API (API-first, CSV fallback) ---

export async function getEUWaterQuality(): Promise<EUCountryWaterQuality[]> {
  if (cachedQuality) return cachedQuality;

  try {
    const [nsRows, qiRows] = await Promise.all([
      fetchEdgeFunction('national-summary'),
      fetchEdgeFunction('quality-info'),
    ]);

    if (nsRows.length > 0) {
      cachedQuality = mapNationalSummaryToQuality(nsRows);
      enrichQualityWithPollutantData(cachedQuality, qiRows);
      console.log(`[europeWaterApi] Loaded ${cachedQuality.length} countries from DISCODATA API`);
      return cachedQuality;
    }
  } catch (err) {
    console.warn('[europeWaterApi] DISCODATA API failed, falling back to CSV:', err);
  }

  // Fallback to CSV
  cachedQuality = await loadQualityFromCSV();
  console.log(`[europeWaterApi] Loaded ${cachedQuality.length} countries from CSV fallback`);
  return cachedQuality;
}

export async function getEUPollutants(): Promise<EUPollutant[]> {
  if (cachedPollutants) return cachedPollutants;

  try {
    const qiRows = await fetchEdgeFunction('quality-info');

    if (qiRows.length > 0) {
      cachedPollutants = mapQualityInfoToPollutants(qiRows);
      console.log(`[europeWaterApi] Loaded ${cachedPollutants.length} pollutant entries from DISCODATA API`);
      return cachedPollutants;
    }
  } catch (err) {
    console.warn('[europeWaterApi] DISCODATA pollutants failed, falling back to CSV:', err);
  }

  // Fallback to CSV
  cachedPollutants = await loadPollutantsFromCSV();
  console.log(`[europeWaterApi] Loaded ${cachedPollutants.length} pollutant entries from CSV fallback`);
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
