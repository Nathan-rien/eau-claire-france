

## Probleme identifie

Le bug vient de la propriete CSS `transition:transform 0.15s` sur les elements de marqueur (ligne 92). Mapbox utilise `transform: translate(...)` pour positionner les marqueurs sur la carte. Quand on ajoute une transition CSS sur `transform`, elle interfere avec le positionnement interne de Mapbox — les marqueurs "glissent" vers le coin haut-gauche (position 0,0) lors du hover.

## Solution

Remplacer l'effet hover `scale` via `transform` par un effet qui n'interfere pas avec Mapbox :

**`src/pages/CarteEurope.tsx`** (lignes 85-96) :

- Supprimer `transition:transform 0.15s` du style du marqueur
- Utiliser `box-shadow` pour l'effet hover au lieu de `transform: scale()`
- Le `mouseenter` agrandira le `box-shadow` et ajoutera un outline
- Le `mouseleave` restaurera le style normal

Cela preserve l'effet visuel de mise en valeur au survol sans toucher a `transform`, que Mapbox gere en interne.

