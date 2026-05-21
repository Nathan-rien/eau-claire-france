
# Lettre de l'eau — Blog d'actualités automatisé

## Vue d'ensemble

Nouvelle rubrique `/lettre-de-leau` (liste) + `/lettre-de-leau/:slug` (article). Un edge function programmé toutes les 72h cherche une actualité fraîche sur l'eau (Firecrawl search), génère un article ~1500 mots avec Lovable AI, génère une image de couverture, détecte si des chiffres méritent une infographie Recharts, publie automatiquement. Encart sur la home + lien dans le header.

## Structure du contenu

Chaque article contient :
- titre, slug, chapeau, contenu Markdown ~1500 mots, image de couverture
- catégorie (ex: scandale, réglementation, qualité, santé, environnement)
- sources citées (URLs, titres)
- infographie data optionnelle (type bar/line, série Recharts JSON)
- date de publication, statut (published)
- SEO : meta description, canonical, JSON-LD Article

## Base de données

Table `blog_articles` (public read, service_role write) :
- `id`, `slug` (unique), `title`, `excerpt`, `content_md`
- `cover_image_url`, `category`, `sources` (jsonb), `infographic` (jsonb null)
- `published_at`, `status` ('draft'|'published'), `reading_time_min`
- `seo_title`, `seo_description`
- `created_at`, `updated_at`

Table `blog_generation_log` (admin/service only) : trace les runs (sujet, statut, erreur).

Storage bucket public `blog-images` pour les couvertures.

## Backend

**Edge function `generate-blog-article`** (manuel + cron) :
1. Firecrawl `search` → 5 actualités eau récentes FR (filter `tbs: qdr:w`)
2. Filtrer sujets déjà couverts (compare contre `blog_articles.title` derniers 90j)
3. Choisir le plus pertinent, Firecrawl `scrape` 2-3 sources
4. Lovable AI (`google/gemini-2.5-pro`) : générer JSON structuré { title, slug, excerpt, content_md (~1500 mots), category, seo_*, sources[], suggested_infographic? }
5. Si `suggested_infographic` → générer chart data (bar/line) en JSON
6. Lovable AI image (`google/gemini-3.1-flash-image-preview`) : couverture éditoriale, upload vers bucket
7. INSERT dans `blog_articles` status='published'
8. Log dans `blog_generation_log`

**Edge function `cron-blog-trigger`** : appelée par pg_cron toutes les 72h, invoque la précédente.

**Cron pg_cron** : `0 9 */3 * *` (tous les 3 jours à 09:00 UTC).

Secrets requis : `LOVABLE_API_KEY` ✅ existant. Connecteur Firecrawl à activer.

## Frontend

**Pages** :
- `src/pages/LettreEau.tsx` — liste paginée, filtres par catégorie, carte article (image, titre, excerpt, date, catégorie, temps lecture)
- `src/pages/LettreEauArticle.tsx` — header avec image, titre, meta ; corps Markdown (`react-markdown` + `remark-gfm`) ; infographie Recharts si présente ; sources en bas ; articles liés ; SEO Helmet + JSON-LD Article

**Composants** :
- `BlogCard.tsx`, `BlogInfographic.tsx` (rend bar/line Recharts), `BlogSourcesList.tsx`

**Header** (`Navigation.tsx`) : ajouter "Lettre de l'eau" dans `directionNavigationItems` (FR + EU).

**Home** (`Index.tsx`) : nouvel encart "Dernières actualités" (3 articles récents, CTA "Voir toutes les actualités").

**Admin** (`Admin.tsx`) : bouton "Générer un article maintenant" (invoke edge function), liste des articles avec delete/unpublish.

## SEO

- `seoData.lettreEau` (liste) et dynamique par article (title, description, canonical `/lettre-de-leau/:slug`, og:image = cover)
- JSON-LD `Article` sur chaque page article
- Ajout des articles au `sitemap.xml` (généré ou statique)
- Lien dans `llms.txt` / `llms-full.txt`

## Détails techniques

```
supabase/functions/
  generate-blog-article/index.ts   # Firecrawl + Lovable AI + insert
  cron-blog-trigger/index.ts        # appelé par pg_cron
src/pages/
  LettreEau.tsx
  LettreEauArticle.tsx
src/components/blog/
  BlogCard.tsx
  BlogInfographic.tsx
  BlogSourcesList.tsx
  HomeBlogTeaser.tsx
src/services/blogApi.ts             # fetchArticles, fetchArticleBySlug
```

Routes ajoutées dans `App.tsx` :
- `/lettre-de-leau` → `LettreEau`
- `/lettre-de-leau/:slug` → `LettreEauArticle`

Dépendances à ajouter : `react-markdown`, `remark-gfm`.

## Coût & garde-fous

- Génération limitée à 1 article/3j via cron (~10 articles/mois)
- Bouton admin "générer maintenant" protégé par `is_admin()`
- Si Firecrawl ne trouve rien de neuf → log + skip (pas d'article inventé)
- Status `draft` possible pour validation manuelle si vous changez d'avis plus tard

## Prérequis avant build

1. **Activer le connecteur Firecrawl** (pour la recherche web temps réel). Sans ça, l'IA n'a pas d'actualités fraîches.
2. Confirmer le créneau de publication (proposé : 09:00 UTC tous les 3 jours).
