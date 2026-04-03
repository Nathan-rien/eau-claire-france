
export interface TapWaterStep {
  name: string;
  type: 'captage' | 'traitement' | 'reservoir' | 'commune';
  lat: number;
  lng: number;
  description: string;
}

export interface TapWaterRoute {
  id: string;
  city: string;
  region: string;
  sourceType: 'nappe' | 'riviere' | 'lac' | 'canal';
  steps: TapWaterStep[];
}

export const TAP_WATER_ROUTES: TapWaterRoute[] = [
  {
    id: 'paris',
    city: 'Paris',
    region: 'Île-de-France',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Seine (Orly)', type: 'captage', lat: 48.7262, lng: 2.3652, description: 'Prise d\'eau en Seine à Orly' },
      { name: 'Usine de Choisy-le-Roi', type: 'traitement', lat: 48.7644, lng: 2.4103, description: 'Station de traitement Eau de Paris' },
      { name: 'Réservoir de Montsouris', type: 'reservoir', lat: 48.8222, lng: 2.3387, description: 'Réservoir enterré, 200 000 m³' },
      { name: 'Paris', type: 'commune', lat: 48.8566, lng: 2.3522, description: 'Distribution aux 2,1 M d\'habitants' },
    ],
  },
  {
    id: 'paris-marne',
    city: 'Paris (Est)',
    region: 'Île-de-France',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Marne (Joinville)', type: 'captage', lat: 48.8193, lng: 2.4622, description: 'Prise d\'eau en Marne' },
      { name: 'Usine de Joinville', type: 'traitement', lat: 48.8210, lng: 2.4700, description: 'Usine de production d\'eau potable' },
      { name: 'Réservoir de Ménilmontant', type: 'reservoir', lat: 48.8660, lng: 2.3920, description: 'Réservoir haut-service' },
      { name: 'Paris (Est)', type: 'commune', lat: 48.8630, lng: 2.3800, description: 'Arrondissements est de Paris' },
    ],
  },
  {
    id: 'lyon',
    city: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    sourceType: 'nappe',
    steps: [
      { name: 'Champ captant de Crépieux-Charmy', type: 'captage', lat: 45.8050, lng: 4.8780, description: 'Plus grand champ captant d\'Europe, nappe alluviale du Rhône' },
      { name: 'Usine de Croix-Luizet', type: 'traitement', lat: 45.7780, lng: 4.8690, description: 'Traitement UV + chloration' },
      { name: 'Réservoirs de Fourvière', type: 'reservoir', lat: 45.7600, lng: 4.8200, description: 'Réservoirs en hauteur' },
      { name: 'Lyon', type: 'commune', lat: 45.7640, lng: 4.8357, description: 'Distribution Métropole de Lyon' },
    ],
  },
  {
    id: 'marseille',
    city: 'Marseille',
    region: 'Provence-Alpes-Côte d\'Azur',
    sourceType: 'canal',
    steps: [
      { name: 'Lac de Serre-Ponçon (Durance)', type: 'captage', lat: 44.5000, lng: 6.3500, description: 'Retenue sur la Durance, alimentation du Canal de Marseille' },
      { name: 'Canal de Marseille', type: 'traitement', lat: 43.4500, lng: 5.4500, description: '80 km de canal depuis la Durance' },
      { name: 'Usine de Sainte-Marthe', type: 'traitement', lat: 43.3400, lng: 5.3800, description: 'Principale usine de traitement' },
      { name: 'Marseille', type: 'commune', lat: 43.2965, lng: 5.3698, description: 'Distribution aux 870 000 habitants' },
    ],
  },
  {
    id: 'bordeaux',
    city: 'Bordeaux',
    region: 'Nouvelle-Aquitaine',
    sourceType: 'nappe',
    steps: [
      { name: 'Nappe de l\'Oligocène', type: 'captage', lat: 44.8700, lng: -0.6200, description: 'Nappe profonde captée à 100-300 m' },
      { name: 'Usine de Paulin', type: 'traitement', lat: 44.8550, lng: -0.5900, description: 'Déferrisation et traitement' },
      { name: 'Château d\'eau de Bordeaux', type: 'reservoir', lat: 44.8450, lng: -0.5800, description: 'Stockage et distribution gravitaire' },
      { name: 'Bordeaux', type: 'commune', lat: 44.8378, lng: -0.5792, description: 'Distribution Bordeaux Métropole' },
    ],
  },
  {
    id: 'lille',
    city: 'Lille',
    region: 'Hauts-de-France',
    sourceType: 'nappe',
    steps: [
      { name: 'Nappe de la Craie (Emmerin)', type: 'captage', lat: 50.5900, lng: 3.0200, description: 'Captage dans la nappe crayeuse' },
      { name: 'Usine d\'Emmerin', type: 'traitement', lat: 50.5950, lng: 3.0150, description: 'Ultrafiltration membranaire' },
      { name: 'Réservoir de Lille', type: 'reservoir', lat: 50.6260, lng: 3.0520, description: 'Stockage et régulation pression' },
      { name: 'Lille', type: 'commune', lat: 50.6292, lng: 3.0573, description: 'Distribution MEL (1,2 M hab.)' },
    ],
  },
  {
    id: 'toulouse',
    city: 'Toulouse',
    region: 'Occitanie',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Garonne (Pinsaguel)', type: 'captage', lat: 43.5100, lng: 1.3900, description: 'Prise d\'eau dans la Garonne' },
      { name: 'Usine de Clairfont', type: 'traitement', lat: 43.5300, lng: 1.4000, description: 'Filtration et ozonation' },
      { name: 'Réservoir de Guilhermy', type: 'reservoir', lat: 43.5850, lng: 1.4200, description: 'Réservoir semi-enterré' },
      { name: 'Toulouse', type: 'commune', lat: 43.6047, lng: 1.4442, description: 'Distribution Toulouse Métropole' },
    ],
  },
  {
    id: 'nantes',
    city: 'Nantes',
    region: 'Pays de la Loire',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Loire (La Roche)', type: 'captage', lat: 47.2400, lng: -1.6200, description: 'Prise d\'eau dans la Loire' },
      { name: 'Usine de La Roche', type: 'traitement', lat: 47.2350, lng: -1.6100, description: 'Traitement charbon actif + UV' },
      { name: 'Réservoir de La Contrie', type: 'reservoir', lat: 47.2300, lng: -1.5800, description: 'Stockage et distribution' },
      { name: 'Nantes', type: 'commune', lat: 47.2184, lng: -1.5536, description: 'Distribution Nantes Métropole' },
    ],
  },
  {
    id: 'strasbourg',
    city: 'Strasbourg',
    region: 'Grand Est',
    sourceType: 'nappe',
    steps: [
      { name: 'Nappe phréatique du Rhin', type: 'captage', lat: 48.6100, lng: 7.7800, description: 'Plus grande nappe d\'Europe, captage à 30-50 m' },
      { name: 'Usine du Polygone', type: 'traitement', lat: 48.5800, lng: 7.7500, description: 'Traitement minimal (eau de très bonne qualité)' },
      { name: 'Strasbourg', type: 'commune', lat: 48.5734, lng: 7.7521, description: 'Distribution Eurométropole' },
    ],
  },
  {
    id: 'nice',
    city: 'Nice',
    region: 'Provence-Alpes-Côte d\'Azur',
    sourceType: 'nappe',
    steps: [
      { name: 'Sources du Var (Vésubie)', type: 'captage', lat: 43.8500, lng: 7.2500, description: 'Captage en nappe alluviale du Var' },
      { name: 'Usine de la Vésubie', type: 'traitement', lat: 43.7800, lng: 7.2300, description: 'Traitement et chloration' },
      { name: 'Réservoirs de Rimiez', type: 'reservoir', lat: 43.7300, lng: 7.2700, description: 'Stockage en altitude' },
      { name: 'Nice', type: 'commune', lat: 43.7102, lng: 7.2620, description: 'Distribution Nice Côte d\'Azur' },
    ],
  },
  {
    id: 'rennes',
    city: 'Rennes',
    region: 'Bretagne',
    sourceType: 'riviere',
    steps: [
      { name: 'Barrage de La Chèze (Vilaine)', type: 'captage', lat: 48.0500, lng: -1.7200, description: 'Retenue sur la Vilaine' },
      { name: 'Usine de Villejean', type: 'traitement', lat: 48.1250, lng: -1.7000, description: 'Filtration membranaire' },
      { name: 'Rennes', type: 'commune', lat: 48.1173, lng: -1.6778, description: 'Distribution Rennes Métropole' },
    ],
  },
  {
    id: 'montpellier',
    city: 'Montpellier',
    region: 'Occitanie',
    sourceType: 'nappe',
    steps: [
      { name: 'Source du Lez', type: 'captage', lat: 43.7300, lng: 3.8600, description: 'Résurgence karstique, débit 2 m³/s' },
      { name: 'Usine d\'Arago', type: 'traitement', lat: 43.6300, lng: 3.8700, description: 'Station de potabilisation' },
      { name: 'Montpellier', type: 'commune', lat: 43.6108, lng: 3.8767, description: 'Distribution Montpellier Méditerranée' },
    ],
  },
  {
    id: 'grenoble',
    city: 'Grenoble',
    region: 'Auvergne-Rhône-Alpes',
    sourceType: 'nappe',
    steps: [
      { name: 'Nappe alluviale du Drac', type: 'captage', lat: 45.1500, lng: 5.7000, description: 'Nappe alimentée par les eaux alpines' },
      { name: 'Captage de Rochefort', type: 'traitement', lat: 45.1700, lng: 5.7100, description: 'Eau naturellement pure, traitement minimal' },
      { name: 'Grenoble', type: 'commune', lat: 45.1885, lng: 5.7245, description: 'Distribution Grenoble-Alpes Métropole' },
    ],
  },
  {
    id: 'dijon',
    city: 'Dijon',
    region: 'Bourgogne-Franche-Comté',
    sourceType: 'nappe',
    steps: [
      { name: 'Sources de Morcueil', type: 'captage', lat: 47.3600, lng: 4.9800, description: 'Sources karstiques' },
      { name: 'Usine de Morcueil', type: 'traitement', lat: 47.3550, lng: 4.9750, description: 'Traitement UV et chloration' },
      { name: 'Réservoir de Darcy', type: 'reservoir', lat: 47.3250, lng: 5.0340, description: 'Réservoir historique' },
      { name: 'Dijon', type: 'commune', lat: 47.3220, lng: 5.0415, description: 'Distribution Dijon Métropole' },
    ],
  },
  {
    id: 'clermont',
    city: 'Clermont-Ferrand',
    region: 'Auvergne-Rhône-Alpes',
    sourceType: 'nappe',
    steps: [
      { name: 'Sources volcaniques (Volvic)', type: 'captage', lat: 45.8700, lng: 2.9500, description: 'Eaux filtrées par les roches volcaniques' },
      { name: 'Station de traitement', type: 'traitement', lat: 45.8200, lng: 3.0200, description: 'Traitement léger, eau naturellement pure' },
      { name: 'Clermont-Ferrand', type: 'commune', lat: 45.7772, lng: 3.0870, description: 'Distribution Clermont Auvergne Métropole' },
    ],
  },
];

export const SOURCE_TYPE_LABELS: Record<TapWaterRoute['sourceType'], { fr: string; en: string }> = {
  nappe: { fr: 'Nappe souterraine', en: 'Groundwater' },
  riviere: { fr: 'Rivière / Fleuve', en: 'River' },
  lac: { fr: 'Lac / Retenue', en: 'Lake / Reservoir' },
  canal: { fr: 'Canal', en: 'Canal' },
};

export function getTapRoutesBySourceType(sourceType: string): TapWaterRoute[] {
  if (sourceType === 'all') return TAP_WATER_ROUTES;
  return TAP_WATER_ROUTES.filter(r => r.sourceType === sourceType);
}

export function getTapRoutesByRegion(region: string): TapWaterRoute[] {
  if (region === 'all') return TAP_WATER_ROUTES;
  return TAP_WATER_ROUTES.filter(r => r.region === region);
}

export function getUniqueRegions(): string[] {
  return [...new Set(TAP_WATER_ROUTES.map(r => r.region))].sort();
}

export function getUniqueSourceTypes(): TapWaterRoute['sourceType'][] {
  return [...new Set(TAP_WATER_ROUTES.map(r => r.sourceType))];
}
