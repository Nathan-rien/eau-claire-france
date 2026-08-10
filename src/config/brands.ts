// Configuration des marques avec synonymes et variantes
export const BRAND_CONFIG = {
  // Marques principales avec leurs variantes
  brands: {
    'Evian': {
      variants: ['evian', 'évian'],
      type: 'mineral',
      source: 'Cachat'
    },
    'Volvic': {
      variants: ['volvic'],
      type: 'mineral',
      source: 'Volvic'
    },
    'Cristaline': {
      variants: ['cristaline', 'cristalline'],
      type: 'spring',
      source: 'Multi-sources'
    },
    'Hépar': {
      variants: ['hepar', 'hépar'],
      type: 'mineral',
      source: 'Hépar'
    },
    'Contrex': {
      variants: ['contrex'],
      type: 'mineral',
      source: 'Contrexéville'
    },
    'Vittel': {
      variants: ['vittel'],
      type: 'mineral',
      source: 'Vittel'
    },
    'Badoit': {
      variants: ['badoit'],
      type: 'mineral_sparkling',
      source: 'Saint-Galmier'
    },
    'Perrier': {
      variants: ['perrier'],
      type: 'mineral_sparkling',
      source: 'Les Bouillens'
    },
    'Saint-Amand': {
      variants: ['saint-amand', 'saint amand', 'st-amand'],
      type: 'mineral_sparkling',
      source: 'Saint-Amand-les-Eaux'
    },
    'Mont Roucous': {
      variants: ['mont roucous', 'montroucous'],
      type: 'spring',
      source: 'Mont Roucous'
    },
    'Quézac': {
      variants: ['quezac', 'quézac'],
      type: 'mineral_sparkling',
      source: 'Quézac'
    },
    'Salvetat': {
      variants: ['salvetat', 'la salvetat'],
      type: 'mineral_sparkling',
      source: 'La Salvetat'
    },
    'Arvie': {
      variants: ['arvie'],
      type: 'mineral_sparkling',
      source: 'Arvie (Auvergne)'
    },
    'Courmayeur': {
      variants: ['courmayeur'],
      type: 'mineral',
      source: 'Courmayeur (Val d\'Aoste)'
    },
    'Plancoët': {
      variants: ['plancoet', 'plancoët'],
      type: 'mineral',
      source: 'Sassay (Plancoët)'
    },
    'Rozana': {
      variants: ['rozana'],
      type: 'mineral_sparkling',
      source: 'Rouzat'
    },
    'Saint-Yorre': {
      variants: ['saint-yorre', 'saint yorre', 'st-yorre'],
      type: 'mineral_sparkling',
      source: 'Saint-Yorre (Vichy)'
    },
    'San Pellegrino': {
      variants: ['san pellegrino', 'sanpellegrino', 's.pellegrino'],
      type: 'mineral_sparkling',
      source: 'San Pellegrino Terme'
    },
    'Thonon': {
      variants: ['thonon', 'thonon-les-bains'],
      type: 'mineral',
      source: 'La Versoie (Thonon-les-Bains)'
    },
    'Vichy Célestins': {
      variants: ['vichy celestins', 'vichy célestins', 'vichy-celestins'],
      type: 'mineral_sparkling',
      source: 'Les Célestins (Vichy)'
    },
    'Wattwiller': {
      variants: ['wattwiller'],
      type: 'mineral',
      source: 'Wattwiller'
    }
  },

  // Marques de distributeur (MDD)
  mdd: {
    'Carrefour': {
      variants: ['carrefour', 'carrefour bio'],
      retailers: ['carrefour']
    },
    'Leclerc': {
      variants: ['leclerc', 'e.leclerc', 'e-leclerc', 'marque repère'],
      retailers: ['leclerc']
    },
    'Intermarché': {
      variants: ['intermarche', 'intermarché'],
      retailers: ['intermarche']
    },
    'U': {
      variants: ['marque u', 'u', 'système u', 'eco+'],
      retailers: ['coursesu']
    },
    'Casino': {
      variants: ['casino'],
      retailers: ['casino']
    },
    'Monoprix': {
      variants: ['monoprix'],
      retailers: ['monoprix']
    },
    'Auchan': {
      variants: ['auchan'],
      retailers: ['auchan']
    }
  },

  // Requêtes de recherche par défaut
  defaultQueries: [
    'evian', 'cristaline', 'volvic', 'hepar', 'contrex', 
    'vittel', 'badoit', 'perrier', 'mont roucous'
  ],

  // Formats de recherche par défaut
  defaultFormats: [
    '50 cl', '50cl',
    '1 l', '1l', '1 litre',
    '1,5 l', '1.5 l', '1,5l', '1.5l'
  ],

  // Mots à ignorer lors de la détection de marque
  ignoreWords: [
    'eau', 'pack', 'lot', 'source', 'minérale', 'naturelle', 
    'gazeuse', 'plate', 'bouteille', 'plastique', 'verre',
    'bio', 'recyclée', 'de', 'la', 'le', 'les', 'du', 'des'
  ]
};

export const TARGET_BRANDS = Object.keys(BRAND_CONFIG.brands);
export const MDD_BRANDS = Object.keys(BRAND_CONFIG.mdd);
/** Normalise une chaîne : minuscules, sans accents, séparateurs unifiés en "-". */
const normalizeBrandKey = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Retrouve le nom exact de la marque (tel que stocké en base) à partir d'un slug d'URL.
 * Ex. "hepar" -> "Hépar", "mont-roucous" -> "Mont Roucous", "saint-amand" -> "Saint-Amand".
 */
export const resolveBrandFromSlug = (slug: string): string | null => {
  const key = normalizeBrandKey(slug);
  const pools = [BRAND_CONFIG.brands as Record<string, { variants: string[] }>, BRAND_CONFIG.mdd as unknown as Record<string, { variants: string[] }>];
  for (const pool of pools) {
    for (const [name, cfg] of Object.entries(pool)) {
      if (normalizeBrandKey(name) === key) return name;
      if (cfg.variants?.some((v) => normalizeBrandKey(v) === key)) return name;
    }
  }
  return null;
};

/** Slug canonique d'une marque, pour construire les URLs /marque/:slug. */
export const brandToSlug = (brand: string): string => normalizeBrandKey(brand);

/** Faits fiables (type + source) d'une marque à partir de son slug d'URL. Aucune donnée inventée. */
export const getBrandFacts = (slug: string): { name: string; type: string; source: string } | null => {
  const name = resolveBrandFromSlug(slug);
  if (!name) return null;
  const cfg = (BRAND_CONFIG.brands as Record<string, { type?: string; source?: string }>)[name];
  if (!cfg?.type || !cfg?.source) return null;
  return { name, type: cfg.type, source: cfg.source };
};
