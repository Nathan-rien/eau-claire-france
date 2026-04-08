
Plan : supprimer les “0” orphelins dans le panneau `/sources-eau`

Diagnostic
- Le problème ne vient plus du parsing CSV mais du rendu JSX dans `src/components/WaterSourcesMap.tsx`.
- Des conditions comme `{selectedSource.Na_mg_L && (...)}` ou `{selectedSource.SO4_mg_L && (...)}` affichent un `0` brut quand la valeur vaut exactement `0`, car React rend le résultat numérique du `&&`.
- C’est cohérent avec votre capture : le `0` entre Magnésium et Nitrates correspond très probablement au sodium, et le second au sulfate.

Modifications
1. `src/components/WaterSourcesMap.tsx` — remplacer tous les tests “truthy” sur les valeurs numériques par des tests explicites :
   - de `value && (...)`
   - vers `value !== undefined && value !== null`
- Champs concernés dans la composition : `pH`, `residu_sec_180_mg_L`, `Ca_mg_L`, `Mg_mg_L`, `Na_mg_L`, `NO3_mg_L`, `HCO3_mg_L`, `SO4_mg_L`, `Cl_mg_L`, `K_mg_L`, `F_mg_L`, `SiO2_mg_L`.

2. Refactor léger de la section “Composition minérale”
- Construire une liste de lignes de composition puis la filtrer avec une règle unique.
- Cela évite d’avoir des conditions incohérentes entre les champs et garantit qu’une vraie valeur `0` s’affiche proprement sous forme :
  - `Sodium (Na) — 0 mg/L`
  - au lieu d’un `0` isolé.

3. Corriger aussi la condition d’ouverture de la section
- La section “Composition minérale” utilise aujourd’hui un mélange de tests truthy et de cas particuliers.
- Je la baserai sur “au moins une valeur numérique définie” pour que :
  - une composition réelle avec des zéros soit bien reconnue,
  - le message “Données de composition non disponibles” ne s’affiche que si aucune donnée n’existe.

Résultat attendu
- Plus aucun `0` orphelin entre deux lignes.
- Si un minéral vaut réellement `0`, il apparaîtra avec son libellé et son unité.
- Si le champ est absent, rien ne sera affiché.

Fichier touché
- `src/components/WaterSourcesMap.tsx`
