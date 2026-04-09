

## Plan : Optimisation globale des performances du site

### Problèmes identifiés

1. **MapboxSecurityService.getMapboxToken()** fait un `import()` dynamique de `auditService` à CHAQUE appel pour logger un événement de sécurité inutile. Cela déclenche un chargement de module asynchrone à chaque initialisation de carte.

2. **analyticsService** s'initialise dans le constructeur avec des event listeners globaux (`click` sur tout le document, `beforeunload`, `visibilitychange`) et fait un `console.log` à chaque page view. Le tracking par `localStorage` (lecture/écriture JSON) est exécuté de façon synchrone au démarrage.

3. **Pages carte (CartePolluants, CarteParcoursEau, CarteParcoursRobinet)** importent directement `PollutantMap`, `WaterJourneyMap`, `TapWaterJourneyMap` sans lazy loading ni `MapLoader`. Mapbox GL (~700KB) est chargé immédiatement avec le chunk de la page.

4. **Page /carte** : double lazy-loading (LazyQualityMap > QualityMap > LazyInteractiveMap > InteractiveMap) crée une cascade de Suspense. Le `MapLoader` exige un clic sur mobile mais attend la visibilité sur desktop, ce qui ajoute un délai.

5. **Index.tsx** importe 2 images statiques (`water-background.jpg`, `ranking-water-bg.jpg`) de façon synchrone. Elles sont incluses dans le chunk de la page d'accueil et bloquent le rendu.

### Optimisations prévues

#### 1. Supprimer l'audit logging inutile dans MapboxSecurityService
**`src/services/mapboxSecurityService.ts`** — Retirer le `import('./auditService')` dans `getMapboxToken()`. Cet audit log n'a aucune valeur en production et provoque un import dynamique à chaque ouverture de carte.

#### 2. Rendre l'analyticsService non-bloquant
**`src/services/analyticsService.ts`** — Supprimer le `console.log` dans `trackPageView()`. Envelopper l'initialisation des event listeners dans `requestIdleCallback` pour ne pas bloquer le thread principal au démarrage.

#### 3. Lazy-loader les composants Mapbox sur les pages carte
Wraper les composants Mapbox lourds dans des composants Lazy + MapLoader pour les pages qui importent directement :
- **`src/pages/CartePolluants.tsx`** — `PollutantMap` → Lazy + MapLoader
- **`src/pages/CarteParcoursEau.tsx`** — `WaterJourneyMap` → Lazy + MapLoader
- **`src/pages/CarteParcoursRobinet.tsx`** — `TapWaterJourneyMap` → Lazy + MapLoader

#### 4. Simplifier la chaîne de lazy-loading pour /carte
**`src/pages/Carte.tsx`** — Remplacer `LazyQualityMap` par un import direct de `QualityMap` (la page Carte est déjà lazy-loadée dans App.tsx, donc le double wrapping est inutile). Le `MapLoader` dans `QualityMap.tsx` reste en place pour le chargement conditionnel de Mapbox.

#### 5. Lazy-loader les images de la page d'accueil
**`src/pages/Index.tsx`** — Remplacer les `import` statiques des images par des URL directes dans les attributs `src` avec `loading="lazy"`, ou utiliser un composant `LazyImage` existant.

### Fichiers modifiés
- `src/services/mapboxSecurityService.ts` — retrait de l'audit log (~8 lignes)
- `src/services/analyticsService.ts` — requestIdleCallback + suppression console.log (~5 lignes)
- `src/pages/CartePolluants.tsx` — lazy import PollutantMap + MapLoader
- `src/pages/CarteParcoursEau.tsx` — lazy import WaterJourneyMap + MapLoader
- `src/pages/CarteParcoursRobinet.tsx` — lazy import TapWaterJourneyMap + MapLoader
- `src/pages/Carte.tsx` — import direct QualityMap au lieu de LazyQualityMap
- `src/pages/Index.tsx` — images en lazy loading

