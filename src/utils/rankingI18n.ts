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

/**
 * Health-profile recommendation texts (who / guidelines / avoid / source).
 * The EN wording cites the EU Drinking Water Directive (2020/2184) and EU
 * mineral-water labelling rules rather than French bodies alone.
 */
const PROFILE_TEXT_EN: Record<string, string> = {
  // who
  'Tous publics — adultes en bonne santé sans besoin spécifique':
    'Everyone — healthy adults with no specific need',
  'Recherche d\u2019une eau très peu minéralisée — soif quotidienne, biberons, traitements rénaux légers':
    'Looking for a very low-mineral water — everyday thirst, infant bottles, mild kidney conditions',
  'Adultes en bonne santé, consommation quotidienne': 'Healthy adults, everyday consumption',
  'Nourrissons (0–6 mois), préparation des biberons': 'Infants (0–6 months), preparing bottles',
  'Enfants de 1 à 12 ans en bonne santé': 'Healthy children aged 1 to 12',
  'Sportifs — récupération et compensation des pertes sudorales':
    'Athletes — recovery and replacing losses from sweating',
  'Hypertension artérielle, insuffisance cardiaque, régime hyposodé prescrit':
    'High blood pressure, heart failure, prescribed low-sodium diet',
  'Préparation du thé, café, infusions — préserver les arômes':
    'Brewing tea, coffee and infusions — preserving aromas',
  'Femmes enceintes ou allaitantes': 'Pregnant or breastfeeding women',
  'Constipation occasionnelle, paresse intestinale': 'Occasional constipation, sluggish transit',
  'Prévention ostéoporose, croissance osseuse, post-ménopause':
    'Osteoporosis prevention, bone growth, post-menopause',
  'Personnes âgées (65+) — hydratation, prévention chutes et dénutrition':
    'Older adults (65+) — hydration, preventing falls and undernutrition',
  'Digestion difficile, reflux, repas copieux': 'Difficult digestion, reflux, heavy meals',
  // sources
  'Classement neutre basé sur les seuils réglementaires français et l\u2019équilibre minéral global. Aucune recommandation médicale spécifique.':
    'Neutral ranking based on the thresholds of the EU Drinking Water Directive (2020/2184) and overall mineral balance. No specific medical advice.',
  'Recommandations Afssa pour eaux faiblement minéralisées (référence : Mont Roucous, Montcalm, Volvic).':
    'EU natural mineral water labelling rules for low-mineral waters (references: Mont Roucous, Montcalm, Volvic).',
  'Recommandations ANSES — eau de consommation courante.':
    'EU Drinking Water Directive (2020/2184) — water for everyday consumption.',
  'Avis Afssa du 7 octobre 2003 sur l\u2019eau d\u2019alimentation des nourrissons.':
    'EU guidance on water used for infant feeding, aligned with Directive 2020/2184 nitrate and fluoride limits.',
  'Recommandations Anses et Programme National Nutrition Santé (PNNS) pour l\u2019hydratation de l\u2019enfant.':
    'EU Drinking Water Directive limits and national nutrition programmes for children\u2019s hydration.',
  'Recommandations INSEP / Société Française de Nutrition du Sport (références : Saint-Yorre, Quézac, Rozana, Badoit).':
    'Sports nutrition guidance (references: Saint-Yorre, Quézac, Rozana, Badoit).',
  'Recommandations HAS pour l\u2019hypertension artérielle et OMS sur l\u2019apport sodé.':
    'Clinical guidance on high blood pressure and WHO recommendations on sodium intake.',
  'Référentiels des écoles de thé (Palais des Thés, Mariage Frères) — eaux conseillées : Volvic, Mont Roucous, Montcalm.':
    'Tea-school references (Palais des Thés, Mariage Frères) — recommended waters: Volvic, Mont Roucous, Montcalm.',
  'Recommandations ANSES et CNGOF (Collège National des Gynécologues et Obstétriciens Français).':
    'EU Drinking Water Directive limits and obstetric guidance for pregnancy.',
  'Références hydrologie médicale (eaux sulfatées magnésiennes : Hépar, Hunyadi Janos, Donat Mg).':
    'Medical hydrology references (magnesium-sulphate waters: Hépar, Hunyadi Janos, Donat Mg).',
  'Recommandations PNNS (Programme National Nutrition Santé) — références : Hépar, Contrex, Courmayeur, Talians, Salvetat.':
    'National nutrition programme guidance — references: Hépar, Contrex, Courmayeur, Talians, Salvetat.',
  'Recommandations PNNS Senior et Société Française de Gériatrie.':
    'Nutrition and geriatrics guidance for older adults.',
  'Hydrologie médicale — références : Vichy Célestins, Saint-Yorre, Badoit, Quézac, Rozana.':
    'Medical hydrology — references: Vichy Célestins, Saint-Yorre, Badoit, Quézac, Rozana.',
  // guidelines
  'Respecte les limites réglementaires françaises (décret 2007-49)':
    'Meets the limits of the EU Drinking Water Directive (2020/2184)',
  'pH proche neutre (6,5–7,8)': 'Near-neutral pH (6.5–7.8)',
  'Minéralisation modérée : résidu sec entre 150 et 800 mg/L':
    'Moderate mineralisation: dry residue between 150 and 800 mg/L',
  'Nitrates < 10 mg/L recommandés en quotidien': 'Nitrates < 10 mg/L recommended for daily use',
  'Fluorure < 1,5 mg/L (limite réglementaire)': 'Fluoride < 1.5 mg/L (regulatory limit)',
  'Résidu sec < 100 mg/L (eau très faiblement minéralisée)':
    'Dry residue < 100 mg/L (very low-mineral water)',
  'Nitrates < 10 mg/L': 'Nitrates < 10 mg/L',
  'Sodium < 20 mg/L': 'Sodium < 20 mg/L',
  'Fluorure < 0,5 mg/L': 'Fluoride < 0.5 mg/L',
  'Résidu sec entre 150 et 500 mg/L (minéralisation moyenne)':
    'Dry residue between 150 and 500 mg/L (medium mineralisation)',
  'Sodium < 200 mg/L, fluorure < 1,5 mg/L': 'Sodium < 200 mg/L, fluoride < 1.5 mg/L',
  'Équilibre Ca/Mg favorable aux apports journaliers':
    'Ca/Mg balance favourable to daily intake',
  'Nitrates < 10 mg/L (limite stricte pour nourrissons)':
    'Nitrates < 10 mg/L (strict limit for infants)',
  'Fluorure < 0,3 mg/L': 'Fluoride < 0.3 mg/L',
  'Sulfates < 140 mg/L': 'Sulphates < 140 mg/L',
  'Résidu sec < 500 mg/L': 'Dry residue < 500 mg/L',
  'Mention « convient à l\u2019alimentation des nourrissons » obligatoire sur l\u2019étiquette':
    'The label must carry the "suitable for infant feeding" statement',
  'Nitrates < 25 mg/L (idéalement < 10 mg/L)': 'Nitrates < 25 mg/L (ideally < 10 mg/L)',
  'Fluorure 0,3–0,7 mg/L (prévention carie sans risque de fluorose)':
    'Fluoride 0.3–0.7 mg/L (cavity prevention without fluorosis risk)',
  'Sodium < 100 mg/L': 'Sodium < 100 mg/L',
  'Résidu sec modéré : 50–500 mg/L': 'Moderate dry residue: 50–500 mg/L',
  'Calcium 40–150 mg/L (croissance osseuse)': 'Calcium 40–150 mg/L (bone growth)',
  'Eaux bicarbonatées (HCO3 > 600 mg/L) pour neutraliser l\u2019acidité musculaire':
    'Bicarbonate waters (HCO3 > 600 mg/L) to buffer muscle acidity',
  'Magnésium > 50 mg/L pour prévenir les crampes': 'Magnesium > 50 mg/L to prevent cramps',
  'Calcium > 150 mg/L et sodium 20–150 mg/L pour compenser les pertes':
    'Calcium > 150 mg/L and sodium 20–150 mg/L to replace losses',
  'Résidu sec 500–1500 mg/L (eau minérale)': 'Dry residue 500–1500 mg/L (mineral water)',
  'Sodium < 20 mg/L (mention « convient à un régime pauvre en sodium »)':
    'Sodium < 20 mg/L ("suitable for a low-sodium diet" claim)',
  'Apport total quotidien de sel < 5 g/jour (OMS)': 'Total daily salt intake < 5 g/day (WHO)',
  'Privilégier les eaux faiblement minéralisées': 'Prefer low-mineral waters',
  'Résidu sec < 150 mg/L (eau peu minéralisée)': 'Dry residue < 150 mg/L (low-mineral water)',
  'pH neutre (6,8–7,5)': 'Neutral pH (6.8–7.5)',
  'Bicarbonates < 200 mg/L pour éviter l\u2019altération des tanins':
    'Bicarbonates < 200 mg/L to avoid altering the tannins',
  'Calcium < 80 mg/L pour limiter le voile en surface':
    'Calcium < 80 mg/L to limit the surface film',
  'Calcium > 150 mg/L (besoins majorés à 1000 mg/jour)':
    'Calcium > 150 mg/L (needs rise to 1000 mg/day)',
  'Magnésium > 50 mg/L (prévention crampes et HTA gravidique)':
    'Magnesium > 50 mg/L (prevents cramps and pregnancy hypertension)',
  'Nitrates < 25 mg/L': 'Nitrates < 25 mg/L',
  'Fluorure < 1 mg/L': 'Fluoride < 1 mg/L',
  'Sodium < 100 mg/L (prévention rétention hydrique)':
    'Sodium < 100 mg/L (limits water retention)',
  'Sulfates > 200 mg/L (effet laxatif osmotique)':
    'Sulphates > 200 mg/L (osmotic laxative effect)',
  'Magnésium > 50 mg/L (action sur le péristaltisme)':
    'Magnesium > 50 mg/L (supports peristalsis)',
  'Cure courte : 1 à 1,5 L/jour sur quelques jours':
    'Short course: 1 to 1.5 L/day over a few days',
  'Calcium > 300 mg/L (contribue significativement aux 1000–1200 mg/jour requis)':
    'Calcium > 300 mg/L (contributes significantly to the 1000–1200 mg/day needed)',
  'Bicarbonates > 250 mg/L (favorise la biodisponibilité du calcium)':
    'Bicarbonates > 250 mg/L (improves calcium bioavailability)',
  'Mention « convient à un régime riche en calcium » dès 150 mg/L':
    '"Suitable for a calcium-rich diet" claim from 150 mg/L',
  '1,5 L/jour minimum (sensation de soif diminuée avec l\u2019âge)':
    '1.5 L/day minimum (thirst sensation declines with age)',
  'Calcium 100–250 mg/L (prévention ostéoporose)':
    'Calcium 100–250 mg/L (osteoporosis prevention)',
  'Magnésium 40–100 mg/L': 'Magnesium 40–100 mg/L',
  'Sodium < 80 mg/L (prévention HTA fréquente après 65 ans)':
    'Sodium < 80 mg/L (high blood pressure is common after 65)',
  'Bicarbonates > 600 mg/L (effet antiacide naturel)':
    'Bicarbonates > 600 mg/L (natural antacid effect)',
  'Consommation après repas, à température ambiante':
    'Drink after meals, at room temperature',
  'Préférer les eaux gazeuses bicarbonatées sodiques':
    'Prefer sodium-bicarbonate sparkling waters',
  // avoid
  'Eaux fortement minéralisées (Hépar, Contrex, Courmayeur)':
    'Highly mineralised waters (Hépar, Contrex, Courmayeur)',
  'Eaux gazeuses bicarbonatées': 'Bicarbonate sparkling waters',
  'Eaux gazeuses': 'Sparkling waters',
  'Eaux fortement minéralisées': 'Highly mineralised waters',
  'Eaux fluorées': 'Fluoridated waters',
  'Eaux très fluorées (> 1 mg/L)': 'Waters high in fluoride (> 1 mg/L)',
  'Eaux fortement minéralisées (Hépar, Contrex en quotidien)':
    'Highly mineralised waters (Hépar, Contrex for daily use)',
  'Eaux gazeuses en consommation régulière': 'Sparkling waters on a regular basis',
  'Eaux gazeuses sodiques (Vichy, Saint-Yorre, Badoit, Rozana)':
    'Sodium-rich sparkling waters (Vichy, Saint-Yorre, Badoit, Rozana)',
  'Eaux > 50 mg/L de sodium': 'Waters above 50 mg/L of sodium',
  'Usage prolongé sans avis médical (risque de déséquilibre)':
    'Prolonged use without medical advice (risk of imbalance)',
  'Utilisation quotidienne intensive en cas d\u2019HTA (sodium élevé)':
    'Heavy daily use in case of high blood pressure (high sodium)',
};

/** Translate a profile recommendation sentence (who / guideline / avoid / source). */
export const translateProfileText = (text: string, lang: AppLanguage): string =>
  lang === 'en' ? PROFILE_TEXT_EN[text.trim()] ?? text : text;
