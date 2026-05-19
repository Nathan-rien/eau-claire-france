## Contexte
Les cartes et tableaux du classement arrondissent actuellement les valeurs minérales à l'entier (`Math.round`) ou affichent le nombre brut. Une valeur comme 2.4 apparaît donc comme « 2 ».

## Changements
1. **Ajouter `formatMineralValue`** dans `src/utils/rankingV2.ts` :
   - Affiche 1 décimale quand elle est significative (ex. 2.4)
   - Affiche l'entier seul quand il n'y a pas de décimale (ex. 2)
   - Renvoie « — » si valeur manquante
2. **Utiliser ce formateur** dans :
   - `BottleRankingCard.tsx` (ligne 125, remplace `Math.round(value)`)
   - `RankingTableView.tsx` (colonnes minéraux du tableau)
   - `BottleCompareModal.tsx` (ligne 103, remplace l'affichage brut)

## Résultat attendu
Toutes les valeurs mg/L (résidu sec, Ca, Mg, Na, nitrates, etc.) affichent leur décimale lorsqu'elle existe, sans ajouter de `.0` inutile sur les entiers.
