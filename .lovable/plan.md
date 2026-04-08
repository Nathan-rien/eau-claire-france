

## Plan : Fixer l'ancrage des marqueurs sur la carte

### Problème

Les marqueurs industriels (et potentiellement les marqueurs source/commune) dérivent visuellement quand on fait un pan/zoom sur la carte. Cela vient du fait que Mapbox ancre les marqueurs DOM par défaut en haut à gauche (`top-left`). Or les marqueurs sont des cercles centrés visuellement — il faut les ancrer au centre.

### Solution

Ajouter `anchor: 'center'` à toutes les créations de `mapboxgl.Marker` dans `WaterJourneyMap.tsx` :

1. **Marqueurs industriels** (ligne ~389) : `new mapboxgl.Marker({ element: el, anchor: 'center' })`
2. **Marqueurs source** (ligne ~270) : `new mapboxgl.Marker({ element: el, anchor: 'center' })`
3. **Marqueurs commune** (chercher les autres `new mapboxgl.Marker`) : même correction

### Fichier modifié
- `src/components/WaterJourneyMap.tsx` — ajouter `anchor: 'center'` aux 3 types de marqueurs

### Résultat
Les icônes restent parfaitement collées à leur position GPS lors du pan/zoom.

