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
    
    // Predefined thresholds for key parameters (when limite_qualite_parametre is null)
    const PREDEFINED_THRESHOLDS: Record<string, { limit: number; unit: string; name: string }> = {
      '1340': { limit: 50, unit: 'mg/L', name: 'Nitrates' },           // Nitrates
      '1335': { limit: 0.1, unit: 'mg/L', name: 'Ammonium' },          // Ammonium
      '1382': { limit: 0.1, unit: 'µg/L', name: 'Pesticides totaux' }, // Total pesticides
      '1383': { limit: 0.5, unit: 'µg/L', name: 'Pesticides' },        // Individual pesticides
      '1375': { limit: 10, unit: 'µg/L', name: 'Plomb' },              // Lead
      '1369': { limit: 5, unit: 'µg/L', name: 'Cuivre' },              // Copper
      '1350': { limit: 200, unit: 'µg/L', name: 'Aluminium' },         // Aluminum
      '1841': { limit: 1, unit: 'µg/L', name: 'Arsenic' },             // Arsenic
    };
    
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
    
    // Filter results using multiple detection criteria
    const alerts = allResults.filter((result: any) => {
      // Criterion 1: Non-conformity detected in conclusion
      const hasNonConformity = result.conclusion_conformite_prelevement && 
        !result.conclusion_conformite_prelevement.toLowerCase().includes('conforme');
      
      if (hasNonConformity) {
        console.log('Non-conformity found:', {
          city: result.nom_commune,
          param: result.libelle_parametre,
          conclusion: result.conclusion_conformite_prelevement
        });
        return true;
      }
      
      // Criterion 2: Check conformity flags
      const hasLimitNonConformity = result.conformite_limites_bact_prelevement === 'N' || 
                                     result.conformite_limites_pc_prelevement === 'N';
      const hasRefNonConformity = result.conformite_references_bact_prelevement === 'N' || 
                                   result.conformite_references_pc_prelevement === 'N';
      
      if (hasLimitNonConformity || hasRefNonConformity) {
        console.log('Conformity flag issue:', {
          city: result.nom_commune,
          param: result.libelle_parametre,
          limitConf: result.conformite_limites_pc_prelevement,
          refConf: result.conformite_references_pc_prelevement
        });
        return true;
      }
      
      // Criterion 3: Value exceeds official limit (if present)
      const value = parseFloat(result.resultat_alphanumerique);
      const limit = parseFloat(result.limite_de_qualite_parametre);
      
      if (!isNaN(value) && !isNaN(limit) && value > limit) {
        console.log('Exceeds official limit:', {
          city: result.nom_commune,
          param: result.libelle_parametre,
          value,
          limit
        });
        return true;
      }
      
      // Criterion 4: Check against predefined thresholds
      const paramCode = result.code_parametre;
      if (PREDEFINED_THRESHOLDS[paramCode] && !isNaN(value)) {
        const threshold = PREDEFINED_THRESHOLDS[paramCode];
        if (value > threshold.limit) {
          console.log('Exceeds predefined threshold:', {
            city: result.nom_commune,
            param: result.libelle_parametre,
            value,
            threshold: threshold.limit,
            unit: threshold.unit
          });
          return true;
        }
      }
      
      return false;
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
