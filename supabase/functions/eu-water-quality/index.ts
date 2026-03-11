const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DISCODATA_BASE = 'https://discodata.eea.europa.eu/sql';

// In-memory cache with 24h TTL
const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 24 * 60 * 60 * 1000;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < TTL) return entry.data;
  cache.delete(key);
  return null;
}

// SQL queries for each endpoint type
// Try multiple schema formats - DISCODATA uses SQL Server style bracketed names
const QUERIES: Record<string, string[]> = {
  'national-summary': [
    `SELECT TOP 1000 * FROM [WISE_DWD].[v1].[DWD_NS]`,
    `SELECT TOP 1000 * FROM [WISE_DWD].[latest].[DWD_NS]`,
    `SELECT TOP 1000 * FROM [DWD].[latest].[DWD_NS]`,
  ],
  'quality-info': [
    `SELECT TOP 1000 * FROM [WISE_DWD].[v1].[DWD_QI]`,
    `SELECT TOP 1000 * FROM [WISE_DWD].[latest].[DWD_QI]`,
    `SELECT TOP 1000 * FROM [DWD].[latest].[DWD_QI]`,
  ],
  'non-compliance': [
    `SELECT TOP 1000 * FROM [WISE_DWD].[v1].[DWD_NCI]`,
    `SELECT TOP 1000 * FROM [WISE_DWD].[latest].[DWD_NCI]`,
    `SELECT TOP 1000 * FROM [DWD].[latest].[DWD_NCI]`,
  ],
  // Describe query to discover available schemas
  'describe': [
    `SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE 'DWD%'`,
  ],
};

async function fetchDiscodata(queryType: string): Promise<unknown> {
  const cached = getCached(queryType);
  if (cached) return cached;

  const sqlVariants = QUERIES[queryType];
  if (!sqlVariants) throw new Error(`Unknown query type: ${queryType}`);

  let lastError = '';
  for (const sql of sqlVariants) {
    const url = `${DISCODATA_BASE}?query=${encodeURIComponent(sql.trim())}&p=1&nrOfHits=10000`;

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      lastError = await res.text();
      continue;
    }

    const data = await res.json();
    // Check if there are errors in the JSON response
    if (data.errors && data.errors.length > 0) {
      lastError = JSON.stringify(data.errors);
      continue;
    }

    cache.set(queryType, { data, ts: Date.now() });
    return data;
  }

  throw new Error(`All DISCODATA queries failed for ${queryType}. Last error: ${lastError.slice(0, 300)}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');

    if (!type || !QUERIES[type]) {
      return new Response(
        JSON.stringify({
          error: 'Missing or invalid "type" parameter. Use: national-summary, quality-info, non-compliance',
          available: Object.keys(QUERIES),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await fetchDiscodata(type);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (err) {
    console.error('eu-water-quality error:', err);
    return new Response(
      JSON.stringify({ error: err.message, source: 'discodata-proxy' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
