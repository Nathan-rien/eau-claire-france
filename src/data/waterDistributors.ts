export interface CommuneData {
  name: string;
  coordinates: [number, number]; // [lng, lat]
  context: string;
}

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
  communes: CommuneData[];
}

// Sources with real GPS coordinates
const SOURCE_COORDS: Record<string, { lat: number; lng: number }> = {
  'Laqueuille': { lat: 45.65, lng: 2.7333 },
  'Grand Barbier': { lat: 45.55, lng: 5.95 },
  'Fiée des Lois': { lat: 46.35, lng: -0.35 },
  'Sainte-Sophie': { lat: 47.5, lng: 1.8 },
  'Pyrénéa': { lat: 42.7, lng: -0.5 },
  'Roche des Écrins': { lat: 45.0, lng: 6.0 },
  "Saint-Martin d'Abbat": { lat: 47.8167, lng: 2.3167 },
  'Louise': { lat: 48.8, lng: 7.5 },
  'Ophélie': { lat: 47.2, lng: 6.0 },
  'Kirkel': { lat: 49.28, lng: 7.23 },
  'Cachat': { lat: 46.4008, lng: 6.5885 },
  'Les Bouillens': { lat: 43.75, lng: 3.95 },
  'Clairvic': { lat: 45.8708, lng: 3.0319 },
  'Multi-sources': { lat: 46.2276, lng: 2.2137 },
  // New sources
  'Montclar': { lat: 44.08, lng: 6.35 },
  'Wüllner': { lat: 51.38, lng: 7.62 },
  'Jandun': { lat: 49.68, lng: 4.58 },
  'Marquise': { lat: 50.81, lng: 1.71 },
  'Ondine (Orbey)': { lat: 48.13, lng: 7.16 },
  'St-Géron': { lat: 45.22, lng: 3.33 },
  'Alpes (Thonon)': { lat: 46.37, lng: 6.48 },
  'Mont Dore': { lat: 45.57, lng: 2.81 },
  'Abatilles': { lat: 44.63, lng: -1.18 },
};

// Communes with direct coordinates — national coverage
const COMMUNES: Record<string, CommuneData[]> = {
  'Laqueuille': [
    { name: 'Clermont-Ferrand', coordinates: [3.087, 45.783], context: 'Puy-de-Dôme' },
    { name: 'Lyon', coordinates: [4.835, 45.764], context: 'Rhône' },
    { name: 'Saint-Étienne', coordinates: [4.39, 45.434], context: 'Loire' },
    { name: 'Limoges', coordinates: [1.261, 45.834], context: 'Haute-Vienne' },
    { name: 'Montluçon', coordinates: [2.603, 46.34], context: 'Allier' },
    { name: 'Vichy', coordinates: [3.426, 46.127], context: 'Allier' },
    { name: 'Aurillac', coordinates: [2.444, 44.926], context: 'Cantal' },
    { name: 'Le Puy-en-Velay', coordinates: [3.885, 45.043], context: 'Haute-Loire' },
    { name: 'Roanne', coordinates: [4.069, 46.034], context: 'Loire' },
    { name: 'Moulins', coordinates: [3.333, 46.567], context: 'Allier' },
  ],
  'Grand Barbier': [
    { name: 'Grenoble', coordinates: [5.724, 45.188], context: 'Isère' },
    { name: 'Lyon', coordinates: [4.835, 45.764], context: 'Rhône' },
    { name: 'Annecy', coordinates: [6.129, 45.899], context: 'Haute-Savoie' },
    { name: 'Dijon', coordinates: [5.042, 47.322], context: "Côte-d'Or" },
    { name: 'Chambéry', coordinates: [5.917, 45.564], context: 'Savoie' },
    { name: 'Valence', coordinates: [4.893, 44.934], context: 'Drôme' },
    { name: 'Bourg-en-Bresse', coordinates: [5.228, 46.206], context: 'Ain' },
    { name: 'Villefranche-sur-Saône', coordinates: [4.719, 45.99], context: 'Rhône' },
    { name: 'Vienne', coordinates: [4.878, 45.525], context: 'Isère' },
    { name: 'Annemasse', coordinates: [6.234, 46.194], context: 'Haute-Savoie' },
    { name: 'Voiron', coordinates: [5.591, 45.365], context: 'Isère' },
  ],
  'Fiée des Lois': [
    { name: 'Nantes', coordinates: [-1.553, 47.218], context: 'Loire-Atlantique' },
    { name: 'Tours', coordinates: [0.689, 47.394], context: 'Indre-et-Loire' },
    { name: 'Angers', coordinates: [-0.563, 47.473], context: 'Maine-et-Loire' },
    { name: 'Le Mans', coordinates: [0.2, 48.0], context: 'Sarthe' },
    { name: 'La Rochelle', coordinates: [-1.152, 46.16], context: 'Charente-Maritime' },
    { name: 'Poitiers', coordinates: [0.34, 46.58], context: 'Vienne' },
    { name: 'Niort', coordinates: [-0.464, 46.323], context: 'Deux-Sèvres' },
    { name: 'Cholet', coordinates: [-0.879, 47.06], context: 'Maine-et-Loire' },
    { name: 'La Roche-sur-Yon', coordinates: [-1.427, 46.671], context: 'Vendée' },
    { name: 'Saint-Nazaire', coordinates: [-2.207, 47.274], context: 'Loire-Atlantique' },
    { name: 'Laval', coordinates: [-0.77, 48.07], context: 'Mayenne' },
    { name: 'Saumur', coordinates: [-0.078, 47.26], context: 'Maine-et-Loire' },
  ],
  'Sainte-Sophie': [
    { name: 'Orléans', coordinates: [1.91, 47.902], context: 'Loiret' },
    { name: 'Tours', coordinates: [0.689, 47.394], context: 'Indre-et-Loire' },
    { name: 'Le Mans', coordinates: [0.2, 48.0], context: 'Sarthe' },
    { name: 'Paris', coordinates: [2.352, 48.857], context: 'Île-de-France' },
    { name: 'Blois', coordinates: [1.331, 47.586], context: 'Loir-et-Cher' },
    { name: 'Chartres', coordinates: [1.488, 48.456], context: 'Eure-et-Loir' },
    { name: 'Bourges', coordinates: [2.398, 47.082], context: 'Cher' },
    { name: 'Châteauroux', coordinates: [1.693, 46.81], context: 'Indre' },
    { name: 'Dreux', coordinates: [1.366, 48.736], context: 'Eure-et-Loir' },
    { name: 'Vendôme', coordinates: [1.066, 47.793], context: 'Loir-et-Cher' },
  ],
  'Pyrénéa': [
    { name: 'Toulouse', coordinates: [1.444, 43.605], context: 'Haute-Garonne' },
    { name: 'Perpignan', coordinates: [2.896, 42.699], context: 'Pyrénées-Orientales' },
    { name: 'Bordeaux', coordinates: [-0.58, 44.838], context: 'Gironde' },
    { name: 'Pau', coordinates: [-0.37, 43.3], context: 'Pyrénées-Atlantiques' },
    { name: 'Bayonne', coordinates: [-1.475, 43.493], context: 'Pyrénées-Atlantiques' },
    { name: 'Tarbes', coordinates: [0.078, 43.233], context: 'Hautes-Pyrénées' },
    { name: 'Carcassonne', coordinates: [2.35, 43.212], context: 'Aude' },
    { name: 'Montauban', coordinates: [1.354, 44.018], context: 'Tarn-et-Garonne' },
    { name: 'Auch', coordinates: [0.586, 43.646], context: 'Gers' },
    { name: 'Foix', coordinates: [1.605, 42.966], context: 'Ariège' },
    { name: 'Lourdes', coordinates: [-0.045, 43.094], context: 'Hautes-Pyrénées' },
    { name: 'Biarritz', coordinates: [-1.559, 43.483], context: 'Pyrénées-Atlantiques' },
  ],
  'Roche des Écrins': [
    { name: 'Grenoble', coordinates: [5.724, 45.188], context: 'Isère' },
    { name: 'Lyon', coordinates: [4.835, 45.764], context: 'Rhône' },
    { name: 'Nice', coordinates: [7.262, 43.71], context: 'Alpes-Maritimes' },
    { name: 'Marseille', coordinates: [5.369, 43.297], context: 'Bouches-du-Rhône' },
    { name: 'Gap', coordinates: [6.079, 44.559], context: 'Hautes-Alpes' },
    { name: 'Briançon', coordinates: [6.643, 44.897], context: 'Hautes-Alpes' },
    { name: 'Aix-en-Provence', coordinates: [5.447, 43.529], context: 'Bouches-du-Rhône' },
    { name: 'Avignon', coordinates: [4.806, 43.949], context: 'Vaucluse' },
    { name: 'Valence', coordinates: [4.893, 44.934], context: 'Drôme' },
    { name: 'Montélimar', coordinates: [4.75, 44.558], context: 'Drôme' },
  ],
  "Saint-Martin d'Abbat": [
    { name: 'Orléans', coordinates: [1.91, 47.902], context: 'Loiret' },
    { name: 'Paris', coordinates: [2.352, 48.857], context: 'Île-de-France' },
    { name: 'Tours', coordinates: [0.689, 47.394], context: 'Indre-et-Loire' },
    { name: 'Montargis', coordinates: [2.733, 47.997], context: 'Loiret' },
    { name: 'Pithiviers', coordinates: [2.252, 48.172], context: 'Loiret' },
    { name: 'Gien', coordinates: [2.63, 47.684], context: 'Loiret' },
    { name: 'Étampes', coordinates: [2.162, 48.437], context: 'Essonne' },
    { name: 'Nemours', coordinates: [2.696, 48.265], context: 'Seine-et-Marne' },
  ],
  'Louise': [
    { name: 'Strasbourg', coordinates: [7.751, 48.573], context: 'Bas-Rhin' },
    { name: 'Mulhouse', coordinates: [7.339, 47.75], context: 'Haut-Rhin' },
    { name: 'Nancy', coordinates: [6.184, 48.693], context: 'Meurthe-et-Moselle' },
    { name: 'Metz', coordinates: [6.176, 49.12], context: 'Moselle' },
    { name: 'Colmar', coordinates: [7.359, 48.079], context: 'Haut-Rhin' },
    { name: 'Haguenau', coordinates: [7.79, 48.816], context: 'Bas-Rhin' },
    { name: 'Épinal', coordinates: [6.449, 48.174], context: 'Vosges' },
    { name: 'Saint-Dié', coordinates: [6.949, 48.289], context: 'Vosges' },
    { name: 'Sélestat', coordinates: [7.453, 48.26], context: 'Bas-Rhin' },
  ],
  'Ophélie': [
    { name: 'Besançon', coordinates: [6.024, 47.241], context: 'Doubs' },
    { name: 'Dijon', coordinates: [5.042, 47.322], context: "Côte-d'Or" },
    { name: 'Mulhouse', coordinates: [7.339, 47.75], context: 'Haut-Rhin' },
    { name: 'Belfort', coordinates: [6.866, 47.638], context: 'Territoire de Belfort' },
    { name: 'Dole', coordinates: [5.497, 47.095], context: 'Jura' },
    { name: 'Lons-le-Saunier', coordinates: [5.552, 46.674], context: 'Jura' },
    { name: 'Pontarlier', coordinates: [6.354, 46.907], context: 'Doubs' },
    { name: 'Montbéliard', coordinates: [6.798, 47.51], context: 'Doubs' },
  ],
  'Kirkel': [
    { name: 'Strasbourg', coordinates: [7.751, 48.573], context: 'Bas-Rhin' },
    { name: 'Metz', coordinates: [6.176, 49.12], context: 'Moselle' },
    { name: 'Nancy', coordinates: [6.184, 48.693], context: 'Meurthe-et-Moselle' },
    { name: 'Mulhouse', coordinates: [7.339, 47.75], context: 'Haut-Rhin' },
    { name: 'Thionville', coordinates: [6.168, 49.358], context: 'Moselle' },
    { name: 'Forbach', coordinates: [6.9, 49.189], context: 'Moselle' },
    { name: 'Sarreguemines', coordinates: [7.069, 49.11], context: 'Moselle' },
    { name: 'Sarrebourg', coordinates: [7.053, 48.735], context: 'Moselle' },
    { name: 'Verdun', coordinates: [5.383, 49.16], context: 'Meuse' },
  ],
  'Montclar': [
    { name: 'Marseille', coordinates: [5.369, 43.297], context: 'Bouches-du-Rhône' },
    { name: 'Nice', coordinates: [7.262, 43.71], context: 'Alpes-Maritimes' },
    { name: 'Toulon', coordinates: [5.928, 43.124], context: 'Var' },
    { name: 'Aix-en-Provence', coordinates: [5.447, 43.529], context: 'Bouches-du-Rhône' },
    { name: 'Avignon', coordinates: [4.806, 43.949], context: 'Vaucluse' },
    { name: 'Nîmes', coordinates: [4.36, 43.837], context: 'Gard' },
    { name: 'Montpellier', coordinates: [3.877, 43.611], context: 'Hérault' },
    { name: 'Cannes', coordinates: [7.018, 43.552], context: 'Alpes-Maritimes' },
    { name: 'Antibes', coordinates: [7.121, 43.58], context: 'Alpes-Maritimes' },
    { name: 'Digne-les-Bains', coordinates: [6.238, 44.093], context: 'Alpes-de-Haute-Provence' },
  ],
  'Wüllner': [
    { name: 'Lille', coordinates: [3.057, 50.633], context: 'Nord' },
    { name: 'Dunkerque', coordinates: [2.377, 51.034], context: 'Nord' },
    { name: 'Valenciennes', coordinates: [3.524, 50.358], context: 'Nord' },
    { name: 'Douai', coordinates: [3.079, 50.372], context: 'Nord' },
    { name: 'Arras', coordinates: [2.774, 50.292], context: 'Pas-de-Calais' },
    { name: 'Lens', coordinates: [2.833, 50.433], context: 'Pas-de-Calais' },
    { name: 'Roubaix', coordinates: [3.174, 50.694], context: 'Nord' },
    { name: 'Tourcoing', coordinates: [3.159, 50.724], context: 'Nord' },
    { name: 'Calais', coordinates: [1.858, 50.951], context: 'Pas-de-Calais' },
    { name: 'Boulogne-sur-Mer', coordinates: [1.614, 50.726], context: 'Pas-de-Calais' },
  ],
  'Jandun': [
    { name: 'Reims', coordinates: [3.878, 49.253], context: 'Marne' },
    { name: 'Charleville-Mézières', coordinates: [4.717, 49.772], context: 'Ardennes' },
    { name: 'Troyes', coordinates: [4.074, 48.297], context: 'Aube' },
    { name: 'Châlons-en-Champagne', coordinates: [4.363, 48.956], context: 'Marne' },
    { name: 'Sedan', coordinates: [4.941, 49.702], context: 'Ardennes' },
    { name: 'Épernay', coordinates: [3.952, 49.04], context: 'Marne' },
    { name: 'Laon', coordinates: [3.624, 49.563], context: 'Aisne' },
    { name: 'Saint-Quentin', coordinates: [3.287, 49.847], context: 'Aisne' },
    { name: 'Soissons', coordinates: [3.324, 49.382], context: 'Aisne' },
  ],
  'Marquise': [
    { name: 'Calais', coordinates: [1.858, 50.951], context: 'Pas-de-Calais' },
    { name: 'Boulogne-sur-Mer', coordinates: [1.614, 50.726], context: 'Pas-de-Calais' },
    { name: 'Dunkerque', coordinates: [2.377, 51.034], context: 'Nord' },
    { name: 'Saint-Omer', coordinates: [2.261, 50.749], context: 'Pas-de-Calais' },
    { name: 'Lille', coordinates: [3.057, 50.633], context: 'Nord' },
    { name: 'Arras', coordinates: [2.774, 50.292], context: 'Pas-de-Calais' },
    { name: 'Montreuil', coordinates: [1.763, 50.464], context: 'Pas-de-Calais' },
    { name: 'Béthune', coordinates: [2.64, 50.529], context: 'Pas-de-Calais' },
  ],
  'Ondine (Orbey)': [
    { name: 'Strasbourg', coordinates: [7.751, 48.573], context: 'Bas-Rhin' },
    { name: 'Colmar', coordinates: [7.359, 48.079], context: 'Haut-Rhin' },
    { name: 'Mulhouse', coordinates: [7.339, 47.75], context: 'Haut-Rhin' },
    { name: 'Sélestat', coordinates: [7.453, 48.26], context: 'Bas-Rhin' },
    { name: 'Obernai', coordinates: [7.482, 48.462], context: 'Bas-Rhin' },
    { name: 'Saverne', coordinates: [7.362, 48.741], context: 'Bas-Rhin' },
    { name: 'Guebwiller', coordinates: [7.213, 47.91], context: 'Haut-Rhin' },
    { name: 'Ribeauvillé', coordinates: [7.321, 48.194], context: 'Haut-Rhin' },
  ],
  'St-Géron': [
    { name: 'Clermont-Ferrand', coordinates: [3.087, 45.783], context: 'Puy-de-Dôme' },
    { name: 'Saint-Étienne', coordinates: [4.39, 45.434], context: 'Loire' },
    { name: 'Lyon', coordinates: [4.835, 45.764], context: 'Rhône' },
    { name: 'Le Puy-en-Velay', coordinates: [3.885, 45.043], context: 'Haute-Loire' },
    { name: 'Aurillac', coordinates: [2.444, 44.926], context: 'Cantal' },
    { name: 'Montluçon', coordinates: [2.603, 46.34], context: 'Allier' },
    { name: 'Vichy', coordinates: [3.426, 46.127], context: 'Allier' },
    { name: 'Issoire', coordinates: [3.249, 45.544], context: 'Puy-de-Dôme' },
    { name: 'Brioude', coordinates: [3.385, 45.293], context: 'Haute-Loire' },
    { name: 'Riom', coordinates: [3.115, 45.893], context: 'Puy-de-Dôme' },
  ],
  'Alpes (Thonon)': [
    { name: 'Annecy', coordinates: [6.129, 45.899], context: 'Haute-Savoie' },
    { name: 'Grenoble', coordinates: [5.724, 45.188], context: 'Isère' },
    { name: 'Chambéry', coordinates: [5.917, 45.564], context: 'Savoie' },
    { name: 'Lyon', coordinates: [4.835, 45.764], context: 'Rhône' },
    { name: 'Thonon-les-Bains', coordinates: [6.478, 46.371], context: 'Haute-Savoie' },
    { name: 'Annemasse', coordinates: [6.234, 46.194], context: 'Haute-Savoie' },
    { name: 'Aix-les-Bains', coordinates: [5.909, 45.688], context: 'Savoie' },
    { name: 'Albertville', coordinates: [6.393, 45.676], context: 'Savoie' },
    { name: 'Cluses', coordinates: [6.585, 46.063], context: 'Haute-Savoie' },
  ],
  'Mont Dore': [
    { name: 'Clermont-Ferrand', coordinates: [3.087, 45.783], context: 'Puy-de-Dôme' },
    { name: 'Limoges', coordinates: [1.261, 45.834], context: 'Haute-Vienne' },
    { name: 'Tulle', coordinates: [1.77, 45.267], context: 'Corrèze' },
    { name: 'Brive-la-Gaillarde', coordinates: [1.534, 45.159], context: 'Corrèze' },
    { name: 'Guéret', coordinates: [1.871, 46.171], context: 'Creuse' },
    { name: 'Ussel', coordinates: [2.311, 45.548], context: 'Corrèze' },
    { name: 'Mauriac', coordinates: [2.333, 45.219], context: 'Cantal' },
    { name: 'Saint-Flour', coordinates: [3.093, 45.034], context: 'Cantal' },
  ],
  'Clairvic': [
    { name: 'Clermont-Ferrand', coordinates: [3.087, 45.783], context: 'Puy-de-Dôme' },
    { name: 'Lyon', coordinates: [4.835, 45.764], context: 'Rhône' },
    { name: 'Saint-Étienne', coordinates: [4.39, 45.434], context: 'Loire' },
    { name: 'Vichy', coordinates: [3.426, 46.127], context: 'Allier' },
    { name: 'Moulins', coordinates: [3.333, 46.567], context: 'Allier' },
    { name: 'Thiers', coordinates: [3.549, 45.857], context: 'Puy-de-Dôme' },
    { name: 'Riom', coordinates: [3.115, 45.893], context: 'Puy-de-Dôme' },
    { name: 'Issoire', coordinates: [3.249, 45.544], context: 'Puy-de-Dôme' },
    { name: 'Roanne', coordinates: [4.069, 46.034], context: 'Loire' },
  ],
  'Abatilles': [
    { name: 'Bordeaux', coordinates: [-0.58, 44.838], context: 'Gironde' },
    { name: 'Arcachon', coordinates: [-1.163, 44.661], context: 'Gironde' },
    { name: 'La Teste-de-Buch', coordinates: [-1.142, 44.634], context: 'Gironde' },
    { name: 'Pessac', coordinates: [-0.631, 44.807], context: 'Gironde' },
    { name: 'Mérignac', coordinates: [-0.643, 44.844], context: 'Gironde' },
    { name: 'Libourne', coordinates: [-0.239, 44.919], context: 'Gironde' },
    { name: 'Langon', coordinates: [-0.254, 44.556], context: 'Gironde' },
    { name: 'Agen', coordinates: [0.62, 44.203], context: 'Lot-et-Garonne' },
  ],
  'Multi-sources': [
    { name: 'Paris', coordinates: [2.352, 48.857], context: 'Île-de-France' },
    { name: 'Lyon', coordinates: [4.835, 45.764], context: 'Rhône' },
    { name: 'Marseille', coordinates: [5.369, 43.297], context: 'Bouches-du-Rhône' },
    { name: 'Toulouse', coordinates: [1.444, 43.605], context: 'Haute-Garonne' },
    { name: 'Bordeaux', coordinates: [-0.58, 44.838], context: 'Gironde' },
    { name: 'Lille', coordinates: [3.057, 50.633], context: 'Nord' },
    { name: 'Nantes', coordinates: [-1.553, 47.218], context: 'Loire-Atlantique' },
    { name: 'Strasbourg', coordinates: [7.751, 48.573], context: 'Bas-Rhin' },
    { name: 'Rennes', coordinates: [-1.678, 48.114], context: 'Ille-et-Vilaine' },
    { name: 'Montpellier', coordinates: [3.877, 43.611], context: 'Hérault' },
    { name: 'Rouen', coordinates: [1.098, 49.443], context: 'Seine-Maritime' },
    { name: 'Reims', coordinates: [3.878, 49.253], context: 'Marne' },
  ],
};

// Raw distributor data — enriched MDD catalog
const RAW_DISTRIBUTORS = [
  // E.Leclerc
  { retailer: 'E.Leclerc', mddBrand: 'Marque Repère – Eau de source', source: 'Laqueuille', category: 'Eau de source' },
  { retailer: 'E.Leclerc', mddBrand: 'Eco+ – Eau de source', source: 'Laqueuille', category: 'Eau de source' },
  { retailer: 'E.Leclerc', mddBrand: 'Eco+ – Eau minérale (Clairvic)', source: 'Clairvic', category: 'EMN' },

  // Carrefour
  { retailer: 'Carrefour', mddBrand: "Carrefour Classic' – Eau de source", source: 'Grand Barbier', category: 'Eau de source' },
  { retailer: 'Carrefour', mddBrand: 'Carrefour – Eau de source des Alpes', source: 'Alpes (Thonon)', category: 'Eau de source' },
  { retailer: 'Carrefour', mddBrand: 'Carrefour – Eau minérale (Auvergne)', source: 'St-Géron', category: 'EMN' },

  // Intermarché
  { retailer: 'Intermarché', mddBrand: 'Top Budget – Eau de source', source: 'Fiée des Lois', category: 'Eau de source' },
  { retailer: 'Intermarché', mddBrand: 'Paquito – Eau de source', source: 'Mont Dore', category: 'Eau de source' },

  // Système U
  { retailer: 'Système U', mddBrand: 'U – Eau de source', source: 'Sainte-Sophie', category: 'Eau de source' },
  { retailer: 'Système U', mddBrand: 'U – Eau de source Ondine', source: 'Ondine (Orbey)', category: 'Eau de source' },

  // Auchan
  { retailer: 'Auchan', mddBrand: 'Auchan – Eau de source (Pyrénéa)', source: 'Pyrénéa', category: 'Eau de source' },
  { retailer: 'Auchan', mddBrand: 'Auchan – Eau minérale (Auvergne)', source: 'St-Géron', category: 'EMN' },

  // Casino
  { retailer: 'Casino', mddBrand: 'Casino – Eau de source', source: 'Roche des Écrins', category: 'Eau de source' },
  { retailer: 'Casino', mddBrand: 'Leader Price – Eau de source', source: 'Abatilles', category: 'Eau de source' },

  // Cora
  { retailer: 'Cora', mddBrand: 'Cora – Ondine', source: "Saint-Martin d'Abbat", category: 'Eau de source' },
  { retailer: 'Cora', mddBrand: 'Cora – Eau minérale', source: 'St-Géron', category: 'EMN' },

  // Lidl
  { retailer: 'Lidl', mddBrand: 'Saskia – Eau de source (Kirkel)', source: 'Kirkel', category: 'Eau de source' },
  { retailer: 'Lidl', mddBrand: 'Saskia – Eau de source (Wüllner)', source: 'Wüllner', category: 'Eau de source' },
  { retailer: 'Lidl', mddBrand: 'Saskia – Eau de source (Jandun)', source: 'Jandun', category: 'Eau de source' },

  // Aldi
  { retailer: 'Aldi', mddBrand: 'Rocheval – Eau de source (Louise)', source: 'Louise', category: 'Eau de source' },
  { retailer: 'Aldi', mddBrand: 'Rocheval – Eau de source (Ophélie)', source: 'Ophélie', category: 'Eau de source' },
  { retailer: 'Aldi', mddBrand: 'Rocheval – Eau de source (Marquise)', source: 'Marquise', category: 'Eau de source' },

  // Monoprix / Franprix
  { retailer: 'Monoprix', mddBrand: 'Monoprix – Eau de source Montclar', source: 'Montclar', category: 'Eau de source' },
  { retailer: 'Franprix', mddBrand: 'Franprix – Eau de source Montclar', source: 'Montclar', category: 'Eau de source' },
];

// ── Industrial sites with real/estimated GPS coordinates ──
export interface IndustrialStep {
  type: 'analyse' | 'traitement' | 'embouteillage' | 'stockage' | 'logistique';
  name: string;
  coordinates: [number, number]; // [lng, lat]
  description: string;
}

// For EMN: analysis/treatment/bottling/storage are at or very near the source (regulatory requirement).
// Logistics platforms are the retailer's regional warehouse — geographically distinct.
const LOGISTICS_PLATFORMS: Record<string, { coordinates: [number, number]; name: string }> = {
  'E.Leclerc': { coordinates: [3.13, 45.73], name: 'Plateforme Leclerc Cournon-d\'Auvergne' },
  'Carrefour': { coordinates: [4.95, 45.69], name: 'Entrepôt Carrefour Vénissieux' },
  'Intermarché': { coordinates: [-0.42, 46.38], name: 'Base ITM Niort' },
  'Système U': { coordinates: [1.65, 47.65], name: 'Centrale U Vendôme' },
  'Auchan': { coordinates: [3.15, 50.62], name: 'Entrepôt Auchan Lesquin' },
  'Casino': { coordinates: [4.42, 45.46], name: 'Easydis Saint-Étienne' },
  'Cora': { coordinates: [6.22, 48.72], name: 'Entrepôt Cora Ludres' },
  'Lidl': { coordinates: [7.75, 48.58], name: 'Plateforme Lidl Strasbourg' },
  'Aldi': { coordinates: [2.95, 49.85], name: 'Plateforme Aldi Laon' },
  'Monoprix': { coordinates: [2.35, 48.93], name: 'Entrepôt Monoprix Gennevilliers' },
  'Franprix': { coordinates: [2.42, 48.88], name: 'Plateforme Franprix Paris Est' },
};

// Small offsets from source to simulate distinct on-site facilities
function getIndustrialStepsForSource(
  sourceName: string,
  sourceLng: number,
  sourceLat: number,
  retailer: string,
): IndustrialStep[] {
  const logistics = LOGISTICS_PLATFORMS[retailer] || {
    coordinates: [2.35, 48.86] as [number, number],
    name: `Plateforme logistique ${retailer}`,
  };

  return [
    {
      type: 'analyse',
      name: `Laboratoire – ${sourceName}`,
      coordinates: [sourceLng + 0.012, sourceLat + 0.008],
      description: 'Analyses bactériologiques et physico-chimiques en continu',
    },
    {
      type: 'traitement',
      name: `Station de traitement – ${sourceName}`,
      coordinates: [sourceLng - 0.008, sourceLat + 0.015],
      description: 'Filtration, ozonation et traitement UV selon la source',
    },
    {
      type: 'embouteillage',
      name: `Usine d'embouteillage – ${sourceName}`,
      coordinates: [sourceLng + 0.02, sourceLat - 0.01],
      description: 'Remplissage, bouchage, étiquetage et mise en pack',
    },
    {
      type: 'stockage',
      name: `Entrepôt – ${sourceName}`,
      coordinates: [sourceLng - 0.015, sourceLat - 0.02],
      description: 'Palettisation, contrôle qualité des lots, stockage tampon',
    },
    {
      type: 'logistique',
      name: logistics.name,
      coordinates: logistics.coordinates,
      description: `Plateforme régionale ${retailer} — réception, éclatement et expédition vers magasins`,
    },
  ];
}

export function getIndustrialSteps(sourceName: string, retailer: string): IndustrialStep[] {
  const coords = SOURCE_COORDS[sourceName];
  if (!coords) return [];
  return getIndustrialStepsForSource(sourceName, coords.lng, coords.lat, retailer);
}

function getCommunesForSource(sourceName: string): CommuneData[] {
  return COMMUNES[sourceName] || COMMUNES['Multi-sources'] || [];
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
    communes: getCommunesForSource(d.source),
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
