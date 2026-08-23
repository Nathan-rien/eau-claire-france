/**
 * ============================================================================
 * TODO — TAG AFFILIÉ AMAZON À REMPLACER
 * ----------------------------------------------------------------------------
 * Remplacer la valeur ci-dessous par le vrai tag Amazon Partenaires dès qu'il
 * est généré. C'est le SEUL endroit à modifier dans tout le projet.
 * ============================================================================
 */
export const AMAZON_AFFILIATE_TAG = 'infoeau-PLACEHOLDER-21';

export type ProductTier = 'entry' | 'standard' | 'premium';
export type ProductCategory = 'filtration' | 'taste';

export interface AffiliateProduct {
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  tier: ProductTier;
  /** Fourchette de prix constatée, ex: "25-30€" */
  priceRange: string;
  /** Coût consommables/an si pertinent */
  annualCost?: string;
  /** ASIN Amazon si disponible, sinon lien générique de recherche */
  amazonAsin?: string;
  /** Ce que le produit traite réellement (efficacité documentée) */
  treats: string[];
  /** Limites honnêtes */
  doesNotTreat: string[];
  rating?: number;
  reviewCount?: number;
  /** Mise en garde éditoriale (absence de preuve, déminéralisation, etc.) */
  editorialWarning?: string;
  /** Phrase courte « idéal pour… » */
  bestFor: string;
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  // ---------------------------------------------------------------- FILTRATION
  {
    slug: 'carafe-generique',
    name: 'Carafe filtrante compatible (marque distributeur)',
    brand: 'Générique/MDD',
    category: 'filtration',
    tier: 'entry',
    priceRange: '10-15€',
    annualCost: '~35€/an (cartouches compatibles)',
    treats: ['Chlore', 'Goût'],
    doesNotTreat: ['Nitrates', 'Plomb', 'PFAS', 'Pesticides'],
    bestFor: 'Petit budget, amélioration du goût uniquement',
  },
  {
    slug: 'brita-marella',
    name: 'Carafe filtrante Marella',
    brand: 'Brita',
    category: 'filtration',
    tier: 'standard',
    priceRange: '24-27€',
    annualCost: '~50-60€/an',
    treats: ['Chlore', 'Calcaire', 'Une partie du plomb/cuivre'],
    doesNotTreat: ['Nitrates (faible efficacité)', 'PFAS (partiel)'],
    rating: 4.7,
    reviewCount: 10475,
    bestFor: 'Le plus répandu, compromis goût/calcaire',
  },
  {
    slug: 'aquaphor-provence',
    name: 'Carafe Provence 4,2L',
    brand: 'Aquaphor',
    category: 'filtration',
    tier: 'standard',
    priceRange: '22-32€',
    annualCost: '~30€/an (meilleure longévité cartouche)',
    treats: ['Chlore', 'Calcaire', 'Métaux lourds', 'Enrichissement magnésium'],
    doesNotTreat: ['Nitrates', 'PFAS'],
    bestFor: 'Familles nombreuses, coût annuel le plus bas des carafes',
  },
  {
    slug: 'hydropure-serenity-inox',
    name: 'Filtre robinet Serenity Inox',
    brand: 'Hydropure',
    category: 'filtration',
    tier: 'standard',
    priceRange: '~35€',
    annualCost: 'Recharge tous les 6 mois',
    treats: [
      'Chlore',
      'Plomb',
      'Cuivre',
      'Pesticides',
      'PFAS/PFOA',
      'Bactéries',
      'Résidus médicamenteux',
    ],
    doesNotTreat: ['Nitrates', 'Calcaire'],
    bestFor:
      '1re place du test 60 Millions de Consommateurs (août 2025) — rapport efficacité/prix sur les contaminants sérieux',
  },
  {
    slug: 'tapp-water-ecopro',
    name: 'Filtre robinet EcoPro',
    brand: 'TAPP Water',
    category: 'filtration',
    tier: 'premium',
    priceRange: '38-65€',
    treats: ['PFAS (~95%)', 'Chlore', '100+ contaminants', 'Conserve les minéraux'],
    doesNotTreat: ['Nitrates en profondeur (vs osmoseur)'],
    bestFor: 'Seul filtre robinet disposant de la certification ACS française',
  },
  {
    slug: 'osmoseur-waterdrop',
    name: 'Système osmose inverse sous évier',
    brand: 'Waterdrop / Ecosoft',
    category: 'filtration',
    tier: 'premium',
    priceRange: '150-400€',
    annualCost: '~40-80€/an entretien',
    treats: ['Nitrates', 'Plomb', 'Métaux lourds', 'PFAS', 'Pesticides', 'Microplastiques'],
    doesNotTreat: [],
    editorialWarning:
      "Déminéralise l'eau — 60 Millions de Consommateurs déconseille une consommation exclusive sans reminéralisation.",
    bestFor: 'Seule solution efficace à domicile contre les nitrates et les PFAS',
  },
  // ---------------------------------------------------------------------- GOÛT
  {
    slug: 'perles-ceramique',
    name: 'Perles de céramique EM',
    brand: 'Diverses marques',
    category: 'taste',
    tier: 'entry',
    priceRange: '10-15€',
    treats: ['Goût (allégation)'],
    doesNotTreat: ['Nitrates', 'Plomb', 'PFAS', 'Aucun contaminant prouvé'],
    editorialWarning:
      "Aucune preuve scientifique d'efficacité (absent de tout référentiel normatif). Ne remplace aucune protection sanitaire.",
    bestFor: 'Usage anecdotique uniquement, à choisir en connaissance de cause',
  },
  {
    slug: 'charbon-binchotan',
    name: 'Bâton de charbon actif binchotan',
    brand: 'Diverses marques',
    category: 'taste',
    tier: 'entry',
    priceRange: '10-20€',
    annualCost: 'Durée ~6 mois',
    treats: ['Chlore (réduction 80-90%)', 'Goût'],
    doesNotTreat: ['Nitrates', 'Plomb', 'PFAS'],
    bestFor: 'Effet réel mais modeste sur le goût, démarche zéro-déchet',
  },
  {
    slug: 'gourde-filtrante-brita',
    name: 'Gourde filtrante',
    brand: 'Brita',
    category: 'taste',
    tier: 'standard',
    priceRange: '15-25€',
    treats: ['Chlore', 'Goût'],
    doesNotTreat: ['Nitrates', 'Plomb', 'PFAS'],
    bestFor: 'Usage nomade, même principe que les carafes',
  },
];

/** Lien Amazon : ASIN si connu, sinon recherche générique. Tag toujours ajouté. */
export function getAmazonSearchUrl(productName: string, brand: string): string {
  const query = encodeURIComponent(`${brand} ${productName}`);
  return `https://www.amazon.fr/s?k=${query}&tag=${AMAZON_AFFILIATE_TAG}`;
}

export function getAmazonUrl(product: AffiliateProduct): string {
  if (product.amazonAsin) {
    return `https://www.amazon.fr/dp/${product.amazonAsin}?tag=${AMAZON_AFFILIATE_TAG}`;
  }
  return getAmazonSearchUrl(product.name, product.brand);
}

/**
 * Mots-clés (normalisés) traités par produit, utilisés pour la pertinence
 * contextuelle sur les pages problème et dans le diagnostic.
 */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function productTreatsProblem(product: AffiliateProduct, problem: string): boolean {
  const p = normalize(problem);
  if (!p) return true;
  return product.treats.some((t) => normalize(t).includes(p) || p.includes(normalize(t)));
}

/** Le produit indique explicitement ne pas traiter (ou mal traiter) ce problème. */
export function productExcludesProblem(product: AffiliateProduct, problem: string): boolean {
  const p = normalize(problem);
  if (!p) return false;
  return product.doesNotTreat.some((t) => normalize(t).includes(p));
}

const TIER_ORDER: ProductTier[] = ['entry', 'standard', 'premium'];

/**
 * Sélectionne un produit par palier (entrée / standard / premium) pour une
 * catégorie donnée. Si un contexte problème est fourni, les produits qui
 * traitent réellement ce problème sont prioritaires dans chaque palier ;
 * ceux qui indiquent ne pas le traiter passent en dernier.
 */
export function getProductPicks(
  category: ProductCategory,
  problemContext?: string,
): AffiliateProduct[] {
  const pool = AFFILIATE_PRODUCTS.filter((p) => p.category === category);
  const score = (p: AffiliateProduct) => {
    if (!problemContext) return 0;
    if (productTreatsProblem(p, problemContext)) return 0;
    if (productExcludesProblem(p, problemContext)) return 2;
    return 1;
  };

  return TIER_ORDER.map((tier) => {
    const inTier = pool
      .filter((p) => p.tier === tier)
      // À score de pertinence égal, on privilégie la couverture la plus large.
      .sort((a, b) => score(a) - score(b) || b.treats.length - a.treats.length);
    return inTier[0];
  }).filter((p): p is AffiliateProduct => Boolean(p));
}


export function getProductsByCategory(category: ProductCategory): AffiliateProduct[] {
  return AFFILIATE_PRODUCTS.filter((p) => p.category === category);
}

/** Prix minimal (en €) extrait de priceRange, pour le tri. */
export function parseMinPrice(priceRange: string): number {
  const match = priceRange.replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : Number.MAX_SAFE_INTEGER;
}
