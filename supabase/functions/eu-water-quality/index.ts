const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Placeholder edge function for EU water quality data.
// Currently returns info about available data sources.
// Ready to proxy real APIs when EEA WISE_DWD becomes available on DISCODATA,
// or when Eurostat drinking water datasets are published.

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get('type');

  // For now, return metadata about the data sources we've investigated
  const response = {
    status: 'csv-fallback',
    message: 'EU drinking water quality data is served from local CSV files. External API integration is pending.',
    availableSources: {
      'eea-discodata': {
        url: 'https://discodata.eea.europa.eu',
        status: 'WISE_DWD dataset not publicly available on DISCODATA SQL endpoint',
      },
      'sdg6': {
        url: 'https://sdg6data.org/api/indicator/6.1.1',
        status: 'Available but returns mixed series, not specific drinking water quality metrics',
      },
      'eurostat': {
        url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/',
        status: 'Potential source for water abstraction/treatment data, requires specific dataset codes',
      },
    },
    csvFiles: [
      '/data/eu/wise_dwd_quality.csv',
      '/data/eu/eu_pollutants_by_country.csv',
    ],
    requestedType: type,
  };

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
