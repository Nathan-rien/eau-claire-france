

## Nouvelle page : Parcours de l'eau en bouteille

### Concept
Créer `/parcours-eau-bouteille` reprenant exactement la même architecture que `/parcours-eau` (hero, vue d'ensemble avec animation workflow, 6 sections scrollytelling avec animations SVG, progress bar sticky, CTA final) mais appliqué au cycle de vie de l'eau en bouteille.

### 6 étapes du parcours bouteille

1. **Captage à la source** (bleu) — Émergence naturelle, forages profonds, périmètres de protection
2. **Analyse & Autorisation** (violet) — Contrôles ARS, classification EMN/source, dossier d'autorisation
3. **Embouteillage** (cyan) — Mise en bouteille à la source, cadence industrielle, formats PET/verre
4. **Étiquetage & Conditionnement** (amber) — Composition minérale, packs, palettisation
5. **Transport & Logistique** (rose/rouge) — Camions, km parcourus, empreinte carbone
6. **Achat & Consommation** (vert) — Rayons GMS, prix au litre, recyclage/déchets

### Fichiers à créer/modifier

1. **`src/pages/ParcoursEauBouteille.tsx`** — Page complète (~1100 lignes), même structure que `ParcoursEau.tsx` :
   - Hero avec thème bouteille (gradient cyan/teal)
   - Section vue d'ensemble avec `BottleJourneyAnimation`
   - 6 sections avec animations, stats animées, encarts "Le saviez-vous"
   - CTA final vers `/comparatif-bouteilles`

2. **`src/components/parcours/BottleJourneyAnimation.tsx`** — SVG panoramique 6 étapes (source → analyse → usine → étiquette → camion → magasin) avec particules animées le long du chemin

3. **`src/components/parcours/BottleStageAnimations.tsx`** — 6 animations SVG primaires (une par étape) :
   - Source jaillissante avec roches
   - Microscope/éprouvettes d'analyse
   - Ligne d'embouteillage (convoyeur + bouteilles)
   - Étiquette avec composition minérale
   - Camion de transport avec trajet
   - Rayon de supermarché

4. **`src/components/parcours/BottleSecondaryAnimations.tsx`** — 6 animations SVG secondaires :
   - Coupe géologique source minérale
   - Tableau de bord qualité (paramètres contrôlés)
   - Cadencemètre bouteilles/minute
   - Balance empreinte carbone
   - Carte de France trajets
   - Comparatif prix/litre marques

5. **`src/App.tsx`** — Ajouter route `/parcours-eau-bouteille` avec lazy import

6. **`src/components/Header.tsx`** — Ajouter le lien dans la navigation (sous-menu ou à côté de "Parcours de l'eau")

### Données clés intégrées

- 158 sources d'eau minérale exploitées en France
- 9,3 milliards de litres vendus/an
- 150 000 tonnes de plastique/an
- Prix moyen : 0,20 à 1,50 €/L
- Transport moyen : 300 km source → magasin
- 7 grandes familles de minéralisation

### Architecture technique

Même patterns que `ParcoursEau.tsx` :
- `useAnimatedCounter` hook pour les stats
- `IntersectionObserver` pour déclencher les animations au scroll
- `getParallaxStyle` pour l'effet parallaxe
- Progress bar sticky avec navigation cliquable
- Transitions CSS `cn()` conditionnelles sur `visibleSections`
- Composants `AnimatedStat` et `AnimatedBar` réutilisés

