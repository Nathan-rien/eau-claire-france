const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// In-memory cache with 24h TTL
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DISCODATA_TIMEOUT_MS = 15_000;

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

async function queryDiscodata(sql: string): Promise<any[] | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DISCODATA_TIMEOUT_MS);

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
      message: 'EU water quality: CSV baseline (rapport EEA 2024) enriched with DISCODATA WISE_SOE API for real-time pollutant data.',
      endpoints: {
        pollutants: '?type=pollutants&country=XX',
        countries: '?type=countries',
      },
      csvFiles: [
        '/data/eu/wise_dwd_quality.csv',
        '/data/eu/eu_pollutants_by_country.csv',
      ],
      dataYear: 2024,
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
