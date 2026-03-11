const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// In-memory cache with 24h TTL
const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 24 * 60 * 60 * 1000;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < TTL) return entry.data;
  cache.delete(key);
  return null;
}

// EU country ISO3 codes mapped to ISO2
const EU_ISO3_TO_ISO2: Record<string, string> = {
  AUT: 'AT', BEL: 'BE', BGR: 'BG', HRV: 'HR', CYP: 'CY',
  CZE: 'CZ', DNK: 'DK', EST: 'EE', FIN: 'FI', FRA: 'FR',
  DEU: 'DE', GRC: 'GR', HUN: 'HU', IRL: 'IE', ITA: 'IT',
  LVA: 'LV', LTU: 'LT', LUX: 'LU', MLT: 'MT', NLD: 'NL',
  POL: 'PL', PRT: 'PT', ROU: 'RO', SVK: 'SK', SVN: 'SI',
  ESP: 'ES', SWE: 'SE',
};

const EU_ISO3_LIST = Object.keys(EU_ISO3_TO_ISO2).join(',');

// SDG 6.1.1 = Proportion of population using safely managed drinking water services
// SDG 6.3.2 = Proportion of bodies of water with good ambient water quality
const SDG_INDICATORS: Record<string, string> = {
  'sdg-drinking-water': '6.1.1',
  'sdg-water-quality': '6.3.2',
};

async function fetchSDG6(type: string): Promise<unknown> {
  const cached = getCached(type);
  if (cached) return cached;

  const indicator = SDG_INDICATORS[type];
  if (!indicator) throw new Error(`Unknown type: ${type}`);

  const url = `https://sdg6data.org/api/indicator/${indicator}?_format=json&country=${EU_ISO3_LIST}`;

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SDG6 API returned ${res.status}: ${text.slice(0, 200)}`);
  }

  const rawData = await res.json();

  // Debug: log first entry structure
  if (Array.isArray(rawData) && rawData.length > 0) {
    console.log('SDG6 first entry keys:', Object.keys(rawData[0]));
    console.log('SDG6 first entry:', JSON.stringify(rawData[0]));
    console.log('SDG6 total entries:', rawData.length);
  }

  // Transform: group by country, keep latest year
  const byCountry = new Map<string, Record<string, unknown>>();

  // Also try matching by country name or different code fields
  const ISO2_TO_ISO2 = Object.fromEntries(Object.values(EU_ISO3_TO_ISO2).map(v => [v, v]));

  if (Array.isArray(rawData)) {
    for (const entry of rawData) {
      // Try multiple field names for country identification
      const geoCode = String(entry.GeoAreaCode || '').trim();
      const geoName = String(entry.GeoAreaName || '').trim();
      
      let iso2 = EU_ISO3_TO_ISO2[geoCode] || EU_ISO3_TO_ISO2[geoName] || ISO2_TO_ISO2[geoCode] || null;

      if (!iso2) continue;

      const year = Number(entry.TimePeriod) || 0;
      const existing = byCountry.get(iso2);
      if (!existing || year > (Number(existing.year) || 0)) {
        byCountry.set(iso2, {
          countryCode: iso2,
          iso3,
          year,
          value: Number(entry.Value) || null,
          source: entry.Source || 'WHO/UNICEF JMP',
          indicator,
        });
      }
    }
  }

  const result = {
    indicator,
    description: indicator === '6.1.1'
      ? 'Proportion of population using safely managed drinking water services (%)'
      : 'Proportion of bodies of water with good ambient water quality (%)',
    source: 'UN SDG 6 / WHO-UNICEF JMP',
    countries: Array.from(byCountry.values()),
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

    const validTypes = [...Object.keys(SDG_INDICATORS)];

    if (!type || !validTypes.includes(type)) {
      return new Response(
        JSON.stringify({
          error: 'Missing or invalid "type" parameter.',
          available: validTypes,
          description: {
            'sdg-drinking-water': 'SDG 6.1.1 - Safely managed drinking water by country (%)',
            'sdg-water-quality': 'SDG 6.3.2 - Ambient water quality by country (%)',
          },
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
