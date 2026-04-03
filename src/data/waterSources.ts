import type { BottleWaterData } from '@/types/bottleTypes';

export interface WaterSource {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'Eau de source' | 'Eau minérale naturelle' | 'Eau minérale naturelle gazeuse';
  brands: string[];
  region: string;
  composition: {
    calcium: number;
    magnesium: number;
    sodium: number;
    nitrates: number;
    residu_sec: number;
  };
  description?: string;
  depth?: number; // Profondeur en mètres
  flow?: number; // Débit en L/min
}

// Données des principales sources d'eau en France
export const waterSources: WaterSource[] = [
  {
    id: 'evian-cachat',
    name: 'Source Cachat',
    location: 'Évian-les-Bains, Haute-Savoie',
    coordinates: [6.5885, 46.4008],
    type: 'Eau minérale naturelle',
    brands: ['Evian'],
    region: 'Auvergne-Rhône-Alpes',
    composition: {
      calcium: 80,
      magnesium: 26,
      sodium: 6.5,
      nitrates: 3.8,
      residu_sec: 345
    },
    description: 'Eau puisée dans les Alpes françaises, naturellement filtrée pendant 15 ans',
    depth: 300,
    flow: 1200
  },
  {
    id: 'volvic-auvergne',
    name: 'Sources du Volcan d\'Auvergne',
    location: 'Volvic, Puy-de-Dôme',
    coordinates: [3.0319, 45.8708],
    type: 'Eau minérale naturelle',
    brands: ['Volvic'],
    region: 'Auvergne-Rhône-Alpes',
    composition: {
      calcium: 12,
      magnesium: 8,
      sodium: 11.6,
      nitrates: 6.9,
      residu_sec: 130
    },
    description: 'Eau volcanique puisée au cœur du parc naturel des Volcans d\'Auvergne',
    depth: 150,
    flow: 800
  },
  {
    id: 'vittel-vosges',
    name: 'Sources de Vittel',
    location: 'Vittel, Vosges',
    coordinates: [5.9469, 48.2034],
    type: 'Eau minérale naturelle',
    brands: ['Vittel'],
    region: 'Grand Est',
    composition: {
      calcium: 94,
      magnesium: 20,
      sodium: 5.2,
      nitrates: 4.9,
      residu_sec: 305
    },
    description: 'Eau des Vosges, riche en minéraux essentiels',
    depth: 200,
    flow: 1500
  },
  {
    id: 'contrex-vosges',
    name: 'Sources de Contrex',
    location: 'Contrexéville, Vosges',
    coordinates: [5.8936, 48.1847],
    type: 'Eau minérale naturelle',
    brands: ['Contrex'],
    region: 'Grand Est',
    composition: {
      calcium: 468,
      magnesium: 74.5,
      sodium: 9.2,
      nitrates: 2.7,
      residu_sec: 2078
    },
    description: 'Eau très riche en calcium et magnésium, idéale pour le bien-être',
    depth: 180,
    flow: 900
  },
  {
    id: 'hepar-vosges',
    name: 'Sources d\'Hépar',
    location: 'Vittel, Vosges',
    coordinates: [5.9500, 48.2100],
    type: 'Eau minérale naturelle',
    brands: ['Hépar'],
    region: 'Grand Est',
    composition: {
      calcium: 555,
      magnesium: 119,
      sodium: 10,
      nitrates: 1.5,
      residu_sec: 2512
    },
    description: 'Eau exceptionnellement riche en magnésium, bénéfique pour le transit',
    depth: 250,
    flow: 600
  },
  {
    id: 'saint-yorre-allier',
    name: 'Sources de Saint-Yorre',
    location: 'Saint-Yorre, Allier',
    coordinates: [3.4667, 46.0667],
    type: 'Eau minérale naturelle gazeuse',
    brands: ['St-Yorre'],
    region: 'Auvergne-Rhône-Alpes',
    composition: {
      calcium: 160,
      magnesium: 80,
      sodium: 1700,
      nitrates: 0.3,
      residu_sec: 4774
    },
    description: 'Eau naturellement gazeuse et très minéralisée de l\'Allier',
    depth: 180,
    flow: 400
  },
  {
    id: 'quezac-lozere',
    name: 'Sources de Quézac',
    location: 'Quézac, Lozère',
    coordinates: [3.4333, 44.4667],
    type: 'Eau minérale naturelle gazeuse',
    brands: ['Quézac'],
    region: 'Occitanie',
    composition: {
      calcium: 90,
      magnesium: 15,
      sodium: 100,
      nitrates: 0.2,
      residu_sec: 1100
    },
    description: 'Eau gazeuse naturelle des Causses lozériens',
    depth: 120,
    flow: 350
  },
  {
    id: 'salvetat-herault',
    name: 'Sources de La Salvetat',
    location: 'La Salvetat-sur-Agout, Hérault',
    coordinates: [2.7000, 43.6000],
    type: 'Eau minérale naturelle gazeuse',
    brands: ['La Salvetat'],
    region: 'Occitanie',
    composition: {
      calcium: 253,
      magnesium: 11,
      sodium: 6.7,
      nitrates: 1.8,
      residu_sec: 838
    },
    description: 'Eau pétillante du Parc Naturel du Haut-Languedoc',
    depth: 400,
    flow: 350
  },
  {
    id: 'mont-roucous-tarn',
    name: 'Sources du Mont Roucous',
    location: 'Lacaune, Tarn',
    coordinates: [2.7167, 43.7167],
    type: 'Eau minérale naturelle',
    brands: ['Mont Roucous'],
    region: 'Occitanie',
    composition: {
      calcium: 2.5,
      magnesium: 0.9,
      sodium: 3.1,
      nitrates: 1.2,
      residu_sec: 22
    },
    description: 'Eau très faiblement minéralisée, adaptée aux nourrissons',
    depth: 60,
    flow: 200
  },
  {
    id: 'thonon-haute-savoie',
    name: 'Sources de Thonon',
    location: 'Thonon-les-Bains, Haute-Savoie',
    coordinates: [6.4797, 46.3700],
    type: 'Eau minérale naturelle',
    brands: ['Thonon'],
    region: 'Auvergne-Rhône-Alpes',
    composition: {
      calcium: 60,
      magnesium: 5,
      sodium: 5,
      nitrates: 2.1,
      residu_sec: 300
    },
    description: 'Sources des Alpes lémaniques, réputées pour leur pureté',
    depth: 130,
    flow: 400
  },
  {
    id: 'saint-amand-nord',
    name: 'Sources de Saint-Amand',
    location: 'Saint-Amand-les-Eaux, Nord',
    coordinates: [3.4333, 50.4500],
    type: 'Eau minérale naturelle',
    brands: ['Saint-Amand'],
    region: 'Hauts-de-France',
    composition: {
      calcium: 85,
      magnesium: 8,
      sodium: 10,
      nitrates: 1.5,
      residu_sec: 430
    },
    description: 'Sources thermales du Nord de la France',
    depth: 170,
    flow: 600
  },
  {
    id: 'cristalline-multiples',
    name: 'Sources Cristaline',
    location: 'Multiples sources en France',
    coordinates: [2.2137, 46.2276],
    type: 'Eau de source',
    brands: ['Cristaline'],
    region: 'France entière',
    composition: {
      calcium: 58,
      magnesium: 8,
      sodium: 5.5,
      nitrates: 2.6,
      residu_sec: 331
    },
    description: 'Réseau de sources d\'eau naturelles réparties sur tout le territoire français',
    depth: 80,
    flow: 500
  }
];

// Fonction pour obtenir les sources par type d'eau
export const getSourcesByType = (type?: string): WaterSource[] => {
  if (!type || type === 'all') {
    return waterSources;
  }
  
  const typeMap: Record<string, string[]> = {
    'source': ['Eau de source'],
    'minerale': ['Eau minérale naturelle'],
    'gazeuse': ['Eau minérale naturelle gazeuse']
  };
  
  const targetTypes = typeMap[type] || [type];
  return waterSources.filter(source => targetTypes.includes(source.type));
};

// Fonction pour obtenir une source par ID
export const getSourceById = (id: string): WaterSource | undefined => {
  return waterSources.find(source => source.id === id);
};

// Fonction pour obtenir les marques associées à une source
export const getBrandsBySource = (sourceId: string): string[] => {
  const source = getSourceById(sourceId);
  return source ? source.brands : [];
};

// Statistiques des sources
export const getSourcesStatistics = () => {
  const stats = {
    total: waterSources.length,
    byType: {
      'Eau de source': 0,
      'Eau minérale naturelle': 0,
      'Eau minérale naturelle gazeuse': 0
    },
    byRegion: {} as Record<string, number>,
    averageDepth: 0,
    averageFlow: 0
  };

  let totalDepth = 0;
  let totalFlow = 0;
  let depthCount = 0;
  let flowCount = 0;

  waterSources.forEach(source => {
    // Par type
    stats.byType[source.type]++;
    
    // Par région
    stats.byRegion[source.region] = (stats.byRegion[source.region] || 0) + 1;
    
    // Moyennes
    if (source.depth) {
      totalDepth += source.depth;
      depthCount++;
    }
    if (source.flow) {
      totalFlow += source.flow;
      flowCount++;
    }
  });

  stats.averageDepth = depthCount > 0 ? Math.round(totalDepth / depthCount) : 0;
  stats.averageFlow = flowCount > 0 ? Math.round(totalFlow / flowCount) : 0;

  return stats;
};