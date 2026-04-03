const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// In-memory cache with 24h TTL
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DISCODATA_TIMEOUT_MS = 15_000;
const COMPOSITION_TIMEOUT_MS = 30_000;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

// DISCODATA WISE_SOE SQL endpoint
const DISCODATA_URL = 'https://discodata.eea.europa.eu/sql';

async function queryDiscodata(sql: string, timeoutMs = DISCODATA_TIMEOUT_MS): Promise<any[] | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${DISCODATA_URL}?query=${encodeURIComponent(sql)}&p_format=JSON`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();
    return json?.results ?? json?.rows ?? (Array.isArray(json) ? json : null);
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// ── Composition determinand mapping ──
const COMPOSITION_DETERMINANDS: Record<string, { label: string; unit: string }> = {
  'Total hardness': { label: 'Dureté totale', unit: '°dH' },
  'Electrical conductivity': { label: 'Conductivité', unit: 'µS/cm' },
  'Nitrate': { label: 'Nitrate', unit: 'mg/L' },
  'pH': { label: 'pH', unit: '' },
  'Calcium': { label: 'Calcium', unit: 'mg/L' },
  'Magnesium': { label: 'Magnésium', unit: 'mg/L' },
  'Sodium': { label: 'Sodium', unit: 'mg/L' },
  'Ammonium': { label: 'Ammonium', unit: 'mg/L' },
  'Chloride': { label: 'Chlorure', unit: 'mg/L' },
  'Sulphate': { label: 'Sulfate', unit: 'mg/L' },
};

const DETERMINAND_NAMES = Object.keys(COMPOSITION_DETERMINANDS)
  .map(d => `'${d}'`)
  .join(',');

const EU27_CODES = [
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR',
  'DE','GR','HU','IE','IT','LV','LT','LU','MT','NL',
  'PL','PT','RO','SK','SI','ES','SE',
];

const COUNTRY_NAMES: Record<string, string> = {
  AT:'Autriche',BE:'Belgique',BG:'Bulgarie',HR:'Croatie',CY:'Chypre',
  CZ:'Tchéquie',DK:'Danemark',EE:'Estonie',FI:'Finlande',FR:'France',
  DE:'Allemagne',GR:'Grèce',HU:'Hongrie',IE:'Irlande',IT:'Italie',
  LV:'Lettonie',LT:'Lituanie',LU:'Luxembourg',MT:'Malte',NL:'Pays-Bas',
  PL:'Pologne',PT:'Portugal',RO:'Roumanie',SK:'Slovaquie',SI:'Slovénie',
  ES:'Espagne',SE:'Suède',
};

async function getComposition(countryCode?: string) {
  const cacheKey = `composition_${countryCode || 'all'}`;
  const cached = getCached(cacheKey);
  if (cached) return { data: cached, source: 'discodata', cached: true };

  const countryFilter = countryCode && countryCode !== 'all'
    ? `AND countryCode = '${countryCode}'`
    : `AND countryCode IN (${EU27_CODES.map(c => `'${c}'`).join(',')})`;

  const sql = `SELECT countryCode, observedPropertyDeterminandLabel, AVG(resultMeanValue) as avg_val, MIN(resultMeanValue) as min_val, MAX(resultMeanValue) as max_val, resultUom, COUNT(*) as samples FROM [WISE_SOE].[latest].[Waterbase_T_WISE6_AggregatedData] WHERE phenomenonTimeReferenceYear >= 2020 AND resultMeanValue IS NOT NULL AND observedPropertyDeterminandLabel IN (${DETERMINAND_NAMES}) ${countryFilter} GROUP BY countryCode, observedPropertyDeterminandLabel, resultUom`;

  const rows = await queryDiscodata(sql, COMPOSITION_TIMEOUT_MS);
  if (!rows || rows.length === 0) {
    return { data: null, source: 'unavailable' };
  }

  const data = rows.map((r: any) => {
    const mapping = COMPOSITION_DETERMINANDS[r.observedPropertyDeterminandLabel];
    return {
      countryCode: r.countryCode,
      countryName: COUNTRY_NAMES[r.countryCode] || r.countryCode,
      parameter: mapping?.label || r.observedPropertyDeterminandLabel,
      avgValue: parseFloat(r.avg_val) || 0,
      minValue: parseFloat(r.min_val) || 0,
      maxValue: parseFloat(r.max_val) || 0,
      unit: mapping?.unit || r.resultUom || 'mg/L',
      samples: parseInt(r.samples) || 0,
      dataYear: 2024,
    };
  });

  // Calculate carbonate hardness from Ca and Mg when both available
  if (!countryCode || countryCode === 'all') {
    addCarbonateHardness(data);
  } else {
    addCarbonateHardness(data.filter((d: any) => d.countryCode === countryCode));
  }

  setCache(cacheKey, data);

  // Try to persist to Supabase (best-effort, don't fail if unavailable)
  try {
    await persistToSupabase(data);
  } catch { /* ignore */ }

  return { data, source: 'discodata', cached: false };
}

function addCarbonateHardness(data: any[]) {
  const grouped = new Map<string, { ca?: number; mg?: number }>();
  for (const d of data) {
    if (d.parameter === 'Calcium' || d.parameter === 'Magnésium') {
      const existing = grouped.get(d.countryCode) || {};
      if (d.parameter === 'Calcium') existing.ca = d.avgValue;
      if (d.parameter === 'Magnésium') existing.mg = d.avgValue;
      grouped.set(d.countryCode, existing);
    }
  }
  for (const [cc, vals] of grouped) {
    if (vals.ca !== undefined && vals.mg !== undefined) {
      // Carbonate hardness ≈ (Ca/40.08 + Mg/24.31) × 50 × 0.056 in °dH
      const carbonateHardness = ((vals.ca / 40.08) + (vals.mg / 24.31)) * 2.8;
      data.push({
        countryCode: cc,
        countryName: COUNTRY_NAMES[cc] || cc,
        parameter: 'Dureté carbonatée',
        avgValue: Math.round(carbonateHardness * 100) / 100,
        minValue: 0,
        maxValue: 0,
        unit: '°dH',
        samples: 0,
        dataYear: 2024,
      });
    }
  }
}

async function persistToSupabase(data: any[]) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return;

  // Upsert each record
  const records = data.map((d: any) => ({
    country_code: d.countryCode,
    country_name: d.countryName,
    parameter: d.parameter,
    avg_value: d.avgValue,
    min_value: d.minValue,
    max_value: d.maxValue,
    unit: d.unit,
    samples_count: d.samples,
    data_year: d.dataYear,
    source: 'discodata',
    updated_at: new Date().toISOString(),
  }));

  // Use Supabase REST API for upsert
  const res = await fetch(`${supabaseUrl}/rest/v1/eu_water_composition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(records),
  });

  if (!res.ok) {
    console.error('Failed to persist composition:', await res.text());
  }
}

async function getPollutantsByCountry(countryCode: string) {
  const cacheKey = `pollutants_${countryCode}`;
  const cached = getCached(cacheKey);
  if (cached) return { data: cached, source: 'discodata', cached: true };

  const sql = `SELECT countryCode, observedPropertyDeterminandLabel, AVG(resultMeanValue) as avg_val, resultUom, COUNT(*) as samples FROM [WISE_SOE].[latest].[Waterbase_T_WISE6_AggregatedData] WHERE phenomenonTimeReferenceYear >= 2021 AND resultMeanValue IS NOT NULL AND countryCode = '${countryCode}' GROUP BY countryCode, observedPropertyDeterminandLabel, resultUom`;

  const rows = await queryDiscodata(sql);
  if (!rows || rows.length === 0) {
    return { data: null, source: 'unavailable' };
  }

  const data = rows.map((r: any) => ({
    countryCode: r.countryCode,
    pollutant: r.observedPropertyDeterminandLabel,
    avgValue: parseFloat(r.avg_val) || 0,
    unit: r.resultUom,
    samples: parseInt(r.samples) || 0,
  }));

  setCache(cacheKey, data);
  return { data, source: 'discodata', cached: false };
}

async function getCountrySummaries() {
  const cacheKey = 'country_summaries';
  const cached = getCached(cacheKey);
  if (cached) return { data: cached, source: 'discodata', cached: true };

  const sql = `SELECT countryCode, COUNT(*) as total_samples, COUNT(DISTINCT observedPropertyDeterminandLabel) as pollutant_types, MAX(phenomenonTimeReferenceYear) as latest_year FROM [WISE_SOE].[latest].[Waterbase_T_WISE6_AggregatedData] WHERE phenomenonTimeReferenceYear >= 2021 AND resultMeanValue IS NOT NULL GROUP BY countryCode ORDER BY countryCode`;

  const rows = await queryDiscodata(sql);
  if (!rows || rows.length === 0) {
    return { data: null, source: 'unavailable' };
  }

  const data = rows.map((r: any) => ({
    countryCode: r.countryCode,
    totalSamples: parseInt(r.total_samples) || 0,
    pollutantTypes: parseInt(r.pollutant_types) || 0,
    latestYear: parseInt(r.latest_year) || 0,
  }));

  setCache(cacheKey, data);
  return { data, source: 'discodata', cached: false };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const country = url.searchParams.get('country')?.toUpperCase();

    // ── Composition endpoint ──
    if (type === 'composition') {
      const result = await getComposition(country || 'all');
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'pollutants' && country) {
      const result = await getPollutantsByCountry(country);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'countries') {
      const result = await getCountrySummaries();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default: return metadata
    return new Response(JSON.stringify({
      status: 'hybrid',
      message: 'EU water quality: CSV baseline (rapport EEA 2024) enriched with DISCODATA WISE_SOE API for real-time pollutant and composition data.',
      endpoints: {
        pollutants: '?type=pollutants&country=XX',
        countries: '?type=countries',
        composition: '?type=composition&country=XX (or country=all for EU-27)',
      },
      csvFiles: [
        '/data/eu/wise_dwd_quality.csv',
        '/data/eu/eu_pollutants_by_country.csv',
        '/data/eu/eu_water_composition.csv',
      ],
      dataYear: 2024,
      compositionParameters: Object.values(COMPOSITION_DETERMINANDS).map(d => d.label).concat(['Dureté carbonatée']),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error', details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
