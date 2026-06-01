## Objectif
Optimiser le SEO du blog "Lettre de l'eau" (page liste + articles) pour maximiser l'indexation Google et la visibilité dans les résultats AI.

## Constat actuel
- `LettreEau.tsx` et `LettreEauArticle.tsx` utilisent déjà `SEOHead` avec title/description/canonical/Schema.org, mais :
  - Les URLs `/lettre-de-leau` et `/lettre-de-leau/:slug` **ne sont pas dans `public/sitemap.xml`** → invisibles aux crawlers.
  - **Aucun `<lastmod>` dynamique** par article (Google s'en sert pour prioriser le crawl).
  - **Pas de `BreadcrumbList` JSON-LD** sur les articles.
  - Le Schema `Article` devrait être `NewsArticle` (catégorie scandale/actu/réglementation = contenu d'actualité, mieux éligible aux carrousels Google News / Discover).
  - Pas de `author` nommé, pas de `keywords`, pas de `articleSection`.
  - Pas de `<meta name="robots">` explicite sur les articles, pas de `og:article:published_time` ni `article:tag`.
- `robots.txt` autorise `/` mais ne mentionne pas explicitement `/lettre-de-leau` (pas bloquant, mais explicite = mieux).
- Pas de **flux RSS** (`/lettre-de-leau/rss.xml`) — utile pour AI crawlers, agrégateurs, Google News.
- Pas d'**OG image dédiée par article** générée côté serveur (l'image de cover existe mais n'est pas toujours dimensionnée 1200x630).
- `BlogCard` n'utilise pas `<article>` sémantique ni microdata.

## Plan d'action

### 1. Sitemap dynamique pour le blog
Générer dynamiquement les URLs des articles publiés au build :
- Créer `scripts/generate-sitemap.ts` qui :
  - Conserve toutes les entrées statiques actuelles de `public/sitemap.xml`.
  - Ajoute `/lettre-de-leau` (priority 0.8, changefreq weekly).
  - Récupère via Supabase tous les articles `status='published'` et ajoute `/lettre-de-leau/<slug>` avec `<lastmod>` = `published_at` (priority 0.7, changefreq monthly).
  - Inclut `<image:image>` avec `cover_image_url` quand disponible.
- Ajouter les scripts `predev` et `prebuild` dans `package.json` qui invoquent `bunx tsx scripts/generate-sitemap.ts`.

### 2. Enrichir le Schema.org sur les articles (`LettreEauArticle.tsx`)
Remplacer `Article` par `NewsArticle` et enrichir :
- `datePublished` + `dateModified`
- `author`: `{ "@type": "Organization", "name": "Rédaction InfoEau", "url": "https://infoeau.fr" }`
- `articleSection`: libellé de la catégorie (CATEGORY_LABELS)
- `keywords`: catégorie + mots-clés dérivés du titre
- `wordCount` (approximatif depuis `content_md.length`)
- `inLanguage: "fr-FR"`
- Ajouter un second bloc `BreadcrumbList` (Accueil → Lettre de l'eau → titre).

### 3. Méta sociales et techniques additionnelles
Dans `SEOHead.tsx`, ajouter le support optionnel des balises Open Graph article :
- `article:published_time`, `article:modified_time`, `article:section`, `article:tag` (multiples), `article:author`.
- Les passer depuis `LettreEauArticle.tsx`.
Sur la page liste `LettreEau.tsx` : passer en `ogType="website"` avec Schema `Blog` enrichi (`blogPost[]` avec les 10 derniers articles).

### 4. Page liste : Schema.org `ItemList`
Ajouter sur `LettreEau.tsx` un Schema `ItemList` listant les articles affichés (position, url, name) → meilleure compréhension par Google et AI.

### 5. HTML sémantique
- `LettreEau.tsx` : envelopper la grille dans un `<main>` (déjà via Layout ?) et chaque carte dans `<article>`.
- `BlogCard.tsx` : remplacer le `<div>` racine par `<article>` avec `<h3>` pour le titre et `<time dateTime="...">` pour la date.
- `LettreEauArticle.tsx` : la balise `<article>` existe déjà, ajouter `<time dateTime={article.published_at}>` autour de la date.

### 6. Flux RSS pour le blog
Créer `scripts/generate-rss.ts` qui génère `public/lettre-de-leau/rss.xml` au build (predev/prebuild), avec les 20 derniers articles. Ajouter dans `LettreEau.tsx` un `<link rel="alternate" type="application/rss+xml">` via Helmet.

### 7. Mise à jour `robots.txt` et `llms.txt`
- `robots.txt` : ajouter `Allow: /lettre-de-leau` explicite et déclarer le flux RSS.
- `public/llms.txt` et `public/llms-full.txt` : ajouter une section "Lettre de l'eau" listant les articles récents (régénérée au build par le script sitemap).

### 8. Optimisations performance/UX qui aident le SEO
- Ajouter `loading="lazy"` et `decoding="async"` sur les images des `BlogCard` (vérifier que c'est bien le cas).
- Sur `LettreEauArticle.tsx`, ajouter `loading="eager"` + `fetchpriority="high"` sur l'image de cover (LCP).
- S'assurer que chaque article a un `excerpt` ≤ 160 caractères pour la meta description (tronquer proprement si besoin).

## Détails techniques
- Le script de sitemap utilisera la clé publique Supabase (anon) côté Node — pas besoin de service_role pour lire les articles publiés (RLS already public).
- L'ordre dans `sitemap.xml` : statique d'abord, puis blog (déjà trié par date desc).
- Les fichiers `sitemap.xml` et `rss.xml` resteront commit-és (régénérés à chaque dev/build).
- Aucune migration DB nécessaire.

## Fichiers impactés
- `scripts/generate-sitemap.ts` *(créé)*
- `scripts/generate-rss.ts` *(créé)*
- `package.json` *(predev/prebuild)*
- `src/components/SEOHead.tsx` *(props OG article)*
- `src/pages/LettreEau.tsx` *(Schema enrichi, RSS link, ItemList)*
- `src/pages/LettreEauArticle.tsx` *(NewsArticle, BreadcrumbList, OG article)*
- `src/components/blog/BlogCard.tsx` *(HTML sémantique)*
- `public/robots.txt` *(RSS + allow)*
- `public/llms.txt` *(section blog)*
- `public/sitemap.xml` *(regénéré)*

## Hors-scope
- Pas de changement de structure de la DB.
- Pas de modification du contenu des articles ni du generator d'articles.
- Pas d'AMP, pas de SSR (resterait client-side avec Helmet — limitation acceptée pour les crawlers JS).