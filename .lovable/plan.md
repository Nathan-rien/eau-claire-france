## Objectif
Basculer la génération d'articles de blog sur l'API Gemini directe (Google AI Studio) au lieu du Lovable AI Gateway, pour éviter la limite de crédits.

## Pourquoi Gemini
- Gratuit jusqu'à ~15 req/min sur `gemini-2.0-flash` via Google AI Studio (clé `GEMINI_API_KEY`)
- Qualité équivalente à GPT-4o-mini pour de la rédaction FR
- Supporte nativement `response_mime_type: "application/json"` (sortie JSON garantie)
- Peut aussi générer des images via `gemini-2.5-flash-image` (Nano Banana) — utile pour la cover

## Changements

### 1. Secret à ajouter
- `GEMINI_API_KEY` (obtenu gratuitement sur https://aistudio.google.com/apikey)

### 2. `supabase/functions/generate-blog-article/index.ts`
- Remplacer `callLovableAI()` par un appel à :
  ```
  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}
  ```
  avec `generationConfig.response_mime_type = "application/json"` pour le contenu de l'article.
- **Image de couverture** : 2 options au choix
  - **A.** Garder Gemini Image (`gemini-2.5-flash-image-preview`) → image générée IA, uploadée sur Supabase Storage (flow actuel conservé)
  - **B.** Utiliser Unsplash (photo réelle, gratuit) → nécessite `UNSPLASH_ACCESS_KEY` en plus

### 3. `trigger-blog-article/index.ts`
- Aucun changement (il invoque juste le generator).

## Coût
- Texte : **gratuit** (free tier Gemini ≈ 1500 req/jour)
- Image (option A) : gratuit dans le même quota

## Question avant implémentation
Quelle option pour l'image de couverture ?
