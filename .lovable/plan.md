

## Corriger les 3 problèmes identifiés

### 1. Overflow tableaux imbriqués — `ClassementEurope.tsx`

Lignes 180 et 225 : remplacer `overflow-hidden` par `overflow-x-auto` sur les deux `<div>` wrappant les `<Table>` dans les sections dépliables (polluants + composition). Cela permet le scroll horizontal sur mobile au lieu de clipper le contenu.

### 2. Route manquante — `App.tsx`

`ComparatifBouteilles` est déjà lazy-loadé (ligne ~26) mais aucune `<Route>` ne pointe vers lui. Ajouter `<Route path="/comparatif-bouteilles" element={<ComparatifBouteilles />} />` dans le bloc de routes, après la route `/diagnostic`.

### 3. Grille expansion 320px — `CompositionEurope.tsx`

Ligne 252 : la grille des cartes d'expansion utilise `grid-cols-1 sm:grid-cols-2`. C'est déjà en colonne unique sous `sm` (640px), donc 320px est couvert. Cependant le `td` parent a `px-4` qui réduit l'espace disponible. Réduire le padding à `px-2 py-2 sm:px-4 sm:py-3` et ajouter `min-w-0` sur le grid container pour éviter tout débordement sur très petits écrans.

### Fichiers modifiés

1. **`src/pages/ClassementEurope.tsx`** — `overflow-hidden` → `overflow-x-auto` (2 occurrences, lignes 180 et 225)
2. **`src/App.tsx`** — ajouter la route `/comparatif-bouteilles`
3. **`src/pages/CompositionEurope.tsx`** — padding responsive sur le `td` d'expansion + `min-w-0` sur le grid

