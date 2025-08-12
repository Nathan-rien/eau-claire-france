// Base de données locale des principales villes françaises pour contourner les problèmes d'API
export interface CityData {
  name: string;
  postcode: string;
  citycode: string;
  context: string;
  coordinates: [number, number]; // [longitude, latitude]
  score?: number; // Score optionnel pour le classement
}

export const FRENCH_CITIES: CityData[] = [
  { name: "Paris", postcode: "75000", citycode: "75056", context: "Île-de-France", coordinates: [2.3522, 48.8566] },
  { name: "Marseille", postcode: "13000", citycode: "13055", context: "Provence-Alpes-Côte d'Azur", coordinates: [5.3698, 43.2965] },
  { name: "Lyon", postcode: "69000", citycode: "69123", context: "Auvergne-Rhône-Alpes", coordinates: [4.8357, 45.7640] },
  { name: "Toulouse", postcode: "31000", citycode: "31555", context: "Occitanie", coordinates: [1.4442, 43.6047] },
  { name: "Nice", postcode: "06000", citycode: "06088", context: "Provence-Alpes-Côte d'Azur", coordinates: [7.2620, 43.7102] },
  { name: "Nantes", postcode: "44000", citycode: "44109", context: "Pays de la Loire", coordinates: [-1.5534, 47.2184] },
  { name: "Strasbourg", postcode: "67000", citycode: "67482", context: "Grand Est", coordinates: [7.7521, 48.5734] },
  { name: "Montpellier", postcode: "34000", citycode: "34172", context: "Occitanie", coordinates: [3.8767, 43.6108] },
  { name: "Bordeaux", postcode: "33000", citycode: "33063", context: "Nouvelle-Aquitaine", coordinates: [-0.5792, 44.8378] },
  { name: "Lille", postcode: "59000", citycode: "59350", context: "Hauts-de-France", coordinates: [3.0573, 50.6292] },
  { name: "Rennes", postcode: "35000", citycode: "35238", context: "Bretagne", coordinates: [-1.6778, 48.1173] },
  { name: "Reims", postcode: "51100", citycode: "51454", context: "Grand Est", coordinates: [4.0317, 49.2583] },
  { name: "Saint-Étienne", postcode: "42000", citycode: "42218", context: "Auvergne-Rhône-Alpes", coordinates: [4.3872, 45.4397] },
  { name: "Le Havre", postcode: "76600", citycode: "76351", context: "Normandie", coordinates: [0.1079, 49.4944] },
  { name: "Toulon", postcode: "83000", citycode: "83137", context: "Provence-Alpes-Côte d'Azur", coordinates: [5.9280, 43.1242] },
  { name: "Grenoble", postcode: "38000", citycode: "38185", context: "Auvergne-Rhône-Alpes", coordinates: [5.7243, 45.1885] },
  { name: "Dijon", postcode: "21000", citycode: "21231", context: "Bourgogne-Franche-Comté", coordinates: [5.0415, 47.3220] },
  { name: "Angers", postcode: "49000", citycode: "49007", context: "Pays de la Loire", coordinates: [-0.5579, 47.4784] },
  { name: "Nîmes", postcode: "30000", citycode: "30189", context: "Occitanie", coordinates: [4.3601, 43.8367] },
  { name: "Villeurbanne", postcode: "69100", citycode: "69266", context: "Auvergne-Rhône-Alpes", coordinates: [4.8794, 45.7667] },
  { name: "Le Mans", postcode: "72000", citycode: "72181", context: "Pays de la Loire", coordinates: [0.1996, 47.9959] },
  { name: "Aix-en-Provence", postcode: "13100", citycode: "13001", context: "Provence-Alpes-Côte d'Azur", coordinates: [5.4474, 43.5297] },
  { name: "Clermont-Ferrand", postcode: "63000", citycode: "63113", context: "Auvergne-Rhône-Alpes", coordinates: [3.0863, 45.7772] },
  { name: "Brest", postcode: "29200", citycode: "29019", context: "Bretagne", coordinates: [-4.4860, 48.3905] },
  { name: "Tours", postcode: "37000", citycode: "37261", context: "Centre-Val de Loire", coordinates: [0.6848, 47.3941] },
  { name: "Limoges", postcode: "87000", citycode: "87085", context: "Nouvelle-Aquitaine", coordinates: [1.2578, 45.8336] },
  { name: "Amiens", postcode: "80000", citycode: "80021", context: "Hauts-de-France", coordinates: [2.2958, 49.8941] },
  { name: "Annecy", postcode: "74000", citycode: "74010", context: "Auvergne-Rhône-Alpes", coordinates: [6.1294, 45.8992] },
  { name: "Perpignan", postcode: "66000", citycode: "66136", context: "Occitanie", coordinates: [2.8956, 42.6886] },
  { name: "Besançon", postcode: "25000", citycode: "25056", context: "Bourgogne-Franche-Comté", coordinates: [6.0240, 47.2378] },
  { name: "Metz", postcode: "57000", citycode: "57463", context: "Grand Est", coordinates: [6.1757, 49.1193] },
  { name: "Orléans", postcode: "45000", citycode: "45234", context: "Centre-Val de Loire", coordinates: [1.9039, 47.9029] },
  { name: "Rouen", postcode: "76000", citycode: "76540", context: "Normandie", coordinates: [1.0993, 49.4431] },
  { name: "Mulhouse", postcode: "68100", citycode: "68224", context: "Grand Est", coordinates: [7.3359, 47.7508] },
  { name: "Caen", postcode: "14000", citycode: "14118", context: "Normandie", coordinates: [-0.3591, 49.1829] },
  { name: "Nancy", postcode: "54000", citycode: "54395", context: "Grand Est", coordinates: [6.1840, 48.6921] }
];

// Fonction pour rechercher des villes par nom
export const searchCities = (query: string): CityData[] => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return FRENCH_CITIES
    .filter(city => 
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.postcode.includes(normalizedQuery)
    )
    .slice(0, 5)
    .map(city => ({
      ...city,
      score: city.name.toLowerCase().startsWith(normalizedQuery) ? 1 : 0.8
    }));
};

// Fonction pour trouver la ville la plus proche par coordonnées
export const findNearestCity = (latitude: number, longitude: number): CityData | null => {
  if (!latitude || !longitude) return null;
  
  let nearestCity: CityData | null = null;
  let minDistance = Infinity;
  
  FRENCH_CITIES.forEach(city => {
    const distance = calculateDistance(
      latitude, longitude,
      city.coordinates[1], city.coordinates[0]
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });
  
  return nearestCity;
};

// Calcul de distance entre deux points (formule haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}