

## Plan : Corriger les clics sur sources superposées et agrandir la carte

### Problème 1 — Clic sur Cristaline affiche Ophélie
6 sources partagent les mêmes coordonnées (46.2276, 2.2137) : Cristaline, Grand Barbier, Fiée des Lois, Sainte-Sophie, Louise, Ophélie. Mapbox affiche la dernière feature rendue en haut de la pile. Au clic, seule Ophélie est captée.

### Problème 2 — Carte trop petite
La carte utilise `h-96` (384px). Insuffisant pour naviguer confortablement.

### Problème 3 — Données génériques
Plusieurs "Eau de source" ont "France, France" comme localisation et des coordonnées identiques au centre de la France — aucune valeur informative.

---

### Solution

#### 1. Gérer les sources superposées (`WaterSourcesMap.tsx`)

Au clic sur un point, au lieu de prendre `e.features[0]`, **interroger toutes les features au même pixel** via `map.queryRenderedFeatures(e.point, { layers: ['sources-circles'] })`. Si plusieurs sources sont trouvées :
- Afficher dans le panneau droit un **sélecteur** (liste des sources à cette position) permettant de naviguer entre elles
- Afficher la première source par défaut, avec des boutons/badges pour basculer vers les autres

État ajouté : `overlappingSources: SourceItem[]` — liste de toutes les sources au point cliqué.

#### 2. Agrandir la carte (`WaterSourcesMap.tsx`)

Remplacer `h-96` par `h-[600px]` pour la div du conteneur carte, offrant ~600px de hauteur.

#### 3. Enrichir les coordonnées des sources génériques (`water_sources_coordinates.csv`)

Mettre à jour les coordonnées des sources "Eau de source" qui pointent actuellement vers le centre de la France (46.2276, 2.2137) avec des positions plus précises :
- **Cristaline** → garder au centre (multi-sources, pas de lieu unique)
- **Grand Barbier** → Douvres (Ain) : 46.06, 5.37
- **Fiée des Lois** → Prahecq (Deux-Sèvres) : 46.28, -0.33
- **Sainte-Sophie** → La Chapelle-en-Vercors (Drôme) : 44.97, 5.41
- **Louise** → Andrézieux-Bouthéon (Loire) : 45.53, 4.26
- **Ophélie** → Saint-Cyr-en-Val (Loiret) : 47.83, 1.95

Cela résoudra la superposition et ajoutera de la valeur aux données affichées.

### Fichiers modifiés
- **`public/data/water_sources_coordinates.csv`** — coordonnées corrigées pour 5 sources
- **`src/components/WaterSourcesMap.tsx`** — hauteur carte + gestion multi-sources au clic

