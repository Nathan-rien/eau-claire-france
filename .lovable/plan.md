

## Plan : Rendre les zones de sources cliquables sur /carte avec panneau de détail

### Objectif
Permettre de cliquer sur les 11 zones de provenance affichées sur la carte interactive de `/carte` et afficher les données détaillées des sources associées, similaire au panneau latéral de `/sources-eau`.

### Approche

Intégrer les données de sources (via `buildSources()` de `sourcesAdapter.ts`) dans `InteractiveMap.tsx` et ajouter un panneau d'information latéral qui s'affiche au clic sur une zone.

### Modifications

#### 1. `src/components/InteractiveMap.tsx` — Ajout interactivité zones + panneau détail

- **Importer `buildSources` et `SourceItem`** depuis `@/utils/sourcesAdapter`
- **Charger les sources au mount** via `useEffect` + `useState<SourceItem[]>`
- **Mapper chaque zone à ses sources** : associer les sources à leur zone géographique via un test de coordonnées (point dans le rectangle de la zone) ou un mapping manuel zone → source_id/source_name
- **Rendre les zones cliquables** : ajouter un `map.on('click', 'water-zone-fill-*')` qui identifie la zone cliquée et affiche les sources correspondantes
- **Ajouter un état `selectedZone`** avec le nom de la zone et la liste de sources filtrées
- **Panneau de détail** : afficher à droite (ou en dessous sur mobile) une carte avec :
  - Nom de la zone
  - Liste des sources dans la zone avec pour chacune :
    - Nom de la source, type d'eau (badge coloré)
    - Marques associées
    - Minéralisation (badge résidu sec via `getMineralizationLevel`)
    - Dureté (°f via `computeHardness`)
    - Composition minérale (tableau compact)
    - Recommandations d'usage (nourrissons, pauvre en sodium, etc.)
    - Conformité réglementaire (nitrates, fluor, sodium)
  - Bouton "Fermer" pour revenir à la vue normale

- **Réorganiser le layout** : passer de `Card > div` simple à un grid `lg:grid-cols-3` (carte 2/3 + panneau 1/3) comme sur `/sources-eau`, le panneau n'apparaissant qu'au clic sur une zone

- **Curseur pointer** sur les zones au survol (`mouseenter`/`mouseleave` sur les layers fill)

#### 2. Réutilisation des fonctions existantes de `WaterSourcesMap.tsx`

Extraire dans un fichier utilitaire partagé ou dupliquer les helpers déjà existants :
- `getMineralizationLevel`, `computeHardness`, `getHardnessLabel`
- `getUsageRecommendations`, `getComplianceChecks`

Comme ces fonctions sont déjà définies dans `WaterSourcesMap.tsx`, les **extraire dans `src/utils/waterSourceAnalysis.ts`** pour les partager entre les deux composants.

### Fichiers modifiés
- **`src/utils/waterSourceAnalysis.ts`** (nouveau) — helpers partagés extraits de WaterSourcesMap
- **`src/components/InteractiveMap.tsx`** — layout grid, chargement sources, clic zones, panneau détail
- **`src/components/WaterSourcesMap.tsx`** — imports depuis le nouveau fichier utilitaire (refactoring léger)

### Ce qui ne change pas
- Les villes et leurs popups restent inchangés
- Le toggle zones dans QualityMap reste identique
- La page /sources-eau garde son comportement actuel

