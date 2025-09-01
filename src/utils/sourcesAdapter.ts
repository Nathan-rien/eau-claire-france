import { normalize, key } from './normalize';
import type { Composition } from '@/services/waterData';

export type SourceItem = {
  source_id: string;
  source_name: string;
  location?: string;
  brands: string[];
  is_sparkling_mix?: boolean;
  count_brands: number;
  
  // Coordonnées géographiques
  latitude?: number;
  longitude?: number;
  
  // Catégorie d'eau (depuis CSV coordonnées)
  water_category?: string;
  
  // Champs techniques (depuis composition)
  flow_rate?: number;     // m³/j
  depth?: number;         // m
  temperature?: number;   // °C
  residue?: number;       // mg/L (residu_sec_180_mg_L)
};

type CoordRow = {
  source_name: string;
  brand: string;
  commune: string;
  department: string;
  latitude: string;
  longitude: string;
  category: string;
};

export async function buildSources(): Promise<SourceItem[]> {
  console.log('[buildSources] START');
  const log = (...args: any[]) => console.log('[buildSources]', ...args);

  // 1) Charger CSV
  const [coordsText, catalogText, compText] = await Promise.all([
    fetch('/data/water_sources_coordinates.csv').then(r => r.text()),
    fetch('/data/infoeau_catalog_eaux_v3.csv').then(r => r.text()).catch(() => ''),
    fetch('/data/infoeau_emn_composition_v2_partial.csv').then(r => r.text()).catch(() => ''),
  ]);

  console.log('[buildSources] CSV loaded, lengths:', coordsText.length, catalogText.length, compText.length);

  const parseCsv = (txt: string, separator = ';') => {
    const lines = txt.split(/\r?\n/).slice(1).map(l => l.trim()).filter(Boolean);
    console.log(`[parseCsv] Found ${lines.length} lines`);
    if (lines.length > 0) console.log(`[parseCsv] First line: "${lines[0]}"`);
    return lines.map(l => l.split(separator).map(p => p.trim()));
  };

  const coordsRows = parseCsv(coordsText, ';'); // water_sources_coordinates.csv utilise ';'
  const catalogRows = catalogText ? parseCsv(catalogText, ',') : []; // catalog utilise ','
  const compRows = compText ? parseCsv(compText, ',') : []; // composition utilise ','

  log('rows:', { coords: coordsRows.length, catalog: catalogRows.length, comp: compRows.length });

  // 2) Index coordonnées
  const coordsIndex = new Map<string, {lat: number; lng: number; category: string; raw: any}>();
  let idxCount = 0;

  for (const parts of coordsRows) {
    const [source_name, brand, commune, department, lat, lng, category] = parts as unknown as string[];
    const latN = Number(lat); 
    const lngN = Number(lng);
    if (!Number.isFinite(latN) || !Number.isFinite(lngN)) continue;

    const payload = { lat: latN, lng: lngN, category, raw: { source_name, brand, commune, department } };
    const keys = new Set<string>([
      key(source_name, brand, commune),
      key(source_name, commune),
      key(brand, commune),
      key(source_name),
      key(brand),
    ]);
    for (const k of keys) {
      if (!k) continue;
      coordsIndex.set(k, payload);
      idxCount++;
    }
  }
  log('coordsIndex size:', coordsIndex.size, 'assignments:', idxCount);

  // 3) Index composition (colonnes: brand, source_name, location, is_sparkling, pH, HCO3_mg_L, Ca_mg_L, Cl_mg_L, F_mg_L, Mg_mg_L, NO3_mg_L, K_mg_L, SiO2_mg_L, Na_mg_L, SO4_mg_L, residu_sec_180_mg_L, source_url)
  const compIndex = new Map<string, { residue?: number; flow_rate?: number; depth?: number; temperature?: number }>();
  let compHits = 0;
  for (const parts of compRows) {
    // Adapter selon l'ordre réel des colonnes du CSV composition
    const [brand, source_name, location, is_sparkling, pH, HCO3, Ca, Cl, F, Mg, NO3, K, SiO2, Na, SO4, residu_sec_180, source_url] = parts as unknown as string[];
    const meta = {
      residue: residu_sec_180 ? Number(residu_sec_180) : undefined,
      flow_rate: undefined, // pas dans ce CSV
      depth: undefined,     // pas dans ce CSV  
      temperature: undefined, // pas dans ce CSV
    };
    const k1 = key(source_name, brand, location);
    const k2 = key(source_name, location);
    const k3 = key(brand, location);
    const k4 = key(source_name);
    const k5 = key(brand);
    for (const k of [k1,k2,k3,k4,k5]) {
      if (k) { 
        compIndex.set(k, meta); 
        compHits++; 
        break; 
      }
    }
  }
  log('compIndex size:', compIndex.size, 'assignments:', compHits);

  // 4) Construire la liste finale depuis le CSV coordonnées (source minimale)
  const items: SourceItem[] = [];
  let i = 0, withComp = 0;

  for (const parts of coordsRows) {
    const [source_name, brand, commune, department, lat, lng, rawCategory] = parts as unknown as string[];
    console.log('[buildSources] Processing row:', { source_name, brand, commune, department, lat, lng, rawCategory });
    const latN = Number(lat); 
    const lngN = Number(lng);
    console.log('[buildSources] Converted coordinates:', { latN, lngN, isFinite: Number.isFinite(latN) && Number.isFinite(lngN) });
    if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
      console.log('[buildSources] SKIPPING row due to invalid coordinates');
      continue;
    }

    const k = key(source_name, brand, commune) || key(source_name, commune) || key(brand, commune) || key(source_name) || key(brand);

    // Catégorie lisible
    const mapCategory = (c?: string) => {
      const v = (c ?? '').toLowerCase();
      if (v === 'emn' || v.includes('minérale') && !v.includes('gazeuse')) return 'Eau minérale naturelle';
      if (v.includes('gazeuse')) return 'Eau minérale naturelle gazeuse';
      if (v.includes('source')) return 'Eau de source';
      return 'Eau minérale naturelle'; // défaut raisonnable
    };

    // Métadonnées techniques si disponibles
    const meta = (k && compIndex.get(k)) || {};

    items.push({
      source_id: `src_${i++}`,
      source_name,
      location: `${commune}, ${department}`,
      brands: brand ? [brand] : [],
      count_brands: brand ? 1 : 0,
      is_sparkling_mix: mapCategory(rawCategory) === 'Eau minérale naturelle gazeuse',
      latitude: latN,
      longitude: lngN,
      water_category: mapCategory(rawCategory),
      residue: meta.residue,
      flow_rate: meta.flow_rate,
      depth: meta.depth,
      temperature: meta.temperature,
    });

    if (meta && (meta.residue || meta.flow_rate || meta.depth || meta.temperature)) withComp++;
  }

  log('built items:', items.length, 'with technical meta:', withComp);

  return items;
}