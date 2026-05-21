# Plan — Bascule complète sur OpenAI + Unsplash

Remplacer Lovable AI Gateway par l'API OpenAI directe (GPT-4o-mini) dans `generate-blog-article`, et remplacer la génération d'images Gemini par une recherche d'image libre via Unsplash.

## Étapes

### 1. Secrets à ajouter
- `OPENAI_API_KEY` — clé API OpenAI (à créer sur platform.openai.com → API Keys)
- `UNSPLASH_ACCESS_KEY` — clé Unsplash (à créer sur unsplash.com/developers, gratuit jusqu'à 50 req/h en dev, 5000/h en prod)

Demande des deux secrets via le tool `add_secret` avant tout code.

### 2. Modification de `generate-blog-article/index.ts`

**Texte (article 1500 mots + JSON structuré)** :
- Remplacer `callLovableAI()` → appel à `https://api.openai.com/v1/chat/completions`
- Header : `Authorization: Bearer ${OPENAI_API_KEY}`
- Modèle : `gpt-4o-mini` (~$0.0002 / article 1500 mots)
- Conserver `response_format: { type: "json_object" }` (compatible OpenAI)
- Conserver le même prompt système et user (déjà compatible)

**Image de couverture** :
- Supprimer `generateCoverImage()` (Gemini) et `uploadImage()` (Storage Supabase devient inutile pour la cover)
- Nouvelle fonction `searchUnsplashImage(query)` :
  - Appel : `GET https://api.unsplash.com/search/photos?query=...&orientation=landscape&per_page=5`
  - Header : `Authorization: Client-ID ${UNSPLASH_ACCESS_KEY}`
  - Retourne `results[0].urls.regular` (ou `.full`) + `user.name` + `user.links.html` pour attribution
- L'IA génère désormais un champ `image_query` (mots-clés EN courts type "water bottle factory") au lieu de `image_prompt`
- Stockage dans `blog_articles.cover_image_url` = URL Unsplash directe (pas de re-upload)
- Optionnel : ajouter `cover_credit` (JSON ou texte) avec nom/lien photographe pour conformité Unsplash

### 3. Modification de `trigger-blog-article/index.ts`
Aucun changement nécessaire — il forward déjà au générateur.

### 4. Vérification & test
- Déployer les 2 edge functions
- Tester via curl avec topic forcé "scandale Perrier Vittel Nestlé Waters"
- Vérifier dans `blog_articles` : article inséré, `cover_image_url` non null pointant vers Unsplash
- Vérifier rendu sur `/lettre-de-leau` et `/lettre-de-leau/:slug`

## Détails techniques

**Compatibilité API OpenAI** : l'endpoint chat completions est identique à celui de Lovable Gateway (même schéma OpenAI), donc seul l'URL, le header Auth et le nom du modèle changent. `response_format: json_object` est natif chez OpenAI.

**Format réponse Unsplash** :
```json
{
  "results": [{
    "urls": { "regular": "https://images.unsplash.com/photo-xxx?w=1080", "full": "..." },
    "alt_description": "...",
    "user": { "name": "Jane Doe", "links": { "html": "https://unsplash.com/@jane" } }
  }]
}
```

**Schéma DB** : `cover_image_url` (text) déjà présent. Optionnel : ajouter colonne `cover_credit jsonb` via migration pour stocker `{name, url}` (recommandé pour respecter les guidelines Unsplash : attribution photographe + lien "Photo on Unsplash"). À confirmer.

**Coûts estimés par article** :
- GPT-4o-mini : ~3-4k tokens entrée + 2k sortie ≈ $0.0015
- Unsplash : gratuit
- Total : <$0.002 / article (vs crédits Lovable AI épuisés actuellement)

**Fichiers modifiés** :
- `supabase/functions/generate-blog-article/index.ts` (refonte appels IA + image)
- Optionnel : migration SQL pour `cover_credit jsonb`

## Question avant exécution
Veux-tu qu'on ajoute la colonne `cover_credit` pour afficher l'attribution photographe (recommandé par Unsplash) ? Sinon on garde juste l'URL.
