import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Admin authentication
    const token = req.headers.get("x-admin-token") ?? "";
    const expected = Deno.env.get("ADMIN_DASHBOARD_TOKEN") ?? "";
    if (!expected || !token || token !== expected) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Authentication required',
          message: "Token d'admin requis"
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Mapping des retailers génériques vers les vrais UUIDs
    const retailerMapping = {
      '11111111-1111-1111-1111-111111111111': '53379a4f-6f9e-4047-827c-e63ed985e643', // Carrefour
      '22222222-2222-2222-2222-222222222222': '515d6c6a-ee5f-4837-8bf9-ebc0631bf874', // E.Leclerc  
      '33333333-3333-3333-3333-333333333333': '42ccdcf2-7b85-4aaa-a32b-709f7dea6e2e', // Intermarché
      '44444444-4444-4444-4444-444444444444': 'e8b1cca5-1340-4496-bcc8-926879ff9f9c', // Auchan
      '55555555-5555-5555-5555-555555555555': 'b3db5d57-714b-45b8-afb4-a647ea41346a', // Casino
      '66666666-6666-6666-6666-666666666666': '4caf0a4e-91fc-4c0a-84ac-4291e4e06f95', // Franprix
    };

    let fixedCount = 0;
    let errors: string[] = [];

    // Mettre à jour les retailer_id dans prices_history
    for (const [oldId, newId] of Object.entries(retailerMapping)) {
      try {
        console.log(`Updating retailer_id from ${oldId} to ${newId}`);
        
        const { count, error } = await supabase
          .from('prices_history')
          .update({ retailer_id: newId })
          .eq('retailer_id', oldId);

        if (error) {
          errors.push(`Erreur lors de la mise à jour de ${oldId}: ${error.message}`);
        } else {
          fixedCount += count || 0;
          console.log(`Updated ${count} records for ${oldId} -> ${newId}`);
        }
      } catch (error) {
        errors.push(`Exception lors de la mise à jour de ${oldId}: ${(error as any)?.message || 'Unknown error'}`);
      }
    }

    // Mettre à jour les retailer_id dans prices si nécessaire
    for (const [oldId, newId] of Object.entries(retailerMapping)) {
      try {
        const { count, error } = await supabase
          .from('prices')
          .update({ retailer_id: newId })
          .eq('retailer_id', oldId);

        if (error) {
          errors.push(`Erreur prices table ${oldId}: ${error.message}`);
        } else if (count && count > 0) {
          console.log(`Updated ${count} current prices for ${oldId} -> ${newId}`);
        }
      } catch (error) {
        errors.push(`Exception prices table ${oldId}: ${(error as any)?.message || 'Unknown error'}`);
      }
    }

    // Mettre à jour raw_products si nécessaire
    for (const [oldId, newId] of Object.entries(retailerMapping)) {
      try {
        const { count, error } = await supabase
          .from('raw_products')
          .update({ retailer_id: newId })
          .eq('retailer_id', oldId);

        if (error) {
          errors.push(`Erreur raw_products ${oldId}: ${error.message}`);
        } else if (count && count > 0) {
          console.log(`Updated ${count} raw products for ${oldId} -> ${newId}`);
        }
      } catch (error) {
        errors.push(`Exception raw_products ${oldId}: ${(error as any)?.message || 'Unknown error'}`);
      }
    }

    // Vérifier les statistiques après la correction
    const { data: statsAfter, error: statsError } = await supabase
      .from('prices_history')
      .select('retailer_id, count(*)')
      .in('retailer_id', Object.values(retailerMapping));

    const summary = {
      total_records_fixed: fixedCount,
      errors_count: errors.length,
      errors: errors,
      mapping_applied: retailerMapping,
      stats_after_fix: statsAfter || []
    };

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Correction terminée: ${fixedCount} enregistrements mis à jour`,
        summary,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Retailer mapping fix error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'Internal server error',
        details: (error as any)?.message || 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});