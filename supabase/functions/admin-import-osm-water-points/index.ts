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
const DEFAULT_GRID = 6; // 36 sous-zones : évite les timeouts Overpass
const DEFAULT_TILES_PER_RUN = 4;

interface OsmNode {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const buildQuery = (s: number, w: number, n: number, e: number) =>
  `[out:json][timeout:120];node["amenity"="drinking_water"](${s},${w},${n},${e});out body;`;

async function fetchTile(
  s: number,
  w: number,
  n: number,
  e: number
): Promise<OsmNode[]> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Overpass refuse les requêtes sans User-Agent identifiable (406)
          'User-Agent': 'infoeau.fr water-points import/1.0',
        },
        body: `data=${encodeURIComponent(buildQuery(s, w, n, e))}`,
      });
      if (res.ok) {
        const data = await res.json();
        return (data.elements || []).filter(
          (el: OsmNode) =>
            typeof el.lat === 'number' && typeof el.lon === 'number'
        );
      }
      console.warn(`Overpass ${res.status} on tile ${s},${w},${n},${e}`);
    } catch (err) {
      console.warn('Overpass fetch failed:', (err as Error)?.message);
    }
    // Respecte la limite d'usage de l'API publique avant de réessayer
    await sleep(2000 * (attempt + 1));
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
    const clamp = (v: unknown, def: number, min: number, max: number) => {
      const n = Number(v ?? def);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : def;
    };
    const grid = clamp(body.grid, DEFAULT_GRID, 1, 10);
    const totalTiles = grid * grid;
    const tileStart = clamp(body.tile_start, 0, 0, totalTiles - 1);
    const tileCount = clamp(
      body.tile_count,
      DEFAULT_TILES_PER_RUN,
      1,
      totalTiles
    );
    const tileEnd = Math.min(totalTiles, tileStart + tileCount);

    const latStep = (bbox.north - bbox.south) / grid;
    const lngStep = (bbox.east - bbox.west) / grid;

    let totalReceived = 0;
    let created = 0;
    let updated = 0;
    let tilesQueried = 0;

    for (let t = tileStart; t < tileEnd; t++) {
      const i = Math.floor(t / grid);
      const j = t % grid;
      const s = bbox.south + i * latStep;
      const n = s + latStep;
      const w = bbox.west + j * lngStep;
      const e = w + lngStep;

      if (tilesQueried > 0) await sleep(1100); // >= 1s entre deux requêtes
      const nodes = await fetchTile(s, w, n, e);
      tilesQueried++;
      totalReceived += nodes.length;
      console.log(`Tile ${t + 1}/${totalTiles}: ${nodes.length} nodes`);

      if (nodes.length === 0) continue;

      const rows = nodes.map((el) => {
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

      // Points déjà connus (pour distinguer créés / mis à jour)
      const existing = new Set<string>();
      for (let k = 0; k < rows.length; k += 800) {
        const refs = rows.slice(k, k + 800).map((r) => r.source_ref);
        const { data, error } = await admin
          .from('water_points')
          .select('source_ref')
          .in('source_ref', refs);
        if (error) throw error;
        (data || []).forEach((r) => r.source_ref && existing.add(r.source_ref));
      }

      for (let k = 0; k < rows.length; k += 500) {
        const chunk = rows.slice(k, k + 500);
        const { error } = await admin
          .from('water_points')
          .upsert(chunk, { onConflict: 'source_ref' });
        if (error) throw error;
      }

      const tileUpdated = rows.filter((r) => existing.has(r.source_ref)).length;
      updated += tileUpdated;
      created += rows.length - tileUpdated;
    }

    const nextTile = tileEnd < totalTiles ? tileEnd : null;

    return json({
      ok: true,
      total_received: totalReceived,
      created,
      updated,
      grid,
      tiles_queried: tilesQueried,
      tile_start: tileStart,
      next_tile: nextTile,
      done: nextTile === null,
    });
  } catch (error) {
    console.error('OSM import error:', error);
    return json(
      { ok: false, error: (error as Error)?.message || 'Unknown error' },
      500
    );
  }
});
