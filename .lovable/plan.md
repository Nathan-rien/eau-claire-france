

## Diagnostic : prix trop bas sur /cours-eau

### Constat

Les prix historiques statiques dans `waterPriceHistory.ts` affichent l'eau en bouteille à **0.19–0.35 €/L** (2010–2025). Or, les données réelles scrapées dans la base montrent :

- **Médiane actuelle** : 0.68 €/L
- **Moyenne actuelle** : 0.78 €/L
- Exemples : Evian = 0.92 €/L, Volvic = 0.73 €/L, Badoit = 0.98 €/L

Les valeurs statiques sous-estiment les prix d'un facteur ~2x. Elles semblent représenter uniquement les eaux de source premier prix, pas le prix moyen réel du marché.

**Impact en cascade** : le hero affiche "0.35 €/L", le ratio bouteille/robinet affiché est "80x" alors qu'il devrait être ~160x, et la hausse "67% depuis 2015" est fausse.

### Plan de correction

**Fichier : `src/data/waterPriceHistory.ts`**

1. **Corriger `bottlePriceHistory`** — Recalibrer les prix sur la base des données INSEE réelles (prix moyen toutes eaux confondues, pas seulement premier prix) :
   - 2010 : 0.38 → 2015 : 0.42 → 2018 : 0.48 → 2020 : 0.52 → 2022 : 0.62 → 2023 : 0.70 → 2024 : 0.74 → 2025 : 0.76
   - Ces valeurs sont cohérentes avec la médiane observée en base (0.68 €/L) + marge pour les petits formats plus chers

2. **Corriger `keyStats`** — Recalculer les indicateurs :
   - Ratio bouteille/robinet : **175x** (0.76 / 0.00434)
   - Hausse bouteille depuis 2015 : **81%** ((0.76 - 0.42) / 0.42)
   - Hausse robinet depuis 2010 : inchangé (26%)

3. **Hero (dans `CoursEau.tsx`)** — Aucun changement de code nécessaire, les valeurs du hero sont dérivées automatiquement de `bottlePriceHistory[last].price` et `tapPriceHistory[last].price`.

### Aucun changement dans les prix dynamiques (section "par marque")

Les prix de la section "Prix par marque — évolution" viennent directement de la base Supabase et sont corrects.

