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
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateMin = thirtyDaysAgo.toISOString().split('T')[0];

    // Call Hub'Eau API
    const hubEauUrl = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?date_min_prelevement=${dateMin}&conclusion_conformite_prelevement=N&size=100`;
    
    console.log(`Calling Hub'Eau API: ${hubEauUrl}`);
    
    const response = await fetch(hubEauUrl);

    if (!response.ok) {
      console.error(`Hub'Eau API error: ${response.status} ${response.statusText}`);
      throw new Error(`API Hub'Eau error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`Received ${data.data?.length || 0} results from Hub'Eau API`);

    // Return the data with CORS headers
    return new Response(JSON.stringify(data), {
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
