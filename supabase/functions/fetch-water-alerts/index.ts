import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching water alerts from Hub\'Eau API...');
    
    // Calculate date 90 days ago for more data
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const dateMin = ninetyDaysAgo.toISOString().split('T')[0];

    // Key water quality parameters (heavy metals, bacteria, pesticides, nitrates)
    const parameters = '1340,1335,1336,1337,1302,1506,1303,1375,1369,1350,1382,1383,1841';
    
    let allResults: any[] = [];
    
    // Fetch multiple pages to get more results
    for (let page = 1; page <= 3; page++) {
      const hubEauUrl = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?date_min_prelevement=${dateMin}&code_parametre=${parameters}&size=500&page=${page}`;
      
      console.log(`Calling Hub'Eau API (page ${page}): ${hubEauUrl}`);
      
      const response = await fetch(hubEauUrl);

      if (!response.ok) {
        console.error(`Hub'Eau API error: ${response.status} ${response.statusText}`);
        throw new Error(`API Hub'Eau error: ${response.status}`);
      }

      const data = await response.json();
      const pageResults = data.data || [];
      
      console.log(`Page ${page}: received ${pageResults.length} results`);
      
      if (pageResults.length === 0) break;
      
      allResults = allResults.concat(pageResults);
    }
    
    console.log(`Total results before filtering: ${allResults.length}`);
    
    // DIAGNOSTIC: Log sample data
    if (allResults.length > 0) {
      console.log('Sample data (first 5 results):', JSON.stringify(allResults.slice(0, 5), null, 2));
    }
    
    // DIAGNOSTIC: Count results with valid limits
    const withLimits = allResults.filter((r: any) => 
      r.limite_de_qualite_parametre && !isNaN(parseFloat(r.limite_de_qualite_parametre))
    );
    console.log(`Results with valid limits: ${withLimits.length}/${allResults.length}`);
    
    // DIAGNOSTIC: Log sample comparisons
    const comparisons = allResults.slice(0, 10).map((r: any) => ({
      param: r.code_parametre,
      param_name: r.libelle_parametre,
      value: r.resultat_alphanumerique,
      limit: r.limite_de_qualite_parametre,
      exceeds: !isNaN(parseFloat(r.resultat_alphanumerique)) && 
               !isNaN(parseFloat(r.limite_de_qualite_parametre)) &&
               parseFloat(r.resultat_alphanumerique) > parseFloat(r.limite_de_qualite_parametre)
    }));
    console.log('Sample comparisons (first 10):', JSON.stringify(comparisons, null, 2));
    
    // Filter results where measurement exceeds quality limit
    const alerts = allResults.filter((result: any) => {
      const value = parseFloat(result.resultat_alphanumerique);
      const limit = parseFloat(result.limite_de_qualite_parametre);
      
      if (isNaN(value) || isNaN(limit)) return false;
      
      return value > limit;
    });
    
    console.log(`Alerts found after filtering: ${alerts.length}`);

    // Return filtered data with CORS headers
    return new Response(JSON.stringify({ data: alerts }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in fetch-water-alerts function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        data: [] 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
