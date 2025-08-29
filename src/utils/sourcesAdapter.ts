import type { Composition } from "@/services/waterData";

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
  water_category?: string; // 'EMN' | 'Eau de source'
  
  // Champs techniques (depuis composition)
  flow_rate?: number;     // m³/j
  depth?: number;         // m
  temperature?: number;   // °C
  residue?: number;       // mg/L (residu_sec_180_mg_L)
};

// Type pour les coordonnées depuis le CSV
type CoordinateData = {
  source_name: string;
  brand: string;
  commune: string;
  department: string;
  latitude: number;
  longitude: number;
  category: string;
};

function hashSource(name?: string, loc?: string) {
  const n = (name ?? "").trim().toLowerCase();
  const l = (loc ?? "").trim().toLowerCase();
  return `SRC-${n.replace(/\s+/g, "-")}-${l.replace(/\s+/g, "-")}`.replace(/[^a-z0-9\-]/g, "");
}

// Fonction pour charger et parser le CSV des coordonnées
async function loadCoordinatesData(): Promise<CoordinateData[]> {
  try {
    const response = await fetch('/data/water_sources_coordinates.csv');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).slice(1).map(l => l.trim()).filter(Boolean);
    
    const coordinateData: CoordinateData[] = [];
    
    for (const line of lines) {
      const parts = line.split(';').map(p => p.trim());
      if (parts.length < 7) continue;
      
      const [source_name, brand, commune, department, latRaw, lngRaw, category] = parts;
      const latitude = parseFloat(latRaw);
      const longitude = parseFloat(lngRaw);
      
      if (isNaN(latitude) || isNaN(longitude)) continue;
      
      coordinateData.push({
        source_name,
        brand,
        commune,
        department,
        latitude,
        longitude,
        category
      });
    }
    
    return coordinateData;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des coordonnées:', error);
    return [];
  }
}

// Fonction pour normaliser les noms pour la correspondance
function normalize(s: string): string {
  return s?.toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ') || '';
}

// Fonction pour trouver les coordonnées d'une source
function findCoordinates(sourceName: string, brands: string[], location: string, coordinatesData: CoordinateData[]): { latitude?: number, longitude?: number, category?: string } {
  const normalizedSourceName = normalize(sourceName);
  const normalizedLocation = normalize(location);
  const normalizedBrands = brands.map(normalize);
  
  // 1. Recherche exacte par nom de source
  let match = coordinatesData.find(coord => 
    normalize(coord.source_name) === normalizedSourceName
  );
  
  if (match) {
    return { latitude: match.latitude, longitude: match.longitude, category: match.category };
  }
  
  // 2. Recherche par marque
  for (const normalizedBrand of normalizedBrands) {
    match = coordinatesData.find(coord => 
      normalize(coord.brand) === normalizedBrand
    );
    if (match) {
      return { latitude: match.latitude, longitude: match.longitude, category: match.category };
    }
  }
  
  // 3. Recherche partielle par nom de source
  match = coordinatesData.find(coord => {
    const coordSourceName = normalize(coord.source_name);
    return coordSourceName.includes(normalizedSourceName) || normalizedSourceName.includes(coordSourceName);
  });
  
  if (match) {
    return { latitude: match.latitude, longitude: match.longitude, category: match.category };
  }
  
  // 4. Recherche partielle par marque
  for (const normalizedBrand of normalizedBrands) {
    match = coordinatesData.find(coord => {
      const coordBrand = normalize(coord.brand);
      return coordBrand.includes(normalizedBrand) || normalizedBrand.includes(coordBrand);
    });
    if (match) {
      return { latitude: match.latitude, longitude: match.longitude, category: match.category };
    }
  }
  
  return {};
}

/** Agrège les captages depuis composition + complète avec le catalogue + coordonnées */
export async function buildSources(
  composition: Composition[] = [],
  catalog: Record<string, string>[] = []
): Promise<SourceItem[]> {
  const byKey = new Map<string, SourceItem>();
  
  // Charger les données de coordonnées
  const coordinatesData = await loadCoordinatesData();
  console.log(`📍 ${coordinatesData.length} coordonnées chargées`);

  // Traitement des données de composition
  for (const r of composition) {
    const source = (r.source_name ?? "").trim();
    if (!source) continue;
    const loc = (r.location ?? "").trim();
    const brand = (r.brand ?? "").trim();
    const key = hashSource(source, loc);

    if (!byKey.has(key)) {
      // Rechercher les coordonnées pour cette source
      const coords = findCoordinates(source, brand ? [brand] : [], loc, coordinatesData);
      
      byKey.set(key, {
        source_id: key,
        source_name: source,
        location: loc || undefined,
        brands: [],
        is_sparkling_mix: false,
        count_brands: 0,
        latitude: coords.latitude,
        longitude: coords.longitude,
        water_category: coords.category,
        // Données techniques depuis la composition
        residue: typeof r.residu_sec_180_mg_L === 'number' ? r.residu_sec_180_mg_L : undefined,
      });
    }
    const item = byKey.get(key)!;
    if (brand && !item.brands.includes(brand)) {
      item.brands.push(brand);
      // Mettre à jour les coordonnées si on a une nouvelle marque
      if (!item.latitude || !item.longitude) {
        const coords = findCoordinates(source, item.brands, item.location || '', coordinatesData);
        if (coords.latitude && coords.longitude) {
          item.latitude = coords.latitude;
          item.longitude = coords.longitude;
          item.water_category = coords.category;
        }
      }
    }
    if (r.is_sparkling === true || r.is_sparkling === "true") item.is_sparkling_mix = true;
  }

  // Traitement des données du catalogue
  for (const c of catalog) {
    const source = (c.source_name ?? "").trim();
    if (!source) continue;
    const key = hashSource(source, "");
    const brand = (c.brand ?? "").trim();
    
    if (!byKey.has(key)) {
      const coords = findCoordinates(source, brand ? [brand] : [], '', coordinatesData);
      
      byKey.set(key, {
        source_id: key,
        source_name: source,
        location: undefined,
        brands: [],
        is_sparkling_mix: false,
        count_brands: 0,
        latitude: coords.latitude,
        longitude: coords.longitude,
        water_category: coords.category,
      });
    }
    const item = byKey.get(key)!;
    if (brand && !item.brands.includes(brand)) {
      item.brands.push(brand);
      // Mettre à jour les coordonnées si on a une nouvelle marque
      if (!item.latitude || !item.longitude) {
        const coords = findCoordinates(source, item.brands, item.location || '', coordinatesData);
        if (coords.latitude && coords.longitude) {
          item.latitude = coords.latitude;
          item.longitude = coords.longitude;
          item.water_category = coords.category;
        }
      }
    }
    if ((c.variant ?? "").toLowerCase() === "gazeuse") item.is_sparkling_mix = true;
  }

  const result = Array.from(byKey.values())
    .map(s => ({ ...s, count_brands: s.brands.length }))
    .sort((a, b) => (b.count_brands - a.count_brands) || a.source_name.localeCompare(b.source_name));
    
  console.log(`✅ ${result.length} sources construites, ${result.filter(s => s.latitude && s.longitude).length} avec coordonnées`);
  
  return result;
}