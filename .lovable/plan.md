

## Plan: Carte Mapbox interactive sur /carte-europe

### Ce qui sera fait

Ajouter une carte Mapbox interactive entre les stats et la grille de pays sur `/carte-europe`. La carte affichera les 27 pays EU sous forme de marqueurs circulaires colorés par score (A=vert, B=jaune, C=rouge), avec des popups détaillés au clic.

### Modifications

**`src/pages/CarteEurope.tsx`** — Ajouter un composant `EuropeInteractiveMap` intégré directement dans la page :

- Importer `mapboxgl` et `MapboxSecurityService` (même pattern que `InteractiveMap.tsx`)
- Centrer la carte sur l'Europe (`[10, 50]`, zoom 3.5)
- Pour chaque pays dans `data`, placer un marqueur circulaire aux coordonnées `EU_COUNTRY_COORDS` depuis `europeWaterApi.ts`
- Couleur du marqueur selon `qualityScore` : A → `#16a34a`, B → `#eab308`, C → `#dc2626`
- Taille du marqueur proportionnelle à `populationServedMillions`
- Au clic sur un marqueur : popup Mapbox avec nom du pays, score, conformité %, nitrates, violations pesticides/plomb/bactéries, population
- Clic sur un marqueur met aussi à jour le `selected` state pour synchroniser avec la grille en-dessous
- Entourer la carte d'un `MapLoader` pour le chargement lazy sur mobile (composant existant)

### Aucun nouveau fichier

Tout sera dans `CarteEurope.tsx` (composant interne `EuropeMapSection`). Les coordonnées et le service API existent déjà dans `europeWaterApi.ts`.

