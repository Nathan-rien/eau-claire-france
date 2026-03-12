

## Ajouter des animations supplémentaires par étape

### Approche
Enrichir `StageAnimations.tsx` avec de nouvelles animations SVG secondaires pour chaque étape, et les intégrer dans `ParcoursEauV2.tsx`. Ajouter aussi de nouveaux keyframes CSS dans `index.css`.

### Nouvelles animations par étape

**1. Captage** — `WaterCycleAnimation`: Mini-cycle de l'eau (évaporation → nuage → pluie → infiltration) avec des flèches animées en boucle.

**2. Pompage** — `EnergyMeterAnimation`: Compteur d'énergie avec aiguille oscillante et barres de consommation qui montent/descendent.

**3. Traitement** — `LabTestAnimation`: Éprouvettes avec liquides qui changent de couleur (brun → bleu), pipette animée qui goutte un réactif.

**4. Stockage** — `PressureGaugeAnimation`: Manomètre avec aiguille qui oscille entre 3 et 5 bars, indicateur de pression dynamique.

**5. Distribution** — `LeakDetectorAnimation`: Canalisation avec fuite visible (gouttes qui s'échappent), capteur qui clignote en rouge puis vert quand la fuite est détectée.

**6. Robinet** — `CostComparisonAnimation`: Deux barres animées côte à côte (robinet vs bouteille) qui se remplissent avec un ratio visuel ×100, avec icônes €.

### Nouveaux keyframes CSS (`index.css`)

- `v2-needle-swing`: oscillation d'aiguille de manomètre
- `v2-color-shift`: transition de couleur pour les éprouvettes
- `v2-leak-drip`: goutte qui tombe d'une fuite de canalisation
- `v2-blink-alert`: clignotement rouge/vert pour capteur

### Intégration dans `ParcoursEauV2.tsx`

Chaque nouvelle animation sera placée sous l'animation principale existante dans un second container avec un léger `delay` de fade-in, créant un effet de révélation progressive au scroll.

### Fichiers modifiés

1. **`src/components/parcours/StageAnimations.tsx`** — 6 nouveaux composants SVG animés
2. **`src/index.css`** — 4 nouveaux keyframes
3. **`src/pages/ParcoursEauV2.tsx`** — Import et placement des 6 nouvelles animations

