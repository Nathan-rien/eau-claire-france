

## Plan : Afficher le nom de la source au lieu du nom de marque sur la carte

### Problème
La propriété `displayName` utilisée pour les labels sur la carte est définie ainsi :
```
source.brands.length > 0 ? source.brands[0] : source.source_name
```
Cela affiche le nom de la première marque (ex: "Cristaline") au lieu du nom de la source (ex: "Laqueuille"). Le nom de source est plus pertinent car plusieurs marques peuvent partager la même source.

### Solution — `src/components/WaterSourcesMap.tsx`

Inverser la logique de `displayName` aux **deux endroits** (lignes ~149 et ~292) :

```ts
// Avant
displayName: source.brands.length > 0 ? source.brands[0] : source.source_name

// Après
displayName: source.source_name || (source.brands.length > 0 ? source.brands[0] : 'Source')
```

Cela affichera le nom de la source en priorité (ex: "Cachat", "Les Bouillens", "Laqueuille"), et ne tombera sur le nom de marque que si `source_name` est vide.

### Fichier modifié
- `src/components/WaterSourcesMap.tsx` — 2 occurrences de `displayName`

