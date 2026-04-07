// Données historiques prix de l'eau — Sources : INSEE, SISPEA, DGCCRF

export interface PriceDataPoint {
  year: number;
  price: number;
  event?: string;
}

export interface PriceEvent {
  year: number;
  title: string;
  description: string;
  impact: 'hausse' | 'baisse' | 'neutre';
}

// Prix moyen eau en bouteille (€/L) — Source : INSEE indices prix à la consommation
export const bottlePriceHistory: PriceDataPoint[] = [
  { year: 2010, price: 0.38 },
  { year: 2011, price: 0.39 },
  { year: 2012, price: 0.40 },
  { year: 2013, price: 0.40 },
  { year: 2014, price: 0.41 },
  { year: 2015, price: 0.42 },
  { year: 2016, price: 0.43 },
  { year: 2017, price: 0.44 },
  { year: 2018, price: 0.48, event: "Canicule été 2018" },
  { year: 2019, price: 0.49 },
  { year: 2020, price: 0.52, event: "COVID-19 : hausse de la demande" },
  { year: 2021, price: 0.55 },
  { year: 2022, price: 0.62, event: "Inflation + hausse PET & énergie" },
  { year: 2023, price: 0.70, event: "Pic d'inflation" },
  { year: 2024, price: 0.74 },
  { year: 2025, price: 0.76 },
];

// Prix moyen eau du robinet (€/m³) — Source : SISPEA / Observatoire des services d'eau
export const tapPriceHistory: PriceDataPoint[] = [
  { year: 2010, price: 3.45 },
  { year: 2011, price: 3.50 },
  { year: 2012, price: 3.55 },
  { year: 2013, price: 3.62 },
  { year: 2014, price: 3.65 },
  { year: 2015, price: 3.70 },
  { year: 2016, price: 3.74 },
  { year: 2017, price: 3.78 },
  { year: 2018, price: 3.82 },
  { year: 2019, price: 3.85 },
  { year: 2020, price: 3.89, event: "Investissements réseau post-COVID" },
  { year: 2021, price: 3.98 },
  { year: 2022, price: 4.08, event: "Hausse énergie + traitement" },
  { year: 2023, price: 4.19, event: "Normes PFAS renforcées" },
  { year: 2024, price: 4.27 },
  { year: 2025, price: 4.34 },
];

// Facteurs explicatifs — eau en bouteille
export const bottlePriceFactors = [
  {
    icon: 'flask' as const,
    title: "Matières premières (PET)",
    description: "Le prix du PET (polyéthylène téréphtalate) suit celui du pétrole. Entre 2021 et 2023, le coût du PET a augmenté de +40%, impactant directement le prix des bouteilles.",
    trend: "+40% entre 2021-2023",
  },
  {
    icon: 'truck' as const,
    title: "Transport & logistique",
    description: "L'eau en bouteille est lourde à transporter. La hausse du prix du carburant et les nouvelles réglementations environnementales sur le transport routier augmentent les coûts.",
    trend: "+25% depuis 2020",
  },
  {
    icon: 'zap' as const,
    title: "Énergie & production",
    description: "Les usines d'embouteillage consomment beaucoup d'énergie. La crise énergétique de 2022 a provoqué une hausse significative des coûts de production.",
    trend: "+60% en 2022",
  },
  {
    icon: 'scale' as const,
    title: "Réglementation & taxes",
    description: "L'éco-contribution, la taxe GEMAPI et les nouvelles obligations de recyclage (loi AGEC) augmentent progressivement le coût final pour le consommateur.",
    trend: "+5-8% par an",
  },
];

// Facteurs explicatifs — eau du robinet
export const tapPriceFactors = [
  {
    icon: 'wrench' as const,
    title: "Investissements réseau",
    description: "Le réseau français vieillit : 20% des canalisations ont plus de 50 ans. Les communes investissent massivement dans le renouvellement, ce qui se répercute sur le prix.",
    trend: "1 milliard €/an",
  },
  {
    icon: 'shield' as const,
    title: "Normes de qualité",
    description: "Les nouvelles normes européennes (directive 2020/2184) imposent le suivi de micropolluants comme les PFAS, nécessitant de nouveaux équipements de traitement coûteux.",
    trend: "Directive 2020/2184",
  },
  {
    icon: 'droplets' as const,
    title: "Redevances agences de l'eau",
    description: "Les redevances prélevées par les agences de l'eau financent la protection des ressources. Elles représentent environ 20% de la facture d'eau.",
    trend: "~20% de la facture",
  },
  {
    icon: 'thermometer' as const,
    title: "Changement climatique",
    description: "Les sécheresses répétées obligent à chercher de nouvelles sources d'approvisionnement et à renforcer les interconnexions entre réseaux, augmentant les coûts.",
    trend: "Impact croissant",
  },
];

// Statistiques clés
export const keyStats = [
  { label: "Ratio bouteille/robinet", value: 175, suffix: "x", description: "L'eau en bouteille coûte ~175 fois plus cher que l'eau du robinet" },
  { label: "Hausse bouteille depuis 2015", value: 81, suffix: "%", description: "Augmentation du prix moyen de l'eau en bouteille" },
  { label: "Hausse robinet depuis 2010", value: 26, suffix: "%", description: "Augmentation du prix moyen de l'eau du robinet" },
  { label: "Consommation FR", value: 130, suffix: " L/hab", description: "Litres d'eau en bouteille par habitant par an en France" },
];

// Événements marquants timeline
export const priceEvents: PriceEvent[] = [
  { year: 2018, title: "Canicule 2018", description: "Forte demande estivale, ruptures de stock ponctuelles", impact: 'hausse' },
  { year: 2020, title: "Pandémie COVID-19", description: "Stockage massif par les ménages, perturbations logistiques", impact: 'hausse' },
  { year: 2021, title: "Reprise post-COVID", description: "Tensions sur les chaînes d'approvisionnement mondiales", impact: 'hausse' },
  { year: 2022, title: "Crise énergétique", description: "Flambée des prix de l'énergie, du PET et du transport", impact: 'hausse' },
  { year: 2023, title: "Pic d'inflation", description: "Inflation alimentaire record à +15%, eau en bouteille incluse", impact: 'hausse' },
  { year: 2024, title: "Stabilisation", description: "Ralentissement de l'inflation, prix qui se stabilisent", impact: 'neutre' },
];
