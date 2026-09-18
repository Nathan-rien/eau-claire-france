import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// France métropolitaine (approximatif)
const DEFAULT_BBOX = { south: 41.0, west: -5.5, north: 51.5, east: 10.0 };

interface OsmNode {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const buildQuery = (s: number, w: number, n: number, e: number) =>
  `[out:json][timeout:90];node["amenity"="drinking_water"](${s},${w},${n},${e});out body;`;

async function fetchTile(
  s: number,
  w: number,
  n: number,
  e: number
): Promise<OsmNode[]> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(buildQuery(s, w, n, e))}`,
    });
    if (res.ok) {
      const data = await res.json();
      return (data.elements || []).filter(
        (el: OsmNode) => typeof el.lat === 'number' && typeof el.lon === 'number'
      );
    }
    // 429 / 504 : respecter la limite d'usage de l'API publique
    console.warn(`Overpass ${res.status} on tile ${s},${w},${n},${e}`);
    await sleep(3000 * (attempt + 1));
  }
  return [];
}

function potabilite(tags: Record<string, string> = {}) {
  if (tags.drinking_water === 'yes') return 'declare_potable';
  if (tags.drinking_water === 'no') return 'declare_non_potable';
  return 'non_verifie';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // --- Authentification : administrateur connecté uniquement ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ ok: false, error: 'Unauthorized' }, 401);
    }
    const token = authHeader.replace('Bearer ', '');
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } =
      await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return json({ ok: false, error: 'Unauthorized' }, 401);
    }
    const userId = claimsData.claims.sub as string;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });
    const { data: isAdmin, error: roleError } = await admin.rpc(
      'has_admin_role',
      { check_user_id: userId }
    );
    if (roleError) {
      console.error('Role check failed:', roleError);
      return json({ ok: false, error: 'Role check failed' }, 500);
    }
    if (!isAdmin) {
      return json({ ok: false, error: 'Forbidden' }, 403);
    }

    // --- Paramètres ---
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const bbox = { ...DEFAULT_BBOX, ...(body.bbox as object | undefined) };
    const gridRaw = Number(body.grid ?? 4);
    const grid = Number.isFinite(gridRaw)
      ? Math.min(8, Math.max(1, Math.round(gridRaw)))
      : 4;

    const latStep = (bbox.north - bbox.south) / grid;
    const lngStep = (bbox.east - bbox.west) / grid;

    const nodes = new Map<number, OsmNode>();
    let tilesQueried = 0;

    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const s = bbox.south + i * latStep;
        const n = s + latStep;
        const w = bbox.west + j * lngStep;
        const e = w + lngStep;

        if (tilesQueried > 0) await sleep(1100); // >= 1s entre deux requêtes
        const tileNodes = await fetchTile(s, w, n, e);
        tilesQueried++;
        tileNodes.forEach((el) => nodes.set(el.id, el));
        console.log(
          `Tile ${tilesQueried}/${grid * grid}: ${tileNodes.length} nodes (total ${nodes.size})`
        );
      }
    }

    const totalReceived = nodes.size;

    // --- Points déjà connus (pour distinguer créés / mis à jour) ---
    const refs = [...nodes.keys()].map((id) => `osm:${id}`);
    const existing = new Set<string>();
    for (let i = 0; i < refs.length; i += 1000) {
      const chunk = refs.slice(i, i + 1000);
      const { data, error } = await admin
        .from('water_points')
        .select('source_ref')
        .in('source_ref', chunk);
      if (error) throw error;
      (data || []).forEach((r) => r.source_ref && existing.add(r.source_ref));
    }

    const rows = [...nodes.values()].map((el) => {
      const tags = el.tags || {};
      return {
        source_ref: `osm:${el.id}`,
        type: 'fontaine_publique',
        latitude: el.lat,
        longitude: el.lon,
        description: tags.name ? tags.name.slice(0, 1000) : null,
        accessibilite: tags.opening_hours
          ? tags.opening_hours.slice(0, 500)
          : null,
        statut_potabilite: potabilite(tags),
        source_donnee: 'import_osm',
        statut_moderation: 'valide',
        derniere_verification_at: new Date().toISOString(),
      };
    });

    let upserted = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error } = await admin
        .from('water_points')
        .upsert(chunk, { onConflict: 'source_ref' });
      if (error) throw error;
      upserted += chunk.length;
    }

    const updated = rows.filter((r) => existing.has(r.source_ref)).length;
    const created = upserted - updated;

    return json({
      ok: true,
      total_received: totalReceived,
      created,
      updated,
      tiles_queried: tilesQueried,
    });
  } catch (error) {
    console.error('OSM import error:', error);
    return json(
      { ok: false, error: (error as Error)?.message || 'Unknown error' },
      500
    );
  }
});
