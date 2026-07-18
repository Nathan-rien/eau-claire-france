## Objectif

Auditer et renforcer la visibilité du site sur **les moteurs classiques (Google/Bing) ET les IA conversationnelles** (ChatGPT Search, Perplexity, Claude, Gemini, Copilot, You.com, Arc Search, Brave), qui utilisent d'autres signaux que le SEO traditionnel.

## 1. Audit (lecture seule)

- Relancer un scan SEO (`seo--trigger_scan`) et lister les findings en cours.
- Vérifier l'état actuel de :
  - `index.html` → title, meta description, canonical, og:*, JSON-LD sitewide.
  - `public/robots.txt` → autorisation explicite des bots IA (GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended, Applebot-Extended, Bytespider, Amazonbot, CCBot, DuckAssistBot, Meta-ExternalAgent, cohere-ai, YouBot, Bravebot).
  - `public/llms.txt` → présence, format spec (H1 + résumé + sections `## Docs`, `## Pages`, `## Optional`), fraîcheur des liens vs `src/App.tsx`.
  - `public/sitemap.xml` + `scripts/generate-sitemap.ts` → couverture des routes récentes (`/gout-eau`, `/guide/ma-commune`, `/guide/eaux-riches-magnesium`, `/actualites/pollution-manganese-vendee-juillet-2026`, communes, articles blog dynamiques).
  - Schémas JSON-LD par page : `Article`, `NewsArticle`, `FAQPage`, `Dataset`, `BreadcrumbList`, `Organization`, `WebSite` + `SearchAction`.
  - Search Console (via connecteur) : couverture, sitemaps soumis, erreurs.
- Vérifier via Playwright headless que le HTML statique (sans JS) contient bien les meta essentielles — les crawlers IA n'exécutent pas tous le JS.

## 2. Optimisations "AI-search"

Renforcer les signaux spécifiques aux IA :

- **`robots.txt`** : ajouter des blocs `User-agent` explicites `Allow: /` pour les 15+ crawlers IA listés, plus `Sitemap:` + référence `llms.txt`.
- **`llms.txt` / `llms-full.txt`** :
  - Aligner sur les nouvelles routes (guides, actus, gout-eau, communes phares).
  - Créer un `llms-full.txt` optionnel avec un résumé consolidé du contenu (utilisé par certains crawlers pour ingestion).
- **Schémas Schema.org additionnels** :
  - `WebSite` + `SearchAction` (SiteLinks Searchbox) dans `index.html`.
  - `BreadcrumbList` sur les pages guides / commune / article.
  - `Dataset` sur `/carte`, `/carte-polluants`, `/prix-eaux` (recherché par Google Dataset et Perplexity).
  - `SpeakableSpecification` sur les FAQ (Assistants vocaux).
- **Head par route** : vérifier que `react-helmet-async` couvre `og:url`, `canonical`, `og:type=article` sur les articles/guides.
- **Ancres et FAQ** : compléter les Q/R en langage naturel (les IA privilégient ce format).

## 3. Vérification & suivi

- Rejouer `submit-sitemap` (edge function déjà en place) après les modifications.
- Utiliser l'inspection URL Search Console sur 5 pages clés (home, `/gout-eau`, `/guide/ma-commune`, `/qualite-eau/brest`, article Vendée).
- Marquer les findings SEO corrigés via `seo_chat--update_findings`.
- Fournir au user un mini tableau récapitulatif : bot par bot (Google, Bing, GPTBot, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended…) → statut autorisé + signal envoyé (sitemap, llms.txt, JSON-LD).

## Livrables

- `public/robots.txt` mis à jour (bots IA explicites).
- `public/llms.txt` + `public/llms-full.txt` rafraîchis.
- `index.html` : JSON-LD `WebSite`+`SearchAction` ajouté.
- Schémas `BreadcrumbList` / `Dataset` sur pages ciblées.
- Sitemap à jour + resoumis à Search Console.
- Rapport final dans le chat avec matrice bots ↔ signaux ↔ statut.

## Détails techniques

- Les crawlers IA (GPTBot, PerplexityBot, ClaudeBot) ne lisent **pas** le JS : toute donnée critique doit être dans le HTML statique `index.html` ou pré-rendue. `react-helmet-async` couvre uniquement Googlebot.
- `llms.txt` respecte strictement la spec https://llmstxt.org (H1 unique, `>` résumé, sections `##` avec listes de liens).
- Les `Allow: /` par User-agent doivent précéder tout `Disallow` par bot pour être respectés.
