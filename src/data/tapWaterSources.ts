
export interface TapWaterStep {
  name: string;
  type: 'captage' | 'traitement' | 'reservoir' | 'commune';
  lat: number;
  lng: number;
  description: string;
}

export interface ServedCommune {
  name: string;
  lat: number;
  lng: number;
  population?: number;
}

export interface TapWaterRoute {
  id: string;
  city: string;
  region: string;
  sourceType: 'nappe' | 'riviere' | 'lac' | 'canal';
  steps: TapWaterStep[];
  communes?: ServedCommune[];
}

export const TAP_WATER_ROUTES: TapWaterRoute[] = [
  // ── Île-de-France ──
  {
    id: 'paris',
    city: 'Paris',
    region: 'Île-de-France',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Seine (Orly)', type: 'captage', lat: 48.7262, lng: 2.3652, description: "Prise d'eau en Seine à Orly" },
      { name: 'Usine de Choisy-le-Roi', type: 'traitement', lat: 48.7644, lng: 2.4103, description: 'Station de traitement Eau de Paris' },
      { name: 'Réservoir de Montsouris', type: 'reservoir', lat: 48.8222, lng: 2.3387, description: 'Réservoir enterré, 200 000 m³' },
      { name: 'Paris', type: 'commune', lat: 48.8566, lng: 2.3522, description: 'Distribution aux 2,1 M d\'habitants' },
    ],
    communes: [
      { name: 'Boulogne-Billancourt', lat: 48.8352, lng: 2.2399, population: 121000 },
      { name: 'Montreuil', lat: 48.8638, lng: 2.4484, population: 109000 },
      { name: 'Saint-Denis', lat: 48.9362, lng: 2.3574, population: 113000 },
      { name: 'Nanterre', lat: 48.8924, lng: 2.2071, population: 96000 },
      { name: 'Créteil', lat: 48.7911, lng: 2.4628, population: 92000 },
      { name: 'Argenteuil', lat: 48.9472, lng: 2.2467, population: 113000 },
      { name: 'Colombes', lat: 48.9226, lng: 2.2536, population: 85000 },
      { name: 'Courbevoie', lat: 48.8966, lng: 2.2524, population: 83000 },
      { name: 'Vitry-sur-Seine', lat: 48.7874, lng: 2.3928, population: 94000 },
      { name: 'Ivry-sur-Seine', lat: 48.8132, lng: 2.3849, population: 64000 },
      { name: 'Aubervilliers', lat: 48.9137, lng: 2.3828, population: 89000 },
      { name: 'Pantin', lat: 48.8935, lng: 2.4024, population: 59000 },
      { name: 'Asnières-sur-Seine', lat: 48.9117, lng: 2.2858, population: 88000 },
      { name: 'Rueil-Malmaison', lat: 48.8769, lng: 2.1894, population: 80000 },
      { name: 'Clichy', lat: 48.9046, lng: 2.3058, population: 63000 },
    ],
  },
  {
    id: 'paris-marne',
    city: 'Paris (Est)',
    region: 'Île-de-France',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Marne (Joinville)', type: 'captage', lat: 48.8193, lng: 2.4622, description: "Prise d'eau en Marne" },
      { name: 'Usine de Joinville', type: 'traitement', lat: 48.8210, lng: 2.4700, description: "Usine de production d'eau potable" },
      { name: 'Réservoir de Ménilmontant', type: 'reservoir', lat: 48.8660, lng: 2.3920, description: 'Réservoir haut-service' },
      { name: 'Paris (Est)', type: 'commune', lat: 48.8630, lng: 2.3800, description: 'Arrondissements est de Paris' },
    ],
    communes: [
      { name: 'Vincennes', lat: 48.8474, lng: 2.4383, population: 50000 },
      { name: 'Nogent-sur-Marne', lat: 48.8377, lng: 2.4834, population: 33000 },
      { name: 'Fontenay-sous-Bois', lat: 48.8518, lng: 2.4775, population: 53000 },
      { name: 'Le Perreux-sur-Marne', lat: 48.8428, lng: 2.5031, population: 34000 },
      { name: 'Champigny-sur-Marne', lat: 48.8177, lng: 2.5156, population: 78000 },
      { name: 'Saint-Maur-des-Fossés', lat: 48.7953, lng: 2.4929, population: 77000 },
      { name: 'Charenton-le-Pont', lat: 48.8265, lng: 2.4133, population: 31000 },
      { name: 'Saint-Mandé', lat: 48.8454, lng: 2.4186, population: 23000 },
    ],
  },

  // ── Lyon ──
  {
    id: 'lyon',
    city: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    sourceType: 'nappe',
    steps: [
      { name: 'Champ captant de Crépieux-Charmy', type: 'captage', lat: 45.8050, lng: 4.8780, description: "Plus grand champ captant d'Europe, nappe alluviale du Rhône" },
      { name: 'Usine de Croix-Luizet', type: 'traitement', lat: 45.7780, lng: 4.8690, description: 'Traitement UV + chloration' },
      { name: 'Réservoirs de Fourvière', type: 'reservoir', lat: 45.7600, lng: 4.8200, description: 'Réservoirs en hauteur' },
      { name: 'Lyon', type: 'commune', lat: 45.7640, lng: 4.8357, description: 'Distribution Métropole de Lyon' },
    ],
    communes: [
      { name: 'Villeurbanne', lat: 45.7668, lng: 4.8799, population: 154000 },
      { name: 'Vénissieux', lat: 45.6974, lng: 4.8857, population: 66000 },
      { name: 'Vaulx-en-Velin', lat: 45.7772, lng: 4.9186, population: 52000 },
      { name: 'Caluire-et-Cuire', lat: 45.7958, lng: 4.8469, population: 43000 },
      { name: 'Bron', lat: 45.7386, lng: 4.9131, population: 42000 },
      { name: 'Écully', lat: 45.7736, lng: 4.7777, population: 18000 },
      { name: 'Oullins', lat: 45.7145, lng: 4.8100, population: 26000 },
      { name: 'Meyzieu', lat: 45.7672, lng: 5.0039, population: 34000 },
      { name: 'Rillieux-la-Pape', lat: 45.8218, lng: 4.8988, population: 32000 },
      { name: 'Décines-Charpieu', lat: 45.7681, lng: 4.9592, population: 28000 },
      { name: 'Saint-Priest', lat: 45.6969, lng: 4.9445, population: 46000 },
      { name: 'Tassin-la-Demi-Lune', lat: 45.7628, lng: 4.7625, population: 22000 },
    ],
  },

  // ── Marseille ──
  {
    id: 'marseille',
    city: 'Marseille',
    region: "Provence-Alpes-Côte d'Azur",
    sourceType: 'canal',
    steps: [
      { name: 'Lac de Serre-Ponçon (Durance)', type: 'captage', lat: 44.5000, lng: 6.3500, description: 'Retenue sur la Durance, alimentation du Canal de Marseille' },
      { name: 'Canal de Marseille', type: 'traitement', lat: 43.4500, lng: 5.4500, description: '80 km de canal depuis la Durance' },
      { name: 'Usine de Sainte-Marthe', type: 'traitement', lat: 43.3400, lng: 5.3800, description: 'Principale usine de traitement' },
      { name: 'Marseille', type: 'commune', lat: 43.2965, lng: 5.3698, description: 'Distribution aux 870 000 habitants' },
    ],
    communes: [
      { name: 'Aubagne', lat: 43.2927, lng: 5.5712, population: 48000 },
      { name: 'Martigues', lat: 43.4055, lng: 5.0474, population: 49000 },
      { name: 'La Ciotat', lat: 43.1747, lng: 5.6044, population: 36000 },
      { name: 'Aix-en-Provence', lat: 43.5297, lng: 5.4474, population: 145000 },
      { name: 'Vitrolles', lat: 43.4601, lng: 5.2489, population: 35000 },
      { name: 'Salon-de-Provence', lat: 43.6407, lng: 5.0973, population: 45000 },
      { name: 'Istres', lat: 43.5133, lng: 4.9871, population: 44000 },
      { name: 'Cassis', lat: 43.2141, lng: 5.5393, population: 7500 },
      { name: 'Allauch', lat: 43.3358, lng: 5.4838, population: 21000 },
      { name: 'Plan-de-Cuques', lat: 43.3484, lng: 5.4618, population: 12000 },
    ],
  },

  // ── Bordeaux ──
  {
    id: 'bordeaux',
    city: 'Bordeaux',
    region: 'Nouvelle-Aquitaine',
    sourceType: 'nappe',
    steps: [
      { name: "Nappe de l'Oligocène", type: 'captage', lat: 44.8700, lng: -0.6200, description: 'Nappe profonde captée à 100-300 m' },
      { name: 'Usine de Paulin', type: 'traitement', lat: 44.8550, lng: -0.5900, description: 'Déferrisation et traitement' },
      { name: "Château d'eau de Bordeaux", type: 'reservoir', lat: 44.8450, lng: -0.5800, description: 'Stockage et distribution gravitaire' },
      { name: 'Bordeaux', type: 'commune', lat: 44.8378, lng: -0.5792, description: 'Distribution Bordeaux Métropole' },
    ],
    communes: [
      { name: 'Mérignac', lat: 44.8386, lng: -0.6438, population: 73000 },
      { name: 'Pessac', lat: 44.8067, lng: -0.6311, population: 65000 },
      { name: 'Talence', lat: 44.8126, lng: -0.5875, population: 43000 },
      { name: 'Bègles', lat: 44.8085, lng: -0.5485, population: 29000 },
      { name: 'Villenave-d\'Ornon', lat: 44.7804, lng: -0.5579, population: 37000 },
      { name: 'Cenon', lat: 44.8570, lng: -0.5322, population: 25000 },
      { name: 'Lormont', lat: 44.8754, lng: -0.5231, population: 23000 },
      { name: 'Le Bouscat', lat: 44.8627, lng: -0.5983, population: 24000 },
      { name: 'Bruges', lat: 44.8789, lng: -0.6130, population: 18000 },
      { name: 'Gradignan', lat: 44.7723, lng: -0.6155, population: 26000 },
    ],
  },

  // ── Lille ──
  {
    id: 'lille',
    city: 'Lille',
    region: 'Hauts-de-France',
    sourceType: 'nappe',
    steps: [
      { name: 'Nappe de la Craie (Emmerin)', type: 'captage', lat: 50.5900, lng: 3.0200, description: 'Captage dans la nappe crayeuse' },
      { name: "Usine d'Emmerin", type: 'traitement', lat: 50.5950, lng: 3.0150, description: 'Ultrafiltration membranaire' },
      { name: 'Réservoir de Lille', type: 'reservoir', lat: 50.6260, lng: 3.0520, description: 'Stockage et régulation pression' },
      { name: 'Lille', type: 'commune', lat: 50.6292, lng: 3.0573, description: 'Distribution MEL (1,2 M hab.)' },
    ],
    communes: [
      { name: 'Roubaix', lat: 50.6942, lng: 3.1746, population: 98000 },
      { name: 'Tourcoing', lat: 50.7240, lng: 3.1613, population: 98000 },
      { name: 'Villeneuve-d\'Ascq', lat: 50.6232, lng: 3.1413, population: 62000 },
      { name: 'Wattrelos', lat: 50.7016, lng: 3.2179, population: 41000 },
      { name: 'Marcq-en-Barœul', lat: 50.6713, lng: 3.0936, population: 40000 },
      { name: 'Lambersart', lat: 50.6521, lng: 3.0254, population: 28000 },
      { name: 'Croix', lat: 50.6788, lng: 3.1490, population: 21000 },
      { name: 'Hem', lat: 50.6551, lng: 3.1895, population: 19000 },
      { name: 'Wasquehal', lat: 50.6693, lng: 3.1282, population: 20000 },
      { name: 'Mons-en-Barœul', lat: 50.6390, lng: 3.1110, population: 21000 },
    ],
  },

  // ── Toulouse ──
  {
    id: 'toulouse',
    city: 'Toulouse',
    region: 'Occitanie',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Garonne (Pinsaguel)', type: 'captage', lat: 43.5100, lng: 1.3900, description: "Prise d'eau dans la Garonne" },
      { name: 'Usine de Clairfont', type: 'traitement', lat: 43.5300, lng: 1.4000, description: 'Filtration et ozonation' },
      { name: 'Réservoir de Guilhermy', type: 'reservoir', lat: 43.5850, lng: 1.4200, description: 'Réservoir semi-enterré' },
      { name: 'Toulouse', type: 'commune', lat: 43.6047, lng: 1.4442, description: 'Distribution Toulouse Métropole' },
    ],
    communes: [
      { name: 'Colomiers', lat: 43.6117, lng: 1.3334, population: 40000 },
      { name: 'Tournefeuille', lat: 43.5847, lng: 1.3452, population: 27000 },
      { name: 'Blagnac', lat: 43.6380, lng: 1.3939, population: 25000 },
      { name: 'Balma', lat: 43.6111, lng: 1.4989, population: 17000 },
      { name: 'L\'Union', lat: 43.6556, lng: 1.4831, population: 12000 },
      { name: 'Ramonville-Saint-Agne', lat: 43.5497, lng: 1.4741, population: 14000 },
      { name: 'Cugnaux', lat: 43.5370, lng: 1.3425, population: 18000 },
      { name: 'Muret', lat: 43.4614, lng: 1.3265, population: 27000 },
      { name: 'Castanet-Tolosan', lat: 43.5163, lng: 1.4987, population: 14000 },
      { name: 'Saint-Orens-de-Gameville', lat: 43.5527, lng: 1.5328, population: 13000 },
    ],
  },

  // ── Nantes ──
  {
    id: 'nantes',
    city: 'Nantes',
    region: 'Pays de la Loire',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Loire (La Roche)', type: 'captage', lat: 47.2400, lng: -1.6200, description: "Prise d'eau dans la Loire" },
      { name: 'Usine de La Roche', type: 'traitement', lat: 47.2350, lng: -1.6100, description: 'Traitement charbon actif + UV' },
      { name: 'Réservoir de La Contrie', type: 'reservoir', lat: 47.2300, lng: -1.5800, description: 'Stockage et distribution' },
      { name: 'Nantes', type: 'commune', lat: 47.2184, lng: -1.5536, description: 'Distribution Nantes Métropole' },
    ],
    communes: [
      { name: 'Saint-Herblain', lat: 47.2126, lng: -1.6497, population: 46000 },
      { name: 'Rezé', lat: 47.1828, lng: -1.5659, population: 42000 },
      { name: 'Saint-Nazaire', lat: 47.2733, lng: -2.2130, population: 72000 },
      { name: 'Orvault', lat: 47.2711, lng: -1.6223, population: 27000 },
      { name: 'Vertou', lat: 47.1690, lng: -1.4700, population: 25000 },
      { name: 'Carquefou', lat: 47.2968, lng: -1.4927, population: 20000 },
      { name: 'Couëron', lat: 47.2149, lng: -1.7233, population: 21000 },
      { name: 'Bouguenais', lat: 47.1764, lng: -1.6271, population: 20000 },
    ],
  },

  // ── Strasbourg ──
  {
    id: 'strasbourg',
    city: 'Strasbourg',
    region: 'Grand Est',
    sourceType: 'nappe',
    steps: [
      { name: 'Nappe phréatique du Rhin', type: 'captage', lat: 48.6100, lng: 7.7800, description: "Plus grande nappe d'Europe, captage à 30-50 m" },
      { name: 'Usine du Polygone', type: 'traitement', lat: 48.5800, lng: 7.7500, description: 'Traitement minimal (eau de très bonne qualité)' },
      { name: 'Strasbourg', type: 'commune', lat: 48.5734, lng: 7.7521, description: 'Distribution Eurométropole' },
    ],
    communes: [
      { name: 'Schiltigheim', lat: 48.6073, lng: 7.7472, population: 34000 },
      { name: 'Illkirch-Graffenstaden', lat: 48.5286, lng: 7.7153, population: 27000 },
      { name: 'Hoenheim', lat: 48.6213, lng: 7.7551, population: 11000 },
      { name: 'Lingolsheim', lat: 48.5569, lng: 7.6858, population: 18000 },
      { name: 'Bischheim', lat: 48.6161, lng: 7.7523, population: 18000 },
      { name: 'Ostwald', lat: 48.5419, lng: 7.7110, population: 13000 },
      { name: 'Eckbolsheim', lat: 48.5804, lng: 7.6900, population: 7000 },
      { name: 'Geispolsheim', lat: 48.5155, lng: 7.6446, population: 9000 },
    ],
  },

  // ── Nice ──
  {
    id: 'nice',
    city: 'Nice',
    region: "Provence-Alpes-Côte d'Azur",
    sourceType: 'nappe',
    steps: [
      { name: 'Sources du Var (Vésubie)', type: 'captage', lat: 43.8500, lng: 7.2500, description: 'Captage en nappe alluviale du Var' },
      { name: 'Usine de la Vésubie', type: 'traitement', lat: 43.7800, lng: 7.2300, description: 'Traitement et chloration' },
      { name: 'Réservoirs de Rimiez', type: 'reservoir', lat: 43.7300, lng: 7.2700, description: 'Stockage en altitude' },
      { name: 'Nice', type: 'commune', lat: 43.7102, lng: 7.2620, description: "Distribution Nice Côte d'Azur" },
    ],
    communes: [
      { name: 'Antibes', lat: 43.5808, lng: 7.1239, population: 74000 },
      { name: 'Cannes', lat: 43.5528, lng: 7.0174, population: 75000 },
      { name: 'Cagnes-sur-Mer', lat: 43.6645, lng: 7.1482, population: 52000 },
      { name: 'Saint-Laurent-du-Var', lat: 43.6672, lng: 7.1893, population: 30000 },
      { name: 'Vence', lat: 43.7230, lng: 7.1108, population: 19000 },
      { name: 'Villeneuve-Loubet', lat: 43.6586, lng: 7.1258, population: 15000 },
      { name: 'La Trinité', lat: 43.7408, lng: 7.3139, population: 10000 },
      { name: 'Grasse', lat: 43.6585, lng: 6.9231, population: 51000 },
    ],
  },

  // ── Rennes ──
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
    communes: [
      { name: 'Cesson-Sévigné', lat: 48.1211, lng: -1.6047, population: 18000 },
      { name: 'Bruz', lat: 48.0246, lng: -1.7445, population: 18000 },
      { name: 'Saint-Jacques-de-la-Lande', lat: 48.0768, lng: -1.7222, population: 13000 },
      { name: 'Chantepie', lat: 48.0882, lng: -1.6187, population: 11000 },
      { name: 'Betton', lat: 48.1830, lng: -1.6390, population: 12000 },
      { name: 'Pacé', lat: 48.1466, lng: -1.7714, population: 12000 },
    ],
  },

  // ── Montpellier ──
  {
    id: 'montpellier',
    city: 'Montpellier',
    region: 'Occitanie',
    sourceType: 'nappe',
    steps: [
      { name: 'Source du Lez', type: 'captage', lat: 43.7300, lng: 3.8600, description: 'Résurgence karstique, débit 2 m³/s' },
      { name: "Usine d'Arago", type: 'traitement', lat: 43.6300, lng: 3.8700, description: 'Station de potabilisation' },
      { name: 'Montpellier', type: 'commune', lat: 43.6108, lng: 3.8767, description: 'Distribution Montpellier Méditerranée' },
    ],
    communes: [
      { name: 'Castelnau-le-Lez', lat: 43.6348, lng: 3.8977, population: 22000 },
      { name: 'Lattes', lat: 43.5672, lng: 3.9019, population: 18000 },
      { name: 'Mauguio', lat: 43.6169, lng: 4.0111, population: 17000 },
      { name: 'Juvignac', lat: 43.6137, lng: 3.8105, population: 12000 },
      { name: 'Saint-Jean-de-Védas', lat: 43.5766, lng: 3.8282, population: 10000 },
      { name: 'Pérols', lat: 43.5649, lng: 3.9490, population: 9000 },
      { name: 'Grabels', lat: 43.6475, lng: 3.8013, population: 8000 },
    ],
  },

  // ── Grenoble ──
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
    communes: [
      { name: 'Saint-Martin-d\'Hères', lat: 45.1672, lng: 5.7652, population: 38000 },
      { name: 'Échirolles', lat: 45.1485, lng: 5.7204, population: 37000 },
      { name: 'Fontaine', lat: 45.1936, lng: 5.6839, population: 23000 },
      { name: 'Meylan', lat: 45.2087, lng: 5.7817, population: 19000 },
      { name: 'Seyssinet-Pariset', lat: 45.1741, lng: 5.6808, population: 13000 },
      { name: 'Sassenage', lat: 45.2115, lng: 5.6643, population: 12000 },
      { name: 'Pont-de-Claix', lat: 45.1271, lng: 5.7001, population: 12000 },
      { name: 'Gières', lat: 45.1830, lng: 5.7874, population: 7000 },
    ],
  },

  // ── Dijon ──
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
    communes: [
      { name: 'Chenôve', lat: 47.2911, lng: 5.0018, population: 15000 },
      { name: 'Talant', lat: 47.3389, lng: 5.0004, population: 12000 },
      { name: 'Quetigny', lat: 47.3132, lng: 5.1024, population: 10000 },
      { name: 'Fontaine-lès-Dijon', lat: 47.3469, lng: 5.0186, population: 9000 },
      { name: 'Longvic', lat: 47.2887, lng: 5.0625, population: 9000 },
      { name: 'Saint-Apollinaire', lat: 47.3367, lng: 5.0900, population: 7000 },
    ],
  },

  // ── Clermont-Ferrand ──
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
    communes: [
      { name: 'Chamalières', lat: 45.7710, lng: 3.0630, population: 18000 },
      { name: 'Cournon-d\'Auvergne', lat: 45.7418, lng: 3.1942, population: 20000 },
      { name: 'Beaumont', lat: 45.7504, lng: 3.0828, population: 11000 },
      { name: 'Aubière', lat: 45.7479, lng: 3.1117, population: 11000 },
      { name: 'Gerzat', lat: 45.8215, lng: 3.1437, population: 11000 },
      { name: 'Lempdes', lat: 45.7714, lng: 3.1935, population: 9000 },
    ],
  },

  // ══════════════════════════════════════════════
  //  NOUVELLES AGGLOMÉRATIONS
  // ══════════════════════════════════════════════

  // ── Rouen ──
  {
    id: 'rouen',
    city: 'Rouen',
    region: 'Normandie',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Seine (La Chapelle)', type: 'captage', lat: 49.3800, lng: 1.0200, description: "Prise d'eau en Seine en amont de Rouen" },
      { name: 'Usine de La Chapelle', type: 'traitement', lat: 49.3900, lng: 1.0350, description: 'Filtration sur sable et ozonation' },
      { name: 'Réservoir de Mont-Saint-Aignan', type: 'reservoir', lat: 49.4600, lng: 1.0800, description: 'Stockage haute-ville' },
      { name: 'Rouen', type: 'commune', lat: 49.4432, lng: 1.0993, description: 'Distribution Métropole Rouen Normandie' },
    ],
    communes: [
      { name: 'Sotteville-lès-Rouen', lat: 49.4094, lng: 1.0912, population: 30000 },
      { name: 'Le Petit-Quevilly', lat: 49.4283, lng: 1.0637, population: 22000 },
      { name: 'Mont-Saint-Aignan', lat: 49.4618, lng: 1.0840, population: 20000 },
      { name: 'Le Grand-Quevilly', lat: 49.4072, lng: 1.0411, population: 27000 },
      { name: 'Déville-lès-Rouen', lat: 49.4670, lng: 1.0450, population: 11000 },
      { name: 'Bois-Guillaume', lat: 49.4733, lng: 1.1176, population: 14000 },
    ],
  },

  // ── Caen ──
  {
    id: 'caen',
    city: 'Caen',
    region: 'Normandie',
    sourceType: 'riviere',
    steps: [
      { name: "Captage Orne (Louvigny)", type: 'captage', lat: 49.1600, lng: -0.4000, description: "Prise d'eau dans l'Orne" },
      { name: 'Usine de Louvigny', type: 'traitement', lat: 49.1650, lng: -0.3950, description: 'Station de production' },
      { name: 'Caen', type: 'commune', lat: 49.1829, lng: -0.3707, description: 'Distribution Caen la Mer' },
    ],
    communes: [
      { name: 'Hérouville-Saint-Clair', lat: 49.2049, lng: -0.3256, population: 23000 },
      { name: 'Mondeville', lat: 49.1724, lng: -0.3190, population: 10000 },
      { name: 'Ifs', lat: 49.1385, lng: -0.3540, population: 12000 },
      { name: 'Colombelles', lat: 49.2063, lng: -0.2907, population: 7000 },
      { name: 'Blainville-sur-Orne', lat: 49.2305, lng: -0.3026, population: 6000 },
    ],
  },

  // ── Le Havre ──
  {
    id: 'lehavre',
    city: 'Le Havre',
    region: 'Normandie',
    sourceType: 'nappe',
    steps: [
      { name: 'Nappe crayeuse du Pays de Caux', type: 'captage', lat: 49.5600, lng: 0.1600, description: 'Captage en nappe crayeuse' },
      { name: 'Usine d\'Yport', type: 'traitement', lat: 49.7400, lng: 0.3100, description: 'Traitement et distribution' },
      { name: 'Le Havre', type: 'commune', lat: 49.4944, lng: 0.1079, description: 'Distribution agglomération havraise' },
    ],
    communes: [
      { name: 'Montivilliers', lat: 49.5439, lng: 0.1903, population: 17000 },
      { name: 'Harfleur', lat: 49.5065, lng: 0.1952, population: 8000 },
      { name: 'Sainte-Adresse', lat: 49.5069, lng: 0.0781, population: 8000 },
      { name: 'Gonfreville-l\'Orcher', lat: 49.5085, lng: 0.2358, population: 9000 },
      { name: 'Fontaine-la-Mallet', lat: 49.5372, lng: 0.1302, population: 3000 },
    ],
  },

  // ── Tours ──
  {
    id: 'tours',
    city: 'Tours',
    region: 'Centre-Val de Loire',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Loire (La Riche)', type: 'captage', lat: 47.3850, lng: 0.6600, description: "Prise d'eau dans la Loire" },
      { name: 'Usine de La Riche', type: 'traitement', lat: 47.3900, lng: 0.6650, description: 'Filtration et chloration' },
      { name: 'Tours', type: 'commune', lat: 47.3941, lng: 0.6848, description: 'Distribution Tours Métropole' },
    ],
    communes: [
      { name: 'Joué-lès-Tours', lat: 47.3514, lng: 0.6619, population: 38000 },
      { name: 'Saint-Cyr-sur-Loire', lat: 47.4073, lng: 0.6577, population: 16000 },
      { name: 'Saint-Pierre-des-Corps', lat: 47.3920, lng: 0.7310, population: 16000 },
      { name: 'La Riche', lat: 47.3868, lng: 0.6502, population: 10000 },
      { name: 'Chambray-lès-Tours', lat: 47.3355, lng: 0.7047, population: 12000 },
      { name: 'Saint-Avertin', lat: 47.3648, lng: 0.7321, population: 15000 },
    ],
  },

  // ── Orléans ──
  {
    id: 'orleans',
    city: 'Orléans',
    region: 'Centre-Val de Loire',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Loire (Val)', type: 'captage', lat: 47.8700, lng: 1.8500, description: "Captage en nappe alluviale de la Loire" },
      { name: 'Usine de l\'Île Charlemagne', type: 'traitement', lat: 47.8600, lng: 1.8700, description: 'Traitement et potabilisation' },
      { name: 'Orléans', type: 'commune', lat: 47.9029, lng: 1.9090, description: 'Distribution Orléans Métropole' },
    ],
    communes: [
      { name: 'Olivet', lat: 47.8644, lng: 1.8982, population: 22000 },
      { name: 'Saint-Jean-de-Braye', lat: 47.9116, lng: 1.9656, population: 21000 },
      { name: 'Fleury-les-Aubrais', lat: 47.9320, lng: 1.9254, population: 22000 },
      { name: 'Saint-Jean-de-la-Ruelle', lat: 47.9146, lng: 1.8680, population: 18000 },
      { name: 'Saran', lat: 47.9543, lng: 1.8787, population: 16000 },
    ],
  },

  // ── Limoges ──
  {
    id: 'limoges',
    city: 'Limoges',
    region: 'Nouvelle-Aquitaine',
    sourceType: 'lac',
    steps: [
      { name: 'Barrage de Saint-Marc', type: 'captage', lat: 45.8900, lng: 1.1700, description: 'Retenue alimentant Limoges' },
      { name: 'Usine des Casseaux', type: 'traitement', lat: 45.8400, lng: 1.2400, description: 'Station de potabilisation' },
      { name: 'Limoges', type: 'commune', lat: 45.8336, lng: 1.2611, description: 'Distribution Limoges Métropole' },
    ],
    communes: [
      { name: 'Isle', lat: 45.8180, lng: 1.2100, population: 8000 },
      { name: 'Le Palais-sur-Vienne', lat: 45.8696, lng: 1.2816, population: 6000 },
      { name: 'Panazol', lat: 45.8399, lng: 1.3135, population: 11000 },
      { name: 'Couzeix', lat: 45.8693, lng: 1.2230, population: 10000 },
      { name: 'Feytiat', lat: 45.8098, lng: 1.3264, population: 7000 },
    ],
  },

  // ── Angers ──
  {
    id: 'angers',
    city: 'Angers',
    region: 'Pays de la Loire',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Maine / Loire', type: 'captage', lat: 47.4600, lng: -0.5700, description: "Captage dans la Maine" },
      { name: 'Usine de la Baumette', type: 'traitement', lat: 47.4550, lng: -0.5650, description: 'Traitement charbon actif' },
      { name: 'Angers', type: 'commune', lat: 47.4784, lng: -0.5632, description: 'Distribution Angers Loire Métropole' },
    ],
    communes: [
      { name: 'Avrillé', lat: 47.5052, lng: -0.5987, population: 14000 },
      { name: 'Trélazé', lat: 47.4484, lng: -0.4616, population: 14000 },
      { name: 'Beaucouzé', lat: 47.4856, lng: -0.6333, population: 5000 },
      { name: 'Les Ponts-de-Cé', lat: 47.4263, lng: -0.5253, population: 13000 },
      { name: 'Saint-Barthélemy-d\'Anjou', lat: 47.4671, lng: -0.4898, population: 9000 },
      { name: 'Écouflant', lat: 47.5160, lng: -0.5233, population: 4000 },
    ],
  },

  // ── Brest ──
  {
    id: 'brest',
    city: 'Brest',
    region: 'Bretagne',
    sourceType: 'lac',
    steps: [
      { name: 'Barrage du Drennec', type: 'captage', lat: 48.4400, lng: -3.9700, description: "Retenue d'eau de l'Élorn" },
      { name: 'Usine de Pont-ar-Bled', type: 'traitement', lat: 48.4100, lng: -4.3200, description: 'Station de potabilisation' },
      { name: 'Brest', type: 'commune', lat: 48.3904, lng: -4.4861, description: 'Distribution Brest Métropole' },
    ],
    communes: [
      { name: 'Guipavas', lat: 48.4340, lng: -4.3984, population: 14000 },
      { name: 'Plouzané', lat: 48.3791, lng: -4.6180, population: 13000 },
      { name: 'Gouesnou', lat: 48.4478, lng: -4.4670, population: 8000 },
      { name: 'Le Relecq-Kerhuon', lat: 48.4077, lng: -4.3975, population: 12000 },
      { name: 'Bohars', lat: 48.4305, lng: -4.5190, population: 4000 },
    ],
  },

  // ── Amiens ──
  {
    id: 'amiens',
    city: 'Amiens',
    region: 'Hauts-de-France',
    sourceType: 'nappe',
    steps: [
      { name: 'Nappe de la Craie (Somme)', type: 'captage', lat: 49.8600, lng: 2.2700, description: 'Captage en nappe crayeuse' },
      { name: 'Station de traitement', type: 'traitement', lat: 49.8750, lng: 2.2850, description: 'Traitement UV et chloration' },
      { name: 'Amiens', type: 'commune', lat: 49.8942, lng: 2.2957, description: 'Distribution Amiens Métropole' },
    ],
    communes: [
      { name: 'Longueau', lat: 49.8677, lng: 2.3622, population: 6000 },
      { name: 'Rivery', lat: 49.9073, lng: 2.3207, population: 3000 },
      { name: 'Camon', lat: 49.8858, lng: 2.3481, population: 6000 },
      { name: 'Salouël', lat: 49.8746, lng: 2.2536, population: 3000 },
      { name: 'Pont-de-Metz', lat: 49.8662, lng: 2.2430, population: 2000 },
    ],
  },

  // ── Metz ──
  {
    id: 'metz',
    city: 'Metz',
    region: 'Grand Est',
    sourceType: 'nappe',
    steps: [
      { name: 'Captage alluvial Moselle', type: 'captage', lat: 49.0900, lng: 6.1500, description: 'Nappe alluviale de la Moselle' },
      { name: 'Usine de Moulins-lès-Metz', type: 'traitement', lat: 49.1000, lng: 6.1200, description: 'Traitement et distribution' },
      { name: 'Metz', type: 'commune', lat: 49.1193, lng: 6.1757, description: 'Distribution Metz Métropole' },
    ],
    communes: [
      { name: 'Montigny-lès-Metz', lat: 49.0973, lng: 6.1558, population: 23000 },
      { name: 'Woippy', lat: 49.1527, lng: 6.1510, population: 14000 },
      { name: 'Moulins-lès-Metz', lat: 49.1014, lng: 6.1129, population: 5000 },
      { name: 'Le Ban-Saint-Martin', lat: 49.1277, lng: 6.1413, population: 5000 },
      { name: 'Longeville-lès-Metz', lat: 49.1113, lng: 6.1135, population: 4000 },
      { name: 'Ars-sur-Moselle', lat: 49.0758, lng: 6.0798, population: 5000 },
    ],
  },

  // ── Nancy ──
  {
    id: 'nancy',
    city: 'Nancy',
    region: 'Grand Est',
    sourceType: 'nappe',
    steps: [
      { name: 'Captage Moselle (Messein)', type: 'captage', lat: 48.6200, lng: 6.1100, description: 'Nappe alluviale de la Moselle' },
      { name: 'Usine de Messein', type: 'traitement', lat: 48.6250, lng: 6.1200, description: 'Filtration et chloration' },
      { name: 'Nancy', type: 'commune', lat: 48.6921, lng: 6.1844, description: 'Distribution Grand Nancy' },
    ],
    communes: [
      { name: 'Vandœuvre-lès-Nancy', lat: 48.6560, lng: 6.1713, population: 31000 },
      { name: 'Laxou', lat: 48.6850, lng: 6.1435, population: 15000 },
      { name: 'Maxéville', lat: 48.7116, lng: 6.1612, population: 10000 },
      { name: 'Villers-lès-Nancy', lat: 48.6724, lng: 6.1412, population: 15000 },
      { name: 'Tomblaine', lat: 48.6784, lng: 6.2122, population: 8000 },
      { name: 'Jarville-la-Malgrange', lat: 48.6681, lng: 6.2072, population: 10000 },
    ],
  },

  // ── Besançon ──
  {
    id: 'besancon',
    city: 'Besançon',
    region: 'Bourgogne-Franche-Comté',
    sourceType: 'nappe',
    steps: [
      { name: 'Sources d\'Arcier', type: 'captage', lat: 47.2400, lng: 6.1000, description: 'Résurgence karstique historique' },
      { name: 'Station de Chenecey', type: 'traitement', lat: 47.2300, lng: 6.0200, description: 'Traitement UV' },
      { name: 'Besançon', type: 'commune', lat: 47.2378, lng: 6.0241, description: 'Distribution Grand Besançon' },
    ],
    communes: [
      { name: 'Thise', lat: 47.2750, lng: 6.0617, population: 3500 },
      { name: 'Ecole-Valentin', lat: 47.2700, lng: 5.9750, population: 3000 },
      { name: 'Planoise', lat: 47.2200, lng: 5.9600, population: 20000 },
      { name: 'Saône', lat: 47.2476, lng: 5.9550, population: 3500 },
      { name: 'Miserey-Salines', lat: 47.2783, lng: 5.9422, population: 3000 },
    ],
  },

  // ── Perpignan ──
  {
    id: 'perpignan',
    city: 'Perpignan',
    region: 'Occitanie',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Têt (Vinça)', type: 'captage', lat: 42.6400, lng: 2.5300, description: "Prise d'eau dans la Têt" },
      { name: 'Station de traitement', type: 'traitement', lat: 42.6700, lng: 2.8200, description: 'Filtration et ozonation' },
      { name: 'Perpignan', type: 'commune', lat: 42.6887, lng: 2.8948, description: 'Distribution Perpignan Méditerranée' },
    ],
    communes: [
      { name: 'Canet-en-Roussillon', lat: 42.7072, lng: 3.0146, population: 14000 },
      { name: 'Saint-Estève', lat: 42.7145, lng: 2.8459, population: 12000 },
      { name: 'Rivesaltes', lat: 42.7704, lng: 2.8728, population: 9000 },
      { name: 'Pia', lat: 42.7449, lng: 2.9192, population: 9000 },
      { name: 'Bompas', lat: 42.7271, lng: 2.9354, population: 8000 },
    ],
  },

  // ── Toulon ──
  {
    id: 'toulon',
    city: 'Toulon',
    region: "Provence-Alpes-Côte d'Azur",
    sourceType: 'canal',
    steps: [
      { name: 'Canal de Provence (Verdon)', type: 'captage', lat: 43.6300, lng: 6.1000, description: "Eau du Verdon via le Canal de Provence" },
      { name: 'Usine de Dardennes', type: 'traitement', lat: 43.1700, lng: 5.9300, description: 'Station de traitement principale' },
      { name: 'Toulon', type: 'commune', lat: 43.1242, lng: 5.9280, description: 'Distribution Toulon Provence Méditerranée' },
    ],
    communes: [
      { name: 'La Seyne-sur-Mer', lat: 43.1019, lng: 5.8787, population: 66000 },
      { name: 'Hyères', lat: 43.1204, lng: 6.1286, population: 57000 },
      { name: 'La Garde', lat: 43.1248, lng: 6.0107, population: 26000 },
      { name: 'Six-Fours-les-Plages', lat: 43.0934, lng: 5.8313, population: 36000 },
      { name: 'Ollioules', lat: 43.1340, lng: 5.8482, population: 14000 },
      { name: 'La Valette-du-Var', lat: 43.1378, lng: 5.9844, population: 24000 },
      { name: 'Le Pradet', lat: 43.1018, lng: 6.0218, population: 12000 },
      { name: 'Sanary-sur-Mer', lat: 43.1192, lng: 5.8013, population: 18000 },
    ],
  },

  // ── Aix-en-Provence ──
  {
    id: 'aix',
    city: 'Aix-en-Provence',
    region: "Provence-Alpes-Côte d'Azur",
    sourceType: 'canal',
    steps: [
      { name: 'Canal de Provence (Verdon)', type: 'captage', lat: 43.6300, lng: 6.1000, description: 'Eau du barrage de Sainte-Croix' },
      { name: 'Usine de Réaltor', type: 'traitement', lat: 43.4800, lng: 5.3600, description: 'Station de potabilisation' },
      { name: 'Aix-en-Provence', type: 'commune', lat: 43.5297, lng: 5.4474, description: 'Distribution Aix-Marseille-Provence' },
    ],
    communes: [
      { name: 'Gardanne', lat: 43.4544, lng: 5.4691, population: 21000 },
      { name: 'Vitrolles', lat: 43.4601, lng: 5.2489, population: 35000 },
      { name: 'Bouc-Bel-Air', lat: 43.4522, lng: 5.4129, population: 15000 },
      { name: 'Les Pennes-Mirabeau', lat: 43.4098, lng: 5.3087, population: 21000 },
      { name: 'Venelles', lat: 43.5965, lng: 5.4774, population: 9000 },
      { name: 'Pertuis', lat: 43.6939, lng: 5.5033, population: 20000 },
    ],
  },

  // ── Saint-Étienne ──
  {
    id: 'saint-etienne',
    city: 'Saint-Étienne',
    region: 'Auvergne-Rhône-Alpes',
    sourceType: 'lac',
    steps: [
      { name: 'Barrage du Pas de Riot', type: 'captage', lat: 45.3900, lng: 4.3200, description: 'Retenue sur le Furan' },
      { name: 'Usine de Solaure', type: 'traitement', lat: 45.4200, lng: 4.3700, description: 'Station de potabilisation' },
      { name: 'Saint-Étienne', type: 'commune', lat: 45.4397, lng: 4.3872, description: 'Distribution Saint-Étienne Métropole' },
    ],
    communes: [
      { name: 'Saint-Chamond', lat: 45.4728, lng: 4.5126, population: 35000 },
      { name: 'Firminy', lat: 45.3894, lng: 4.2864, population: 17000 },
      { name: 'Rive-de-Gier', lat: 45.5291, lng: 4.6164, population: 16000 },
      { name: 'Roche-la-Molière', lat: 45.4302, lng: 4.3225, population: 10000 },
      { name: 'Le Chambon-Feugerolles', lat: 45.3955, lng: 4.3244, population: 12000 },
      { name: 'Andrézieux-Bouthéon', lat: 45.5265, lng: 4.2581, population: 10000 },
    ],
  },

  // ── Annecy ──
  {
    id: 'annecy',
    city: 'Annecy',
    region: 'Auvergne-Rhône-Alpes',
    sourceType: 'lac',
    steps: [
      { name: 'Lac d\'Annecy', type: 'captage', lat: 45.8544, lng: 6.1600, description: 'Un des lacs les plus purs d\'Europe' },
      { name: 'Usine de pompage Semnoz', type: 'traitement', lat: 45.8900, lng: 6.1300, description: 'Traitement minimal, eau naturellement pure' },
      { name: 'Annecy', type: 'commune', lat: 45.8992, lng: 6.1294, description: 'Distribution Grand Annecy' },
    ],
    communes: [
      { name: 'Seynod', lat: 45.8749, lng: 6.0917, population: 20000 },
      { name: 'Cran-Gevrier', lat: 45.9016, lng: 6.1036, population: 18000 },
      { name: 'Meythet', lat: 45.9172, lng: 6.0912, population: 9000 },
      { name: 'Pringy', lat: 45.9371, lng: 6.1262, population: 4000 },
      { name: 'Argonay', lat: 45.9453, lng: 6.1365, population: 3000 },
      { name: 'Épagny Metz-Tessy', lat: 45.9399, lng: 6.0712, population: 6000 },
    ],
  },

  // ── Le Mans ──
  {
    id: 'lemans',
    city: 'Le Mans',
    region: 'Pays de la Loire',
    sourceType: 'riviere',
    steps: [
      { name: 'Captage Sarthe / Huisne', type: 'captage', lat: 48.0200, lng: 0.2100, description: 'Prise d\'eau dans la Sarthe et l\'Huisne' },
      { name: 'Usine de l\'Épau', type: 'traitement', lat: 47.9900, lng: 0.2300, description: 'Station de potabilisation' },
      { name: 'Le Mans', type: 'commune', lat: 48.0061, lng: 0.1996, description: 'Distribution Le Mans Métropole' },
    ],
    communes: [
      { name: 'Allonnes', lat: 47.9684, lng: 0.1600, population: 12000 },
      { name: 'Coulaines', lat: 48.0267, lng: 0.1815, population: 8000 },
      { name: 'La Chapelle-Saint-Aubin', lat: 48.0302, lng: 0.1479, population: 3000 },
      { name: 'Arnage', lat: 47.9399, lng: 0.1947, population: 6000 },
      { name: 'Mulsanne', lat: 47.9146, lng: 0.2286, population: 5000 },
    ],
  },

  // ── Reims ──
  {
    id: 'reims',
    city: 'Reims',
    region: 'Grand Est',
    sourceType: 'nappe',
    steps: [
      { name: 'Nappe de la Craie (Fléchambault)', type: 'captage', lat: 49.2300, lng: 3.7500, description: 'Captage en nappe crayeuse de Champagne' },
      { name: 'Usine de Fléchambault', type: 'traitement', lat: 49.2400, lng: 3.7700, description: 'Traitement UV et chloration' },
      { name: 'Reims', type: 'commune', lat: 49.2583, lng: 3.7510, description: 'Distribution Grand Reims' },
    ],
    communes: [
      { name: 'Tinqueux', lat: 49.2540, lng: 3.7872, population: 10000 },
      { name: 'Cormontreuil', lat: 49.2250, lng: 3.7850, population: 7000 },
      { name: 'Bétheny', lat: 49.2875, lng: 3.8115, population: 7000 },
      { name: 'Saint-Brice-Courcelles', lat: 49.2638, lng: 3.7122, population: 4000 },
      { name: 'Bezannes', lat: 49.2227, lng: 3.7441, population: 3000 },
    ],
  },

  // ── Mulhouse ──
  {
    id: 'mulhouse',
    city: 'Mulhouse',
    region: 'Grand Est',
    sourceType: 'nappe',
    steps: [
      { name: 'Nappe phréatique du Rhin (Hardtwald)', type: 'captage', lat: 47.7600, lng: 7.3800, description: 'Captage dans la nappe rhénane' },
      { name: 'Usine du Hardtwald', type: 'traitement', lat: 47.7650, lng: 7.3700, description: 'Traitement et distribution' },
      { name: 'Mulhouse', type: 'commune', lat: 47.7508, lng: 7.3359, description: 'Distribution Mulhouse Alsace Agglomération' },
    ],
    communes: [
      { name: 'Illzach', lat: 47.7793, lng: 7.3494, population: 15000 },
      { name: 'Wittenheim', lat: 47.8110, lng: 7.3354, population: 15000 },
      { name: 'Kingersheim', lat: 47.7939, lng: 7.3427, population: 13000 },
      { name: 'Rixheim', lat: 47.7496, lng: 7.3981, population: 14000 },
      { name: 'Pfastatt', lat: 47.7677, lng: 7.2982, population: 9000 },
      { name: 'Riedisheim', lat: 47.7407, lng: 7.3640, population: 12000 },
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
