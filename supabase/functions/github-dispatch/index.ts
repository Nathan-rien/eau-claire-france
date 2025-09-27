import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowDispatchPayload {
  event_type: string;
  client_payload?: {
    retailers?: string;
    brands?: string;
    formats?: string;
    maxPages?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { retailers, brands, formats, maxPages } = await req.json();
    
    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN_REPO');
    const GITHUB_REPO = Deno.env.get('GITHUB_REPO') || 'YOUR_USERNAME/YOUR_REPO';
    
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN_REPO secret not configured');
    }

    // Trigger GitHub workflow dispatch
    const dispatchPayload: WorkflowDispatchPayload = {
      event_type: 'scrape_prices',
      client_payload: {
        retailers: retailers || 'carrefour,auchan,leclerc,intermarche,u,monoprix',
        brands: brands || 'evian,cristaline,volvic,hepar,contrex,perrier,vittel',
        formats: formats || '0,5 l,1 l,1,5 l',
        maxPages: maxPages || '3'
      }
    };

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'InfoEau-Scraper'
      },
      body: JSON.stringify(dispatchPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${error}`);
    }

    console.log('GitHub workflow dispatch triggered successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Scraping workflow triggered via GitHub Actions',
        payload: dispatchPayload
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error triggering GitHub workflow:', error);
    
    return new Response(
      JSON.stringify({ 
        error: (error as any)?.message || 'Unknown error',
        hint: 'Check GITHUB_TOKEN_REPO secret and repository configuration' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});