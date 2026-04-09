## Plan : Déplacer l'icône de la section "Les risques" à gauche

### Changement

Dans `src/pages/Index.tsx` (lignes 281-309), inverser l'ordre des deux colonnes de la section "Les risques liés à l'eau du robinet" :

- L'icône (cercle orange avec AlertTriangle) passe **à gauche** (`order-1` sur desktop)
  &nbsp;

Concrètement, modifier les classes `order-*` :

- Bloc texte (ligne 282) : `order-2 md:order-1` → `order-2 md:order-2`
- Bloc icône (ligne 300) : `order-1 md:order-2` → `order-1 md:order-1`

### Fichier modifié

- `src/pages/Index.tsx` — 2 lignes (classes CSS uniquement)