/**
 * Source de vérité unique : marques disposant d'au moins un relevé de prix en base.
 *
 * Cette liste pilote À LA FOIS :
 *  - les entrées /marque/* du sitemap (scripts/generate-sitemap.ts)
 *  - l'indexabilité des pages /marque/:slug (noindex si le slug n'est pas listé)
 *  - le maillage interne "Parcourir par marque" (/prix-eaux, /classement)
 *
 * REGÉNÉRATION (instantané à rafraîchir périodiquement) :
 *   1. Exécuter en SQL :
 *        select distinct brand from public.prices
 *        where brand is not null and brand <> 'Inconnu' order by brand;
 *      (ou appeler l'edge function `debug-brands`)
 *   2. Slugifier chaque marque avec `brandToSlug()` de src/config/brands.ts
 *      (minuscules, sans accents, séparateurs -> "-") et dédupliquer.
 *   3. Remplacer le tableau ci-dessous.
 *
 * Dernier instantané : 2026-08-10 (21 marques).
 */
export const PRICED_BRAND_SLUGS: string[] = [
  'arvie',
  'badoit',
  'contrex',
  'courmayeur',
  'cristaline',
  'evian',
  'hepar',
  'mont-roucous',
  'perrier',
  'plancoet',
  'quezac',
  'rozana',
  'saint-amand',
  'saint-yorre',
  'salvetat',
  'san-pellegrino',
  'thonon',
  'vichy-celestins',
  'vittel',
  'volvic',
  'wattwiller',
];

/** Libellés d'affichage des marques (mêmes clés que PRICED_BRAND_SLUGS). */
export const PRICED_BRAND_LABELS: Record<string, string> = {
  arvie: 'Arvie',
  badoit: 'Badoit',
  contrex: 'Contrex',
  courmayeur: 'Courmayeur',
  cristaline: 'Cristaline',
  evian: 'Evian',
  hepar: 'Hépar',
  'mont-roucous': 'Mont Roucous',
  perrier: 'Perrier',
  plancoet: 'Plancoët',
  quezac: 'Quézac',
  rozana: 'Rozana',
  'saint-amand': 'Saint-Amand',
  'saint-yorre': 'Saint-Yorre',
  salvetat: 'La Salvetat',
  'san-pellegrino': 'San Pellegrino',
  thonon: 'Thonon',
  'vichy-celestins': 'Vichy Célestins',
  vittel: 'Vittel',
  volvic: 'Volvic',
  wattwiller: 'Wattwiller',
};

export const isPricedBrandSlug = (slug?: string): boolean =>
  !!slug && PRICED_BRAND_SLUGS.includes(slug);
