// Retours qualitatifs sur le goût de l'eau du robinet en France
// Sources : presse régionale, sondages, rapports officiels
// ⚠ Ces données reflètent des PERCEPTIONS, pas des mesures de conformité

export type TasteTag =
  | 'chlore'
  | 'mineral'
  | 'metallique'
  | 'neutre'
  | 'variable'
  | 'national';

export interface TasteReport {
  id: string;
  region: string | null; // null = national / non attribué à une région
  locationLabel: string;
  quote: string;
  tag: TasteTag;
  date: string; // ISO ou libre
  dateDisplay: string;
  source: string;
  sourceType:
    | 'presse'
    | 'sondage'
    | 'rapport'
    | 'temoignage'
    | 'officiel'
    | 'Article local'
    | 'Page commerciale (diagnostic eau)'
    | 'Article régional'
    | 'Étude sensorielle'
    | 'Article de vulgarisation'
    | 'Site officiel commune'
    | 'ARS / contrôle sanitaire';

  note?: string;
}

export const TASTE_TAG_META: Record<
  TasteTag,
  { label: string; color: string; bg: string; badgeClass: string }
> = {
  chlore: {
    label: 'Goût de chlore',
    color: '#0ea5e9',
    bg: '#e0f2fe',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  mineral: {
    label: 'Goût minéral',
    color: '#8b5cf6',
    bg: '#ede9fe',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  metallique: {
    label: 'Goût métallique',
    color: '#f97316',
    bg: '#ffedd5',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  neutre: {
    label: 'Goût neutre / apprécié',
    color: '#10b981',
    bg: '#d1fae5',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  variable: {
    label: 'Goût variable',
    color: '#f59e0b',
    bg: '#fef3c7',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  national: {
    label: 'Étude nationale',
    color: '#64748b',
    bg: '#f1f5f9',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};

// Centres approximatifs des 13 régions métropolitaines [lng, lat]
export const REGION_CENTERS: Record<string, [number, number]> = {
  'Île-de-France': [2.5, 48.75],
  'Auvergne-Rhône-Alpes': [4.6, 45.5],
  'Nouvelle-Aquitaine': [0.2, 45.5],
  Occitanie: [2.2, 43.7],
  'Hauts-de-France': [2.8, 50.0],
  'Grand Est': [5.8, 48.7],
  "Provence-Alpes-Côte d'Azur": [6.2, 43.9],
  'Pays de la Loire': [-0.8, 47.5],
  Bretagne: [-2.9, 48.2],
  Normandie: [0.2, 49.2],
  'Bourgogne-Franche-Comté': [4.8, 47.2],
  'Centre-Val de Loire': [1.7, 47.5],
  Corse: [9.0, 42.15],
};

export const TASTE_REPORTS: TasteReport[] = [
  {
    id: 'idf-2015-leparisien',
    region: 'Île-de-France',
    locationLabel: 'Île-de-France',
    quote: "« Trop chlorée » — 59 % des Franciliens déplorent le goût de chlore.",
    tag: 'chlore',
    date: '2015',
    dateDisplay: '2015',
    source: 'Le Parisien',
    sourceType: 'presse',
  },
  {
    id: 'paris-2025-baro-technique',
    region: 'Île-de-France',
    locationLabel: 'Paris',
    quote: "« Goût léger mais technique, parfois minéral » selon le baromètre Eau de Paris.",
    tag: 'mineral',
    date: '2025-07',
    dateDisplay: 'Juillet 2025',
    source: 'Baromètre Eau de Paris',
    sourceType: 'sondage',
  },
  {
    id: 'paris-2025-baro-satisfaction',
    region: 'Île-de-France',
    locationLabel: 'Paris',
    quote: "87 % des Parisiens jugent la qualité de leur eau du robinet satisfaisante.",
    tag: 'neutre',
    date: '2025-07',
    dateDisplay: 'Juillet 2025',
    source: 'Baromètre Eau de Paris',
    sourceType: 'sondage',
  },
  {
    id: 'vendee-2023-of',
    region: 'Pays de la Loire',
    locationLabel: 'Fontenay-le-Comte (Vendée)',
    quote: "« Ça sent la piscine, le goût de chlore est très fort. »",
    tag: 'chlore',
    date: '2023-12',
    dateDisplay: 'Décembre 2023',
    source: 'Ouest-France',
    sourceType: 'presse',
  },
  {
    id: 'morbihan-2017-of',
    region: 'Bretagne',
    locationLabel: 'Morbihan',
    quote: "« Goût de chlore, de javel, parfois terreux » selon les riverains.",
    tag: 'chlore',
    date: '2017-09',
    dateDisplay: 'Septembre 2017',
    source: 'Ouest-France',
    sourceType: 'presse',
  },
  {
    id: 'moselle-2023-est',
    region: 'Grand Est',
    locationLabel: 'Moselle',
    quote: "« Elle n'est pas bonne, elle a un goût de chlore. »",
    tag: 'chlore',
    date: '2023-10',
    dateDisplay: 'Octobre 2023',
    source: "L'Est Républicain",
    sourceType: 'presse',
  },
  {
    id: 'hdf-2024-mineral',
    region: 'Hauts-de-France',
    locationLabel: 'Hauts-de-France',
    quote: "« Goût minéral, parfois métallique » remonté dans la presse régionale.",
    tag: 'mineral',
    date: '2024',
    dateDisplay: '2024-2025',
    source: 'Presse régionale',
    sourceType: 'presse',
  },
  {
    id: 'sudouest-variable',
    region: 'Nouvelle-Aquitaine',
    locationLabel: 'Sud-Ouest',
    quote: "« Goût variable, parfois minéral, parfois neutre » selon les communes.",
    tag: 'variable',
    date: '2024',
    dateDisplay: '2024',
    source: 'Presse régionale',
    sourceType: 'presse',
  },
  {
    id: 'massif-central-2015',
    region: null,
    locationLabel: 'Massif central (zones peu calcaires)',
    quote: "« Notes franchement minérales » dans les zones granitiques peu calcaires.",
    tag: 'mineral',
    date: '2015',
    dateDisplay: '2015',
    source: 'Le Parisien',
    sourceType: 'presse',
  },
  {
    id: 'littoral-variable',
    region: null,
    locationLabel: 'Zones littorales à réseau variable',
    quote: "« Goût métallique ou chloré selon les périodes » sur les réseaux littoraux.",
    tag: 'variable',
    date: '2024',
    dateDisplay: '2024',
    source: 'Presse régionale',
    sourceType: 'presse',
  },
  {
    id: 'diverses-2023-of',
    region: null,
    locationLabel: 'Diverses régions',
    quote: "Signalements de forte odeur de chlore sur plusieurs réseaux communaux.",
    tag: 'chlore',
    date: '2023-12',
    dateDisplay: 'Décembre 2023',
    source: 'Ouest-France',
    sourceType: 'presse',
  },
  {
    id: 'rural-forum-2022',
    region: null,
    locationLabel: 'France rurale',
    quote: "« Un goût désagréable » régulièrement rapporté sur les forums.",
    tag: 'variable',
    date: '2022',
    dateDisplay: '2022',
    source: 'Forum public',
    sourceType: 'temoignage',
  },
  {
    id: 'senat-2023',
    region: null,
    locationLabel: 'France entière',
    quote: "Goût et calcaire sont les premiers motifs de non-satisfaction (rapport Sénat).",
    tag: 'national',
    date: '2023-04',
    dateDisplay: 'Avril 2023',
    source: 'Rapport Sénat',
    sourceType: 'rapport',
  },
  {
    id: 'bordet-2025',
    region: null,
    locationLabel: 'France entière',
    quote: "40 % des Français déplorent le mauvais goût de l'eau du robinet.",
    tag: 'national',
    date: '2025-12',
    dateDisplay: 'Décembre 2025',
    source: 'Groupe Bordet (panel 4 101 pers.)',
    sourceType: 'sondage',
    note: 'Étude nationale sur 4 101 répondants.',
  },
  {
    id: 'uae-2022',
    region: null,
    locationLabel: 'France entière',
    quote: "25 % des Français jugent le chlore problématique dans leur eau.",
    tag: 'national',
    date: '2022-12',
    dateDisplay: 'Décembre 2022',
    source: 'UAE / Amane Advisors',
    sourceType: 'sondage',
  },
  {
    id: 'brita-2024',
    region: null,
    locationLabel: 'France entière',
    quote: "59 % des Français boiraient plus d'eau du robinet si le goût était meilleur.",
    tag: 'national',
    date: '2024',
    dateDisplay: '2023-2024',
    source: 'Étude BRITA',
    sourceType: 'sondage',
  },
  {
    id: 'cieau-2012',
    region: null,
    locationLabel: 'France entière',
    quote: "Un mauvais goût n'implique pas une non-conformité sanitaire.",
    tag: 'national',
    date: '2012-04',
    dateDisplay: 'Avril 2012',
    source: 'CIEAU',
    sourceType: 'officiel',
  },
  {
    id: 'sante-gouv-2025',
    region: null,
    locationLabel: 'France entière',
    quote: "Conseil officiel : laisser reposer l'eau en carafe pour dissiper le chlore.",
    tag: 'national',
    date: '2025-02',
    dateDisplay: 'Février 2025',
    source: 'sante.gouv.fr',
    sourceType: 'officiel',
  },
  {
    id: 'lyon-equilibree-2024',
    region: 'Auvergne-Rhône-Alpes',
    locationLabel: 'Lyon',
    quote:
      'Eau moyennement minéralisée et équilibrée, très faible teneur en chlore',
    tag: 'neutre',
    date: '2024',
    dateDisplay: '2024',
    source: 'Toolyon (Eau du Grand Lyon)',
    sourceType: 'Article local',
    note: "Dureté d'environ 18°f (moyennement dure), sans référence chiffrée au goût perçu par les usagers.",
  },
  {
    id: 'toulouse-chlore-culligan',
    region: 'Occitanie',
    locationLabel: 'Toulouse',
    quote:
      "Taux de chlore jugé médiocre, pouvant donner un goût ou une odeur de javel",
    tag: 'chlore',
    date: '2025',
    dateDisplay: '2025',
    source: 'Culligan',
    sourceType: 'Page commerciale (diagnostic eau)',
    note: "Eau par ailleurs douce et peu calcaire (~6°f).",
  },
  {
    id: 'marseille-reputee-2025',
    region: "Provence-Alpes-Côte d'Azur",
    locationLabel: 'Marseille',
    quote:
      "Réputée meilleure eau de France depuis l'adoption de l'ozone à la place du chlore",
    tag: 'neutre',
    date: '2025-05-28',
    dateDisplay: 'Mai 2025',
    source: 'ICI (ex-France Bleu) Provence',
    sourceType: 'Article régional',
    note: "Reste assez calcaire (20 à 28°f selon les secteurs), ce qui nuance la perception en bouche.",
  },
  {
    id: 'rouen-chlore-culligan',
    region: 'Normandie',
    locationLabel: 'Rouen',
    quote: 'Goût pouvant être influencé par le chlore de désinfection',
    tag: 'chlore',
    date: '2025',
    dateDisplay: '2025',
    source: 'Culligan',
    sourceType: 'Page commerciale (diagnostic eau)',
    note: 'Eau modérément calcaire ; variations de goût selon les 4 réseaux de distribution de la ville.',
  },
  {
    id: 'dijon-neutre-suez',
    region: 'Bourgogne-Franche-Comté',
    locationLabel: 'Dijon',
    quote: 'Minéralité moyenne, goût qualifié de neutre et rafraîchissant',
    tag: 'neutre',
    date: '2023',
    dateDisplay: "Non daté (étude SUEZ/CIRSEE-CSGA)",
    source: "SUEZ / Centre des Sciences du Goût et de l'Alimentation (Dijon)",
    sourceType: 'Étude sensorielle',
    note: "Issu d'un partenariat de recherche de 4 ans sur la perception sensorielle de l'eau du robinet.",
  },
  {
    id: 'orleans-neutre-suez',
    region: 'Centre-Val de Loire',
    locationLabel: 'Orléans',
    quote: 'Minéralité moyenne, goût qualifié de neutre et rafraîchissant',
    tag: 'neutre',
    date: '2023',
    dateDisplay: "Non daté (étude SUEZ/CIRSEE-CSGA)",
    source: "SUEZ / Centre des Sciences du Goût et de l'Alimentation (Dijon)",
    sourceType: 'Étude sensorielle',
    note: 'Même classification que Dijon et Vigneux dans cette étude (résidu à sec 300–500 mg/L).',
  },
  {
    id: 'corse-variable-2025',
    region: 'Corse',
    locationLabel: 'Corse',
    quote:
      'Goût prononcé, calcaire et minéraux plus marqués que sur le continent',
    tag: 'variable',
    date: '2025-06-04',
    dateDisplay: 'Juin 2025',
    source: 'Le Robinet',
    sourceType: 'Article de vulgarisation',
    note: 'Eau parfois fortement chlorée selon les communes ; qualité jugée variable selon la météo (turbidité après fortes pluies).',
  },
];

export function getReportsForRegion(region: string | null): TasteReport[] {
  if (region === null) return TASTE_REPORTS.filter((r) => r.region === null);
  return TASTE_REPORTS.filter((r) => r.region === region);
}

export function getDominantTag(region: string): TasteTag | null {
  const reports = TASTE_REPORTS.filter((r) => r.region === region);
  if (reports.length === 0) return null;
  const counts: Record<string, number> = {};
  reports.forEach((r) => {
    counts[r.tag] = (counts[r.tag] || 0) + 1;
  });
  let best: TasteTag | null = null;
  let bestCount = -1;
  (Object.keys(counts) as TasteTag[]).forEach((t) => {
    if (counts[t] > bestCount) {
      bestCount = counts[t];
      best = t;
    }
  });
  return best;
}
