

## Audit SEO complet — Plan de corrections

### Problemes identifies

**1. Pages publiques sans SEOHead (4 pages)**
- `/classement` (Classement.tsx) — pas de SEOHead, pas de meta
- `/comparatif-bouteilles` (ComparatifBouteilles.tsx) — pas de SEOHead
- `/polluants` (Polluants.tsx) — pas de SEOHead
- `/diagnostic-prix` (DiagnosticPrix.tsx) — pas de SEOHead (page publique d'audit)

**2. seoData.ts — entrees manquantes**
- `classement` (FR) : absent — seul `classementEurope` existe
- `comparatifBouteilles` : existe mais sans `schemaData`
- `polluants` : existe mais sans `schemaData`
- `diagnosticPrix` : absent
- `parcoursEauBouteille` : absent (page utilise des meta en dur)
- `carteParcoursEau` : absent (meta en dur)
- `carteParcoursRobinet` : absent (meta en dur)
- `sourcesEau` : absent

**3. Sitemap incomplet — pages manquantes**
- `/composition-europe` — route existe, absente du sitemap

**4. SEOHead — canonical fragile**
- Quand `canonical` n'est pas fourni, fallback sur `window.location.href` qui inclut les query params et ne fonctionne pas en SSR/prerendering. Devrait utiliser `window.location.origin + window.location.pathname`.

**5. Web Core Vitals — optimisations**
- Images : pas de `width`/`height` sur les images (CLS). Ajouter des dimensions explicites dans les composants critiques (Header, Index hero).
- Lazy loading : deja en place via `React.lazy` — OK.
- Font : pas de `font-display: swap` dans les imports CSS eventuels.
- LCP : le hero de la page d'accueil charge des icones Lucide mais pas d'image hero large — OK.

---

### Modifications prevues

**Fichier : `src/utils/seoData.ts`**
- Ajouter les entrees manquantes : `classement`, `diagnosticPrix`, `parcoursEauBouteille`, `carteParcoursEau`, `carteParcoursRobinet`, `sourcesEau`
- Ajouter `schemaData` a `comparatifBouteilles` et `polluants`

**Fichier : `src/pages/Classement.tsx`**
- Importer et ajouter `SEOHead` avec `seoData.classement`

**Fichier : `src/pages/ComparatifBouteilles.tsx`**
- Importer et ajouter `SEOHead` avec `seoData.comparatifBouteilles`

**Fichier : `src/pages/Polluants.tsx`**
- Importer et ajouter `SEOHead` avec `seoData.polluants`

**Fichier : `src/pages/DiagnosticPrix.tsx`**
- Importer et ajouter `SEOHead` avec `seoData.diagnosticPrix`

**Fichier : `src/pages/ParcoursEauBouteille.tsx`**
- Remplacer les meta en dur par `SEOHead` + `seoData.parcoursEauBouteille`

**Fichier : `src/pages/CarteParcoursEau.tsx`**
- Remplacer les meta en dur par `SEOHead` + `seoData.carteParcoursEau`

**Fichier : `src/pages/CarteParcoursRobinet.tsx`**
- Remplacer les meta en dur par `SEOHead` + `seoData.carteParcoursRobinet`

**Fichier : `src/components/SEOHead.tsx`**
- Fix canonical fallback : `window.location.origin + window.location.pathname` au lieu de `window.location.href`

**Fichier : `public/sitemap.xml`**
- Ajouter `/composition-europe`

**Fichier : `public/robots.txt`**
- Ajouter `Disallow: /diagnostic-prix` (page technique d'audit, pas utile pour les moteurs)

