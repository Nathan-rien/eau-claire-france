import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Fixing retailer mappings...')

    // Create proper retailer mappings for the simulated data
    const retailerMappings = [
      { id: '11111111-1111-1111-1111-111111111111', name: 'Carrefour', slug: 'carrefour', domain: 'carrefour.fr' },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Auchan', slug: 'auchan', domain: 'auchan.fr' },
      { id: '33333333-3333-3333-3333-333333333333', name: 'E.Leclerc', slug: 'leclerc', domain: 'e.leclerc' },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Intermarché', slug: 'intermarche', domain: 'intermarche.com' },
      { id: '55555555-5555-5555-5555-555555555555', name: 'Casino', slug: 'casino', domain: 'casino.fr' },
      { id: '66666666-6666-6666-6666-666666666666', name: 'Monoprix', slug: 'monoprix', domain: 'monoprix.fr' }
    ]

    let updated = 0
    // Insert or update retailer mappings
    for (const retailer of retailerMappings) {
      const { error } = await supabase
        .from('retailers')
        .upsert({
          id: retailer.id,
          name: retailer.name,
          slug: retailer.slug,
          domain: retailer.domain,
          status: 'active',
          search_url_template: `https://www.${retailer.domain}/recherche?q={query}`
        }, {
          onConflict: 'id'
        })

      if (!error) {
        updated++
        console.log(`✓ Updated retailer: ${retailer.name}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Retailer mappings updated. ${updated} retailers processed.`,
        retailers_updated: updated
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error fixing retailers:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})