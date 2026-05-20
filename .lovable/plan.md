## Problème identifié

Sur le profil **Pureté**, Hépar (résidu sec 2513 mg/L) apparaît avec un score de 50,9/80 et une note **C**, ce qui le fait passer pour une eau "correcte" alors qu'il dépasse massivement le seuil d'exclusion du profil (résidu > 500 mg/L).

Cause technique :
- L'exclusion est bien détectée (`excluded: true`), mais elle n'affecte **pas le score affiché** ni la **lettre de note**.
- Les eaux exclues sont simplement triées en bas de liste mais conservent un score "normal" et une lettre A–E trompeuse.
- Le filtre "Masquer les eaux non recommandées" est désactivé par défaut.
- Le calcul utilise une normalisation pondérée : un mauvais score sur 1 critère (résidu) est dilué par les bons scores des 10 autres critères, donc une eau exclue peut quand même obtenir 50+/80.

## Plan de correction

### 1. Pénaliser fortement les eaux exclues dans `scoreBottle` (rankingV2.ts)
- Si `excluded === true`, plafonner le `total` à un seuil bas (ex. **20/80 max**) — l'écart entre les exclusions et les non-exclues devient flagrant.
- Garder le `breakdown10` intact (utile pour le détail), mais le total reflète la non-recommandation.

### 2. Forcer la note à "X" (ou "—") pour les eaux exclues (`letterGrade`)
- Modifier la signature : `letterGrade(total80, excluded?)` → renvoie `"X"` si exclue.
- Couleur rouge dédiée (badge "Non recommandée") au lieu de C/D jaune/orange trompeur.
- Mettre à jour les 3 endroits qui consomment `letterGrade` : `RankingTableView`, `BottleRankingCard`, `BottleCompareModal`.

### 3. Activer `hideExcluded` par défaut
- `DEFAULT_FILTERS.hideExcluded: true` dans `RankingFilters.tsx`.
- L'utilisateur peut le désactiver explicitement s'il veut voir les eaux non recommandées.
- L'étiquette du switch reste claire ("Afficher les eaux non recommandées").

### 4. Ajouter une 2e exclusion implicite au profil Pureté
- Actuellement : exclusions sur `residu > 500` et `nitrates > 15`.
- Ajouter : `sodium > 30` et `sulfates > 100` (cohérents avec les `zeroAt` des règles).
- Cela exclut aussi Contrex, Courmayeur, San Pellegrino du profil Pureté, conformément à la description ("Eau ultra-pure").

## Fichiers à modifier

- `src/utils/rankingV2.ts` — plafonner score si excluded, `letterGrade(total, excluded)`, ajouter exclusions purity
- `src/components/Ranking/RankingFilters.tsx` — `hideExcluded: true` par défaut
- `src/components/Ranking/RankingTableView.tsx` — passer `excluded` à `letterGrade`, style badge "X" rouge
- `src/components/Ranking/BottleRankingCard.tsx` — idem
- `src/components/Ranking/BottleCompareModal.tsx` — idem

## Hors-scope (inchangé)

- Pondérations, règles `lowBetter`/`windowed`, formatage des décimales, autres profils santé.
