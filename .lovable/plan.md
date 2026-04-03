

## Optimisation de la vitesse de chargement

### Etat des lieux

**Ce qui est deja bien fait :**
- React.lazy sur toutes les pages (code splitting OK)
- React Query avec staleTime 10min / gcTime 30min
- LazyInteractiveMap / LazyQualityMap pour Mapbox
- bottleApi.ts fait un dynamic import de bottleComparisonData

**Problemes identifies :**

1. **bottleComparisonData.ts (1304 lignes, ~50KB)** — importe statiquement par 17 fichiers (types, hooks, composants). Meme si bottleApi fait un dynamic import, les imports directs du type `BottleWaterData` forcent le bundler a inclure le fichier entier dans les chunks qui l'utilisent.

2. **Amplitude analytics bloquant** — 2 scripts synchrones dans `<head>` de index.html bloquent le rendu initial.

3. **translations.ts (610 lignes)** — charge dans le bundle principal via LanguageProvider qui wrap toute l'app.

4. **SecurityHeaders + EnhancedSecurityService** — rendus/executes sur chaque page, SecurityHeaders genere un CSP via Helmet sur chaque navigation.

5. **Vite sans configuration de build** — pas de manualChunks, pas de compression, pas de rollupOptions.

6. **HelmetProvider double** — present dans App.tsx ET Layout.tsx (double instanciation).

7. **PriceDomGuard** — MutationObserver qui scanne tout le DOM en continu.

### Plan d'action

**1. Vite build optimization (`vite.config.ts`)**

Ajouter `build.rollupOptions.output.manualChunks` pour separer :
- `vendor-react` : react, react-dom, react-router-dom
- `vendor-ui` : @radix-ui/*, class-variance-authority, lucide-react
- `vendor-query` : @tanstack/react-query
- `vendor-mapbox` : mapbox-gl (deja lazy mais forcer l'isolation)
- `data-bottles` : bottleComparisonData, bottleWaterData

**2. Scripts Amplitude en async/defer (`index.html`)**

Ajouter `async` sur les 2 balises `<script>` Amplitude pour debloquer le rendu initial. Gain : ~200-500ms sur le First Contentful Paint.

**3. Separer les types des donnees bouteilles**

Extraire `BottleWaterData` (interface) et `tapWaterComparison` dans un fichier `src/types/bottleTypes.ts` separe de `bottleComparisonData.ts` (qui contient les 1200+ objets). Les 17 fichiers qui importent seulement le type n'entraineront plus le chargement des donnees.

**4. Supprimer le HelmetProvider en double**

Retirer le `HelmetProvider` de `Layout.tsx` — celui de `App.tsx` suffit.

**5. Memoiser SecurityHeaders**

Wrapper SecurityHeaders dans `React.memo` car le CSP est statique, il n'a pas besoin de re-render.

**6. Lazy-loader les traductions**

Pas d'action immediate (610 lignes est acceptable). Mais deplacer le fichier dans un chunk dedie via manualChunks.

**7. Preload des routes critiques**

Ajouter `<link rel="modulepreload">` pour le chunk Index dans index.html, et preload on hover pour les liens de navigation principaux.

### Fichiers modifies

1. **`vite.config.ts`** — manualChunks, terser minification
2. **`index.html`** — async sur scripts Amplitude
3. **`src/types/bottleTypes.ts`** (nouveau) — extraire BottleWaterData interface + tapWaterComparison
4. **`src/data/bottleComparisonData.ts`** — re-exporter depuis bottleTypes pour retrocompatibilite
5. **`src/components/Layout.tsx`** — retirer HelmetProvider
6. **`src/components/SecurityHeaders.tsx`** — React.memo
7. **`src/components/Navigation.tsx`** ou **`Header.tsx`** — preload on hover des routes

### Gains estimes

- **Bundle initial** : -30-40% (separation vendor + data bottles)
- **FCP** : -200-500ms (Amplitude async)
- **Navigation inter-pages** : plus rapide (preload on hover)
- **Re-renders inutiles** : reduits (memo SecurityHeaders, HelmetProvider unique)

