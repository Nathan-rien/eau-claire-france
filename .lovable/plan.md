# Refonte de la carte de recommandations — direction Éditorial split

Réécriture de `src/components/Ranking/ProfileRecommendationCard.tsx` selon la direction choisie : carte blanche `rounded-2xl`, header sobre + body en split 2/5 – 3/5.

## Structure

**Header** (cliquable, toggle ouvert/fermé)
- Bloc icône `w-10 h-10 rounded-xl bg-blue-50` avec emoji du profil
- Titre `text-lg font-bold text-slate-900` + sous-titre `text-sm text-slate-500`
- Bouton "Masquer / Recommandations" `text-xs font-semibold` à droite

**Colonne gauche (2/5) — fond `slate-50/60`**
- Label uppercase tracking-[0.18em] `text-blue-600` : "Cible prioritaire"
- `rec.who` en `text-[15px] text-slate-800`
- Source en bas avec icône Info, italique `text-[11px] text-slate-500`

**Colonne droite (3/5)**
- Section "Seuils recommandés" (point bleu + label uppercase)
  - Parser chaque `guideline` : si format `Label <|>|≤|≥ valeur` → grille 2 colonnes (label petit + valeur en `font-semibold tabular-nums`)
  - Sinon → liste avec `CheckCircle2` vert pour les guidelines en texte libre (ex. « Mention "convient à…" obligatoire »)
- Section "Contre-indications" (si `avoid` présent, point ambre)
  - Cards `bg-amber-50/60 border-amber-100 rounded-xl` avec `AlertTriangle`
  - Parser `Titre (détail entre parenthèses)` → titre en gras + détail en sous-ligne

## Typo unifiée
Une seule police (héritée — Inter), tailles strictement limitées :
- `text-lg` (titre) / `text-[15px]` (cible) / `text-sm` (corps) / `text-xs` (CTA) / `text-[11px]` (source) / `text-[10px]` uppercase (labels de section)

Plus de `text-xl` emoji + mélange de tailles incohérent. Tracking et poids harmonisés.

## Responsive
- `flex-col` mobile → `md:flex-row` desktop
- Bordure droite remplacée par bordure basse sur mobile
- Padding `p-5 sm:p-6` partout

## Aucun changement
- Aucune modification de `rankingV2.ts` ni de `Classement.tsx`
- Mêmes données consommées (`who`, `guidelines`, `avoid`, `source`)

Passez en mode build pour que j'applique le changement.
