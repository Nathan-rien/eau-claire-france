import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type DebugRunResult = {
  ok: boolean;
  retailer: string;
  items_found: number;
  items_saved: number;
  error_rate: number;
  started_at: string;
  finished_at: string;
  message?: string;
  debug?: {
    debug_enabled: boolean;
    headful: boolean;
    slowMoMs?: number;
    debug_files?: string[]; // best-effort; files exist only for CLI runs
    hints?: string[];
  };
};

class SimpleScraper {
  constructor(private retailerSlug: string) {}
  async scrape(options: { brands: string[]; format: string; maxPages: number }) {
    console.log(`Mock scraping ${this.retailerSlug} for brands: ${options.brands.join(', ')}`);
    await new Promise(r => setTimeout(r, 800));
    const mockItems = options.brands.map((brand, index) => ({
      brand,
      product_name: `${brand} ${options.format}`,
      price_total_eur: 1.50 + (index * 0.25),
      total_volume_l: options.format === '1,5 l' ? 1.5 : 0.5,
      unit_volume_l: options.format === '1,5 l' ? 1.5 : 0.5,
      pack_count: 1,
      price_per_l_eur: null,
      is_promo: false,
      availability: 'in_stock',
      url: `https://example.com/${brand.toLowerCase()}`,
      image_url: null,
      sku: `${brand}-${options.format}`,
      promo_label: null,
    }));
    return mockItems;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const started_at = new Date().toISOString();
  try {
    const url = new URL(req.url);
    const body = req.headers.get('content-type')?.includes('application/json') ? await req.json() : {};
    const retailer = body.retailer || url.searchParams.get('retailer') || 'carrefour';
    const debug = (body.debug ?? url.searchParams.get('debug')) ? true : false;
    const headful = (body.headful ?? url.searchParams.get('headful')) ? true : false;
    const slowMoMs = body.slowMoMs ? Number(body.slowMoMs) : undefined;

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      const res: DebugRunResult = {
        ok: false,
        retailer,
        items_found: 0,
        items_saved: 0,
        error_rate: 1,
        started_at,
        finished_at: new Date().toISOString(),
        message: 'La clé service (écriture) est absente. Ouvrez README > Configuration et collez la clé.',
      };
      return new Response(JSON.stringify(res), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: retailerRow } = await service.from('retailers').select('id, slug, name').eq('slug', retailer).single();
    if (!retailerRow) {
      const res: DebugRunResult = {
        ok: false,
        retailer,
        items_found: 0,
        items_saved: 0,
        error_rate: 1,
        started_at,
        finished_at: new Date().toISOString(),
        message: `Enseigne inconnue: ${retailer}`,
      };
      return new Response(JSON.stringify(res), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: run } = await service.from('runs').insert({ retailer_id: retailerRow.id, status: 'running', notes: 'Admin debug run' }).select().single();

    const brands = ['Evian', 'Cristaline'];
    const format = '1,5 l';
    const scraper = new SimpleScraper(retailerRow.slug);
    const items = await scraper.scrape({ brands, format, maxPages: 1 });

    const processed = items.map(item => ({
      retailer_id: retailerRow.id,
      run_id: run!.id,
      brand: item.brand,
      product_name: item.product_name,
      price_total_eur: item.price_total_eur,
      total_volume_l: item.total_volume_l,
      unit_volume_l: item.unit_volume_l,
      pack_count: item.pack_count,
      price_per_l_eur: item.price_per_l_eur ?? (item.price_total_eur && item.total_volume_l ? Math.round((item.price_total_eur / item.total_volume_l) * 10000) / 10000 : null),
      is_promo: item.is_promo,
      availability: 'in_stock',
      url: item.url,
      image_url: item.image_url,
      sku: item.sku,
      promo_label: item.promo_label,
      unique_hash: `${retailerRow.slug}-${item.brand}-${item.product_name}-${Date.now()}`.substring(0, 64),
      scraped_at: new Date().toISOString(),
    }));

    const { error: insErr } = await service.from('prices').insert(processed);
    let saved = 0;
    if (!insErr) {
      saved = processed.length;
      await service.from('prices_history').insert(processed.map(p => ({ ...p, id: undefined })));
    }

    const finished_at = new Date().toISOString();
    const res: DebugRunResult = {
      ok: saved > 0,
      retailer: retailerRow.slug,
      items_found: items.length,
      items_saved: saved,
      error_rate: items.length > 0 ? (items.length - saved) / items.length : 1,
      started_at,
      finished_at,
      message: saved > 0 ? 'Run debug réussi' : (insErr ? 'La base refuse l’écriture (RLS). Appliquez les migrations RLS ou activez le rôle service.' : 'Aucun produit détecté. Les sélecteurs doivent être mis à jour.'),
      debug: {
        debug_enabled: debug,
        headful,
        slowMoMs,
        debug_files: [],
        hints: saved === 0 ? [
          'Probable : cookies non acceptés / magasin non sélectionné / sélecteurs obsolètes',
        ] : []
      }
    };

    await service.from('runs').update({ status: saved > 0 ? 'success' : 'failed', finished_at }).eq('id', run!.id);

    return new Response(JSON.stringify(res), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const res: DebugRunResult = {
      ok: false,
      retailer: 'unknown',
      items_found: 0,
      items_saved: 0,
      error_rate: 1,
      started_at,
      finished_at: new Date().toISOString(),
      message: 'Erreur lors du run debug: ' + (e as Error).message,
    };
    return new Response(JSON.stringify(res), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});