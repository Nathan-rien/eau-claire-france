import type { AppLanguage } from '@/lib/i18nRoutes';

/**
 * English labels for the scoring engine (rankingV2 is authored in French).
 * Criterion labels + the finite set of reason / exclusion sentences.
 */
const CRITERION_EN: Record<string, string> = {
  nitrates: 'Nitrates',
  residu: 'Dry residue',
  calcium: 'Calcium',
  magnesium: 'Magnesium',
  sodium: 'Sodium',
  pH: 'pH',
  bicarbonates: 'Bicarbonates',
  sulfates: 'Sulphates',
  fluorure: 'Fluoride',
  potassium: 'Potassium',
  chlorures: 'Chlorides',
};

const REASONS_EN: Record<string, string> = {
  // Category exclusions
  'Eau gazeuse : non adaptée à ce profil (biberons, usage quotidien, pureté)':
    'Sparkling water: not suitable for this profile (infant bottles, everyday use, purity)',
  'Absence de la mention officielle « convient à l\u2019alimentation des nourrissons »':
    'Missing the official "suitable for infant feeding" statement',
  // Profile exclusions
  'Eau extrêmement minéralisée (usage thérapeutique, non quotidien)':
    'Extremely mineralised water (therapeutic use, not for everyday drinking)',
  'Sodium trop élevé pour un usage général quotidien': 'Sodium too high for general everyday use',
  'Nitrates élevés (au-dessus de la recommandation OMS quotidienne)':
    'High nitrates (above the WHO daily recommendation)',
  'Fluorure au-dessus de la limite réglementaire':
    'Fluoride above the limit set by the EU Drinking Water Directive',
  'Sulfates élevés (effet laxatif marqué)': 'High sulphates (marked laxative effect)',
  'Magnésium très élevé (effet laxatif marqué)': 'Very high magnesium (marked laxative effect)',
  'Trop minéralisée pour ce profil pureté': 'Too mineralised for this purity profile',
  'Nitrates trop élevés': 'Nitrates too high',
  'Sodium trop élevé pour une eau ultra-pure': 'Sodium too high for an ultra-low-mineral water',
  'Sulfates trop élevés pour une eau ultra-pure': 'Sulphates too high for an ultra-low-mineral water',
  'Eau trop minéralisée pour un usage quotidien': 'Too mineralised for everyday use',
  'Sodium trop élevé pour un usage quotidien': 'Sodium too high for everyday use',
  'Nitrates élevés pour une consommation quotidienne': 'Nitrates too high for daily consumption',
  'Nitrates > 10 mg/L : limite stricte pour nourrissons (Afssa)':
    'Nitrates above 10 mg/L: strict limit for infants (EU Drinking Water Directive, infant guidance)',
  'Fluorure > 0,3 mg/L : risque de fluorose dentaire chez le nourrisson':
    'Fluoride above 0.3 mg/L: risk of dental fluorosis in infants',
  'Sulfates trop élevés pour un nourrisson': 'Sulphates too high for an infant',
  'Sodium trop élevé pour la préparation des biberons': 'Sodium too high for preparing infant bottles',
  'Eau trop minéralisée pour un nourrisson': 'Too mineralised for an infant',
  'Nitrates > 25 mg/L : déconseillé en consommation régulière chez l\u2019enfant':
    'Nitrates above 25 mg/L: not advised for regular consumption by children',
  'Fluorure > 1 mg/L : risque de fluorose dentaire chez l\u2019enfant en croissance':
    'Fluoride above 1 mg/L: risk of dental fluorosis in growing children',
  'Sodium trop élevé pour la consommation quotidienne d\u2019un enfant':
    'Sodium too high for a child\u2019s daily consumption',
  'Eau trop minéralisée pour une consommation régulière chez l\u2019enfant':
    'Too mineralised for regular consumption by children',
  'Sulfates élevés (effet laxatif marqué chez l\u2019enfant)':
    'High sulphates (marked laxative effect in children)',
  'Magnésium très élevé (effet laxatif marqué chez l\u2019enfant)':
    'Very high magnesium (marked laxative effect in children)',
  'Nitrates élevés': 'High nitrates',
  'Sodium trop élevé pour un régime hyposodé': 'Sodium too high for a low-sodium diet',
  'Eau trop minéralisée — altère les arômes du thé':
    'Too mineralised — dulls the aromas of tea',
  'Bicarbonates élevés — altèrent les tanins': 'High bicarbonates — alter the tannins',
  'Calcium élevé — voile en surface': 'High calcium — surface film on the brew',
  'Nitrates trop élevés pour la grossesse': 'Nitrates too high during pregnancy',
  'Fluorure excessif': 'Excessive fluoride',
  'Fluorure élevé pour un senior': 'Fluoride too high for older adults',
  'Sodium élevé (HTA fréquente après 65 ans)':
    'High sodium (high blood pressure is common after 65)',
  // reasons() positives / negatives
  'Nitrates très bas': 'Very low nitrates',
  'Calcium élevé, excellent pour ce profil': 'High calcium, excellent for this profile',
  'Magnésium élevé, parfait pour la récupération': 'High magnesium, ideal for recovery',
  'Bicarbonates élevés, idéal pour la digestion': 'High bicarbonates, ideal for digestion',
  'Sulfates élevés, favorise le transit': 'High sulphates, supports transit',
  'Résidu sec très élevé → préférez profil Sport ou Transit':
    'Very high dry residue → prefer the Sport or Transit profile',
  'Sodium élevé → moins adapté à ce profil': 'High sodium → less suited to this profile',
  'Fluorure élevé → prudence pour ce profil': 'High fluoride → use with caution for this profile',
};

export const criterionLabel = (
  criterion: string,
  fallback: string,
  lang: AppLanguage,
): string => (lang === 'en' ? CRITERION_EN[criterion] ?? fallback : fallback);

/** Translate a reason sentence, preserving its ⚠️ / ✓ prefix. */
export const translateReason = (reason: string, lang: AppLanguage): string => {
  if (lang !== 'en') return reason;
  const match = reason.match(/^(⚠️\s*|✓\s*)?(.*)$/s);
  const prefix = match?.[1] ?? '';
  const body = (match?.[2] ?? reason).trim();
  return `${prefix}${REASONS_EN[body] ?? body}`;
};
