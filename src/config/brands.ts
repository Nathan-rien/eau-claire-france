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