

## Optimiser et enrichir la carte parcours eau en bouteille

### 1. Optimisation des performances (`src/components/WaterJourneyMap.tsx`)

Aligner sur les mêmes patterns que `TapWaterJourneyMap` :

- **Réduire les points par arc** : 50 → 25 points dans `createArc`
- **Remplacer le RAF non-throttlé** par un RAF bridé à ~10fps (100ms) avec `lastFrameRef`
- **Ajouter un toggle communes** : state `showCommunes` + `Switch` UI pour masquer/afficher les marqueurs communes et leurs arcs
- **Séparer les refs marqueurs** : `markersRef` (sources) vs `communeMarkersRef` (communes) pour toggle instantané
- **Batch les dasharray updates** : calculer une seule valeur `da` et l'appliquer en boucle, skip si toggle off

### 2. Enrichissement massif des données (`src/data/waterDistributors.ts`)

Le fichier actuel ne contient que **11 routes** avec des communes tirées de `FRENCH_CITIES` (37 villes seulement). Plan d'enrichissement :

**Nouvelles sources MDD** (~15 ajouts) :

| Retailer | Source | Catégorie |
|----------|--------|-----------|
| Carrefour | Eau de source des Alpes | Eau de source |
| Monoprix | Eau de source Montclar | Eau de source |
| Franprix | Eau de source Montclar | Eau de source |
| Leclerc | Eco+ Eau minérale (Clairvic) | EMN |
| Lidl | Saskia source Wüllner | Eau de source |
| Lidl | Saskia source Jandun | Eau de source |
| Auchan | Auchan Eau minérale (Auvergne) | EMN |
| Système U | U Eau de source Ondine | Eau de source |
| Intermarché | Paquito Eau de source | Eau de source |
| Casino | Leader Price Eau de source | Eau de source |
| Cora | Cora Eau minérale | EMN |
| Aldi | Eau de source Marquise | Eau de source |
| Carrefour | Carrefour Eau minérale (Auvergne) | EMN |

**Enrichissement des communes desservies** :

Passer de la lookup `FRENCH_CITIES` (seulement 37 villes) à des listes de communes directement dans `waterDistributors.ts` avec coordonnées GPS, couvrant les intercommunalités réelles :

- Chaque source desservira **8-15 communes** au lieu de 3-4
- Ajout de villes moyennes absentes de `FRENCH_CITIES` (Pau, Bayonne, La Rochelle, Poitiers, Nîmes, Avignon, Valence, Dunkerque, etc.)
- Total estimé : passage de ~47 communes à **~250 communes**

**Nouvelles sources avec coordonnées** :

| Source | Lat | Lng |
|--------|-----|-----|
| Montclar | 44.08 | 6.35 |
| Wüllner | 51.38 | 7.62 |
| Jandun | 49.68 | 4.58 |
| Marquise | 50.81 | 1.71 |
| Ondine (Orbey) | 48.13 | 7.16 |
| Auvergne (St-Géron) | 45.22 | 3.33 |

### 3. Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `src/components/WaterJourneyMap.tsx` | RAF throttlé 10fps, createArc 25pts, toggle Switch communes, refs séparées |
| `src/data/waterDistributors.ts` | ~15 nouvelles routes MDD, communes directes avec coordonnées (~250 total), nouvelles sources GPS |

### Impact
- **Performance** : ~33% de réduction des appels setPaintProperty, toggle instantané
- **Données** : 11 → ~25 routes, ~47 → ~250 communes, couverture nationale complète

