

## Plan : Référencement complet et préparation indexation (Google + IA)

### Audit des écarts identifiés

**Pages manquantes dans le sitemap.xml :**
- `/cours-eau` — page active avec SEO configuré, absente du sitemap

**Pages dynamiques non référencées :**
- `/marque/:slug` — pages de prix par marque (ex: `/marque/evian`), absentes du sitemap et sans données structurées dynamiques suffisantes

**Fichier manquant pour les IA :**
- Pas de `llms.txt` — fichier standard émergent pour aider Claude, ChatGPT, Perplexity à comprendre et indexer un site

**Route manquante :**
- `DiagnosticPrix` a un fichier page + seoData mais aucune route dans App.tsx — soit l'ajouter, soit nettoyer

---

### Modifications prévues

#### 1. Mettre à jour `public/sitemap.xml`
- Ajouter l'entrée `/cours-eau` (changefreq: daily, priority: 0.8)
- Ajouter des entrées pour les principales marques connues (`/marque/evian`, `/marque/cristaline`, `/marque/volvic`, `/marque/vittel`, `/marque/perrier`, `/marque/hepar`, `/marque/badoit`, `/marque/contrex`, `/marque/mont-roucous`, `/marque/saint-amand`) avec priority 0.6

#### 2. Créer `public/llms.txt`
Fichier descriptif pour les IA, contenant :
- Nom et mission du site
- Liste des pages principales avec descriptions courtes
- Types de données disponibles (qualité eau, composition minérale, prix, polluants)
- Indication des sources officielles (ARS, SISPEA, EEA)

#### 3. Créer `public/llms-full.txt`
Version détaillée avec la structure complète du site, les fonctionnalités par page, et les données accessibles — pour les crawlers IA qui supportent ce format étendu.

#### 4. Mettre à jour `public/robots.txt`
- Ajouter la référence au `llms.txt` : ligne `# AI crawlers` avec `Sitemap: https://infoeau.fr/llms.txt`

#### 5. Ajouter la route `/diagnostic-prix` dans `App.tsx`
Le fichier `src/pages/DiagnosticPrix.tsx` existe avec son SEOHead configuré mais n'est pas routé. Ajouter la route (avec `robots: noindex` déjà géré par robots.txt).

#### 6. Enrichir les données structurées de `index.html`
- Ajouter un schema `Organization` avec logo, sameAs (réseaux sociaux si existants)
- Ajouter un schema `BreadcrumbList` par défaut pour la page d'accueil

### Fichiers modifiés
- `public/sitemap.xml`
- `public/robots.txt`
- `public/llms.txt` (nouveau)
- `public/llms-full.txt` (nouveau)
- `src/App.tsx` (ajout route diagnostic-prix)
- `index.html` (enrichissement schema.org)

