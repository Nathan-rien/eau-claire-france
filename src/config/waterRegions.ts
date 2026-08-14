export type WaterRegion = 'alpes' | 'vosges' | 'auvergne' | 'pyrenees' | 'mediterranee' | 'ouest' | 'autres' | 'hors-france';

export const WATER_REGIONS: Record<string, WaterRegion> = {
  // Alpes
  "Évian": 'alpes',
  "Thonon": 'alpes',
  "Mont Blanc": 'alpes',
  "Roche Claire": 'alpes',

  // Vosges / Grand Est
  "Contrex": 'vosges',
  "Hépar": 'vosges',
  "Vittel": 'vosges',
  "Wattwiller": 'vosges',

  // Auvergne / Massif Central
  "Volvic": 'auvergne',
  "Arvie": 'auvergne',
  "Rozana": 'auvergne',
  "Saint-Yorre": 'auvergne',
  "Vichy Célestins": 'auvergne',
  "Châteldon": 'auvergne',

  // Pyrénées / Sud-Ouest
  "Mont Roucous": 'pyrenees',
  "Montcalm": 'pyrenees',
  "Ogeu": 'pyrenees',
  "Abatilles": 'pyrenees',
  "Luchon": 'pyrenees',

  // Languedoc / Méditerranée
  "La Salvetat": 'mediterranee',
  "Quézac": 'mediterranee',
  "Perrier": 'mediterranee',

  // Ouest
  "Plancoët": 'ouest',
  "Pierval": 'ouest',

  // Autres / multi-sources
  "Badoit": 'autres',
  "Cristaline": 'autres',

  // Hors France
  "Courmayeur": 'hors-france',
  "San Pellegrino": 'hors-france',
};

export const getWaterRegion = (brand: string): WaterRegion => WATER_REGIONS[brand] ?? 'autres';

export const REGION_LABELS: Record<WaterRegion, string> = {
  alpes: 'Alpes',
  vosges: 'Vosges / Grand Est',
  auvergne: 'Auvergne',
  pyrenees: 'Pyrénées / Sud-Ouest',
  mediterranee: 'Languedoc / Méditerranée',
  ouest: 'Ouest',
  autres: 'Autres',
  'hors-france': 'Hors France',
};

export const REGION_ORDER: WaterRegion[] = [
  'alpes',
  'vosges',
  'auvergne',
  'pyrenees',
  'mediterranee',
  'ouest',
  'autres',
  'hors-france',
];
