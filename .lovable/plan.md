

## Ajouter des animations visuelles (SVG animées) pour chaque étape

Les images locales actuelles sont des placeholders binaires qui ne s'affichent probablement pas correctement. Plutôt que de dépendre d'images externes ou générées, on va créer des **illustrations SVG animées inline** pour chaque étape, remplaçant les images statiques. Chaque SVG sera thématique et animée au scroll.

### Animations par étape

1. **Captage** — SVG de gouttes de pluie tombant et s'infiltrant dans des couches géologiques (animation de gouttes + flèches descendantes). La coupe géologique existante reste, enrichie de gouttes animées.

2. **Pompage** — SVG d'une pompe avec un piston qui monte/descend cycliquement et de l'eau qui remonte dans un tuyau (animation CSS loop).

3. **Traitement** — SVG de bulles montant dans un bassin (particules colorées qui montent et changent de couleur du marron au bleu clair = eau qui se purifie).

4. **Stockage** — Le château d'eau SVG existant reste, ajout d'un indicateur de niveau qui oscille légèrement + ondes à la surface de l'eau.

5. **Distribution** — SVG de tuyaux avec des particules d'eau (petits cercles bleus) qui circulent le long d'un réseau ramifié, animation de translation en boucle.

6. **Robinet** — SVG d'un robinet avec un jet d'eau qui coule, gouttes qui tombent et rebondissent dans un verre qui se remplit progressivement.

### Approche technique

- Créer un composant `StageAnimation` pour chaque étape, chacun étant un SVG inline avec des animations CSS (`@keyframes` dans le SVG via `<style>` ou classes Tailwind).
- Remplacer les `<img>` cassées par ces composants SVG animés.
- Conserver les SVG existants (GeologicalSVG, WaterTowerSVG) et les enrichir.
- Ajouter les keyframes nécessaires dans `src/index.css`.

### Fichiers modifiés

1. **`src/pages/ParcoursEauV2.tsx`** — Remplacer les 6 blocs `<img src={IMAGES.xxx}>` par des composants SVG animés inline. Supprimer les imports d'images locales inutilisés.

2. **`src/index.css`** — Ajouter les keyframes : `v2-rain-drop`, `v2-pump-piston`, `v2-bubble-rise`, `v2-water-wave`, `v2-flow-particle`, `v2-faucet-drip`, `v2-fill-glass`.

