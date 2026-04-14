

## Plan : Optimisation mobile des pages cartes

### Problemes identifies

1. **Map height fixe `h-[600px]`** — Trop haut sur mobile (depasse l'ecran), pas adaptatif
2. **Controles WaterJourneyMap** — `flex-wrap` insuffisant : le `Select` a une largeur fixe `w-[220px]`, les toggles "Etapes industrielles" et "Communes desservies" ne s'empilent pas proprement
3. **Timeline du parcours bouteille** — `flex items-center justify-between` horizontal avec 6 etapes : les labels debordent sur petit ecran, le texte `max-w-[90px]` tronque mal
4. **Legende** — Elements en `flex-wrap` sans espacement vertical suffisant sur mobile
5. **Source detail panel (WaterJourneyMap)** — `absolute top-4 left-4 max-w-[280px]` peut couvrir toute la carte sur mobile
6. **CartePolluants** — Pas de padding mobile (`py-12` partout, titre `text-3xl` sans responsive, `h2` au lieu de `h1`)
7. **TapWaterJourneyMap** — Meme probleme de hauteur fixe `h-[600px]`

### Fichiers modifies

#### 1. `src/components/QualityMap.tsx`
- Map container : `h-[400px] md:h-[600px]` au lieu de `minHeight="70vh"`
- Stats banner : reduire padding sur mobile

#### 2. `src/components/WaterJourneyMap.tsx`
- Map container : `h-[350px] md:h-[600px]`
- Controles : empiler verticalement sur mobile (`flex-col md:flex-row`), Select en `w-full md:w-[220px]`
- Toggles : empiler sur mobile
- Timeline : passer en scroll horizontal sur mobile (`overflow-x-auto`) ou grille 3x2
- Legende : ajouter `gap-y-2` pour le wrap mobile
- Source detail panel : `max-w-[calc(100%-2rem)]` sur mobile

#### 3. `src/components/TapWaterJourneyMap.tsx`
- Map container : `h-[350px] md:h-[600px]`
- Controles : empiler verticalement sur mobile, Select en `w-full md:w-[220px]`

#### 4. `src/pages/CartePolluants.tsx`
- Padding responsive : `py-6 md:py-12`
- Titre : `text-xl md:text-3xl`, icone responsive
- Section navigation : padding mobile

#### 5. `src/pages/Carte.tsx` (deja ok mais verification)
- Confirmer que le padding et les titres sont responsifs (deja fait)

### Details techniques

Tous les changements sont purement CSS/Tailwind, aucun changement de logique. Principe : reduire les hauteurs de carte sur mobile, empiler les controles verticalement, et rendre la timeline scrollable horizontalement sur petit ecran.

