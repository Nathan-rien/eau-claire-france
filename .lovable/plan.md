

## Optimiser le chargement de la carte parcours eau en bouteille

### Diagnostic

Le problème principal : avec 24 routes × ~10 communes = **~240 arcs**, le composant crée **~240 sources GeoJSON individuelles + ~480 couches Mapbox** (bg + anim). Chaque frame d'animation appelle `setPaintProperty` sur chacune des ~240 couches animées. C'est ce qui sature le GPU et le thread principal.

### Optimisations (fichier unique : `src/components/WaterJourneyMap.tsx`)

**1. Fusionner tous les arcs en 2 sources GeoJSON max**

Au lieu de créer une source + 2 layers par arc (~480 layers), regrouper tous les arcs dans une seule `FeatureCollection` :
- 1 source `journey-arcs` → 1 layer `journey-arcs-bg` + 1 layer `journey-arcs-anim`
- Résultat : **2 appels `setPaintProperty` par frame au lieu de ~240**

**2. Réduire les arcs communes à 15 points**

Passer `createArc` de 25 à 15 points pour les arcs source→commune (qualité visuelle identique à cette échelle).

**3. Démarrer avec `showCommunes = false`**

Afficher d'abord uniquement les sources (24 marqueurs), les communes ne s'affichent qu'au clic du toggle. Réduit le rendu initial de ~240 marqueurs DOM à ~15.

**4. Création différée des marqueurs communes**

Ne créer les éléments DOM des marqueurs communes qu'au premier toggle `showCommunes = true` (lazy init). Évite ~200 `document.createElement` + `addTo(map)` au chargement.

**5. Throttle animation à 150ms (~7fps)**

Passer de 100ms à 150ms entre frames — avec seulement 2 layers à animer, la fluidité reste identique visuellement mais réduit encore la charge.

### Résumé de l'impact

| Métrique | Avant | Après |
|----------|-------|-------|
| Sources Mapbox | ~240 | 2 |
| Layers Mapbox | ~480 | 4 |
| setPaintProperty/frame | ~240 | 2 |
| Marqueurs DOM au load | ~215 | ~15 |
| Points par arc commune | 25 | 15 |

### Fichier modifié

| Fichier | Changement |
|---------|-----------|
| `src/components/WaterJourneyMap.tsx` | FeatureCollection unique, lazy markers, showCommunes=false par défaut, throttle 150ms |

