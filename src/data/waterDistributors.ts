import { FRENCH_CITIES, CityData } from './frenchCities';

export interface WaterSource {
  name: string;
  lat: number;
  lng: number;
  category: string;
}

export interface DistributorRoute {
  retailer: string;
  mddBrand: string;
  source: WaterSource;
  communes: CityData[];
}

// Sources with real GPS coordinates from water_sources_coordinates.csv
const SOURCE_COORDS: Record<string, { lat: number; lng: number }> = {
  'Laqueuille': { lat: 45.65, lng: 2.7333 },
  'Grand Barbier': { lat: 45.55, lng: 5.95 },
  'Fiée des Lois': { lat: 46.35, lng: -0.35 },
  'Sainte-Sophie': { lat: 47.5, lng: 1.8 },
  'Pyrénéa': { lat: 42.7, lng: -0.5 },
  'Roche des Écrins': { lat: 45.0, lng: 6.0 },
  'Saint-Martin d\'Abbat': { lat: 47.8167, lng: 2.3167 },
  'Louise': { lat: 48.8, lng: 7.5 },
  'Ophélie': { lat: 47.2, lng: 6.0 },
  'Kirkel': { lat: 49.28, lng: 7.23 },
  'Cachat': { lat: 46.4008, lng: 6.5885 },
  'Les Bouillens': { lat: 43.75, lng: 3.95 },
  'Clairvic': { lat: 45.8708, lng: 3.0319 },
  'Multi-sources': { lat: 46.2276, lng: 2.2137 },
};

// Regional city assignment - which cities a source typically serves
const REGION_CITIES: Record<string, string[]> = {
  'Laqueuille': ['Clermont-Ferrand', 'Lyon', 'Saint-Étienne', 'Limoges'],
  'Grand Barbier': ['Grenoble', 'Lyon', 'Annecy', 'Dijon'],
  'Fiée des Lois': ['Nantes', 'Tours', 'Angers', 'Le Mans'],
  'Sainte-Sophie': ['Orléans', 'Tours', 'Le Mans', 'Paris'],
  'Pyrénéa': ['Toulouse', 'Perpignan', 'Bordeaux'],
  'Roche des Écrins': ['Grenoble', 'Lyon', 'Nice', 'Marseille'],
  'Saint-Martin d\'Abbat': ['Orléans', 'Paris', 'Tours'],
  'Louise': ['Strasbourg', 'Mulhouse', 'Nancy', 'Metz'],
  'Ophélie': ['Besançon', 'Dijon', 'Mulhouse'],
  'Kirkel': ['Strasbourg', 'Metz', 'Nancy', 'Mulhouse'],
  'Multi-sources': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille', 'Nantes'],
};

// Raw distributor data from MDD CSV
const RAW_DISTRIBUTORS = [
  { retailer: 'E.Leclerc', mddBrand: 'Marque Repère – Eau de source', source: 'Laqueuille', category: 'Eau de source' },
  { retailer: 'E.Leclerc', mddBrand: 'Eco+ – Eau de source', source: 'Laqueuille', category: 'Eau de source' },
  { retailer: 'Carrefour', mddBrand: 'Carrefour Classic\' – Eau de source', source: 'Grand Barbier', category: 'Eau de source' },
  { retailer: 'Intermarché', mddBrand: 'Top Budget – Eau de source', source: 'Fiée des Lois', category: 'Eau de source' },
  { retailer: 'Système U', mddBrand: 'U – Eau de source', source: 'Sainte-Sophie', category: 'Eau de source' },
  { retailer: 'Auchan', mddBrand: 'Auchan – Eau de source (Pyrénéa)', source: 'Pyrénéa', category: 'Eau de source' },
  { retailer: 'Casino', mddBrand: 'Casino – Eau de source', source: 'Roche des Écrins', category: 'Eau de source' },
  { retailer: 'Cora', mddBrand: 'Cora – Ondine', source: 'Saint-Martin d\'Abbat', category: 'Eau de source' },
  { retailer: 'Lidl', mddBrand: 'Saskia – Eau de source', source: 'Kirkel', category: 'Eau de source' },
  { retailer: 'Aldi', mddBrand: 'Rocheval – Eau de source (Louise)', source: 'Louise', category: 'Eau de source' },
  { retailer: 'Aldi', mddBrand: 'Rocheval – Eau de source (Ophélie)', source: 'Ophélie', category: 'Eau de source' },
];

function getCitiesForSource(sourceName: string): CityData[] {
  const cityNames = REGION_CITIES[sourceName] || ['Paris', 'Lyon', 'Marseille'];
  return cityNames
    .map(name => FRENCH_CITIES.find(c => c.name === name))
    .filter((c): c is CityData => !!c);
}

export function getDistributorRoutes(): DistributorRoute[] {
  return RAW_DISTRIBUTORS.map(d => ({
    retailer: d.retailer,
    mddBrand: d.mddBrand,
    source: {
      name: d.source,
      lat: SOURCE_COORDS[d.source]?.lat ?? 46.2276,
      lng: SOURCE_COORDS[d.source]?.lng ?? 2.2137,
      category: d.category,
    },
    communes: getCitiesForSource(d.source),
  }));
}

export function getRetailerList(): string[] {
  return [...new Set(RAW_DISTRIBUTORS.map(d => d.retailer))];
}

export function getRoutesByRetailer(retailer: string): DistributorRoute[] {
  const all = getDistributorRoutes();
  if (!retailer || retailer === 'all') return all;
  return all.filter(r => r.retailer === retailer);
}
