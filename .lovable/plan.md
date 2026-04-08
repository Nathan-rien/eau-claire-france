

## Plan : Corriger la détection des eaux gazeuses dans les statistiques

### Problème
Le CSV des coordonnées (`water_sources_coordinates.csv`) classe toutes les eaux minérales comme "EMN" sans distinguer plates et gazeuses. Le catalogue (`infoeau_catalog_eaux_v3.csv`) contient les colonnes `variant` (plate/gazeuse) et `is_gaseous` (True/False), mais `buildSources()` ne charge pas ce fichier. Résultat : 0 gazeuses dans les stats alors qu'il y en a 31 dans le catalogue.

### Solution

**1. `src/utils/sourcesAdapter.ts` — Charger le catalogue et construire un index de gazéité**

- Ajouter un 3e `fetch` pour `/data/infoeau_catalog_eaux_v3.csv`
- Construire un index `Map<string, boolean>` basé sur la marque (normalisée) → `is_gaseous === "True"` ou `variant === "gazeuse"`
- Dans la boucle de construction des items, après avoir déterminé `rawCategory`, consulter cet index : si la marque est gazeuse et la catégorie est "EMN", passer la catégorie à "Eau minérale naturelle gazeuse"

**2. `src/utils/sourcesAdapter.ts` — Modifier `mapCategory` ou le point d'appel**

- Ajouter un second paramètre optionnel `isGaseous?: boolean` à la logique de catégorisation
- Si `isGaseous` est `true` et la catégorie brute est "EMN", retourner "Eau minérale naturelle gazeuse"

### Fichier touché
- `src/utils/sourcesAdapter.ts` uniquement

### Résultat attendu
Les stats afficheront le bon nombre d'eaux gazeuses (orange sur la carte) au lieu de "0 gazeuse".

