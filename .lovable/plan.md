## Constat

Le problème visible vient très probablement d’un écart entre le code corrigé et l’état réellement chargé dans la preview : avec la logique actuelle dans `rankingV2.ts`, Hépar est bien exclue en profil Pureté, plafonnée à `20/80`, notée `X`, et triée en bas. En revanche, le tableau affiché dans la capture montre encore l’ancienne logique (`Hépar 50.9`, note `C`) et un tri incohérent avec les scores (`72.7` avant `75.8`).

## Plan de correction

1. **Centraliser le tri du classement**
   - Créer une logique unique de comparaison :
     - eaux exclues toujours en dernier ;
     - puis score décroissant ;
     - puis nom alphabétique en cas d’égalité.
   - L’utiliser à la fois dans les cartes et dans le tableau pour éviter deux comportements différents.

2. **Forcer le tableau à afficher l’ordre du classement par défaut**
   - Mettre le tableau en tri “rang” décroissant par score dès l’ouverture.
   - Corriger le libellé/rendu du rang pour qu’il corresponde à la position réelle après tri.
   - Éviter qu’un ancien tri ascendant place `72.7` avant `75.8`.

3. **Rendre les eaux exclues impossibles à remonter dans le classement**
   - Conserver le plafond de score à `20/80` pour les eaux exclues.
   - Conserver la note `X` pour les exclues.
   - Vérifier que `hideExcluded=true` est bien appliqué au chargement et lors de la réinitialisation des filtres.

4. **Renforcer la cohérence de la notation Pureté**
   - Vérifier les seuils Pureté sur les critères clés : résidu sec, nitrates, sodium, sulfates, fluorure.
   - Ajouter une justification visible/fiable côté détails si une eau est exclue : par exemple “Trop minéralisée pour ce profil pureté”.

5. **Validation**
   - Calculer localement le top Pureté attendu : Mont Roucous, Montcalm, Voss, etc.
   - Vérifier qu’Hépar n’apparaît plus dans le top quand “Masquer non-recommandées” est actif.
   - Vérifier que si les non-recommandées sont affichées, Hépar est en bas avec note `X` et score plafonné.