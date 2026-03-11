const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 24 * 60 * 60 * 1000;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < TTL) return entry.data;
  cache.delete(key);
  return null;
}

const EU_ISO3_TO_ISO2: Record<string, string> = {
  AUT: 'AT', BEL: 'BE', BGR: 'BG', HRV: 'HR', CYP: 'CY',
  CZE: 'CZ', DNK: 'DK', EST: 'EE', FIN: 'FI', FRA: 'FR',
  DEU: 'DE', GRC: 'GR', HUN: 'HU', IRL: 'IE', ITA: 'IT',
  LVA: 'LV', LTU: 'LT', LUX: 'LU', MLT: 'MT', NLD: 'NL',
  POL: 'PL', PRT: 'PT', ROU: 'RO', SVK: 'SK', SVN: 'SI',
  ESP: 'ES', SWE: 'SE',
};

// Numeric UN M49 codes for EU countries
const EU_M49_TO_ISO2: Record<string, string> = {
  '40': 'AT', '56': 'BE', '100': 'BG', '191': 'HR', '196': 'CY',
  '203': 'CZ', '208': 'DK', '233': 'EE', '246': 'FI', '250': 'FR',
  '276': 'DE', '300': 'GR', '348': 'HU', '372': 'IE', '380': 'IT',
  '428': 'LV', '440': 'LT', '442': 'LU', '470': 'MT', '528': 'NL',
  '616': 'PL', '620': 'PT', '642': 'RO', '703': 'SK', '705': 'SI',
  '724': 'ES', '752': 'SE',
};

const EU_ISO3_LIST = Object.keys(EU_ISO3_TO_ISO2).join(',');

interface SDG6Entry {
  GeoAreaCode?: string | number;
  GeoAreaName?: string;
  TimePeriod?: string | number;
  Value?: string | number;
  Source?: string;
  [key: string]: unknown;
}

// SDG 6.1.1 = Safely managed drinking water
// SDG 6.3.2 = Ambient water quality
const SDG_INDICATORS: Record<string, { code: string; desc: string }> = {
  'sdg-drinking-water': {
    code: '6.1.1',
    desc: 'Proportion of population using safely managed drinking water services (%)',
  },
  'sdg-water-quality': {
    code: '6.3.2',
    desc: 'Proportion of bodies of water with good ambient water quality (%)',
  },
};

async function fetchSDG6(type: string): Promise<unknown> {
  const cached = getCached(type);
  if (cached) return cached;

  const info = SDG_INDICATORS[type];
  if (!info) throw new Error(`Unknown type: ${type}`);

  // Fetch with high per_page to get all EU data in one call
  // Filter for recent data only (2015+) to avoid pagination issues
  const url = `https://sdg6data.org/api/indicator/${info.code}?_format=json&country=${EU_ISO3_LIST}&per_page=5000&timePeriod=2015,2016,2017,2018,2019,2020,2021,2022,2023,2024`;

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SDG6 API returned ${res.status}: ${text.slice(0, 300)}`);
  }

  const rawData = await res.json();

  // SDG6 API returns: [paginationMeta, [...actualData]]
  let entries: SDG6Entry[] = [];
  if (Array.isArray(rawData)) {
    if (rawData.length === 2 && Array.isArray(rawData[1])) {
      // Format: [meta, [data...]]
      entries = rawData[1];
      console.log(`SDG6 pagination meta:`, JSON.stringify(rawData[0]));
    } else {
      entries = rawData;
    }
  }

  console.log(`SDG6 entries count: ${entries.length}`);
  if (entries.length > 0) {
    console.log(`SDG6 first data entry keys:`, Object.keys(entries[0]));
    console.log(`SDG6 sample entry:`, JSON.stringify(entries[0]));
  }

  const byCountry = new Map<string, Record<string, unknown>>();

  for (const entry of entries) {
    const geoCode = String(entry.GeoAreaCode ?? '').trim();

    // Try ISO3 first, then M49 numeric code
    const iso2 = EU_ISO3_TO_ISO2[geoCode] || EU_M49_TO_ISO2[geoCode] || null;
    if (!iso2) continue;

    const year = Number(entry.TimePeriod) || 0;
    const existing = byCountry.get(iso2);
    if (!existing || year > (Number(existing.year) || 0)) {
      byCountry.set(iso2, {
        countryCode: iso2,
        geoAreaCode: geoCode,
        geoAreaName: String(entry.GeoAreaName || ''),
        year,
        value: entry.Value != null ? Number(entry.Value) : null,
        source: entry.Source || 'WHO/UNICEF JMP',
      });
    }
  }

  const result = {
    indicator: info.code,
    description: info.desc,
    source: 'UN SDG 6 / WHO-UNICEF JMP',
    countries: Array.from(byCountry.values()),
    totalEntries: entries.length,
  };

  cache.set(type, { data: result, ts: Date.now() });
  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');

    const validTypes = Object.keys(SDG_INDICATORS);

    if (!type || !validTypes.includes(type)) {
      return new Response(
        JSON.stringify({
          error: 'Missing or invalid "type" parameter.',
          available: validTypes,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await fetchSDG6(type);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (err) {
    console.error('eu-water-quality error:', err);
    return new Response(
      JSON.stringify({ error: err.message, source: 'eu-water-quality-proxy' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
