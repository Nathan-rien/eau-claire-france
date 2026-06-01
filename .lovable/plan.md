# Réparer la génération hebdomadaire de la Lettre de l'eau

## Diagnostic

- Dernier article publié : **21 mai 2026** (Nestlé Waters).
- Tentative du 25 mai : échec `Gemini 429 — prepayment credits are depleted`.
- Toutes les tentatives suivantes échoueraient pour la même raison (la clé `GEMINI_API_KEY` directe est à sec).
- Le projet possède déjà le secret **`LOVABLE_API_KEY`** (Lovable AI Gateway), facturé via Lovable Cloud, qui expose les modèles Gemini sans gestion de quota séparée.

## Plan

### 1. Basculer l'edge function sur Lovable AI Gateway
Fichier : `supabase/functions/generate-blog-article/index.ts`

- Remplacer les appels directs à `generativelanguage.googleapis.com` par l'endpoint Lovable AI Gateway :
  - Texte → `POST https://ai.gateway.lovable.dev/v1/chat/completions` avec `model: "google/gemini-2.5-flash"`, `response_format: { type: "json_object" }`, en utilisant `Authorization: Bearer ${LOVABLE_API_KEY}`.
  - Image de couverture → `model: "google/gemini-2.5-flash-image-preview"` sur le même endpoint, extraction du `data:image/...;base64,...` depuis `choices[0].message.images[0].image_url.url`.
- Garder le même contrat de sortie JSON (titre, slug, excerpt, content_md, image_prompt, etc.) pour ne rien casser en aval.
- Gérer proprement les codes 429 (rate-limit) et 402 (crédits épuisés Lovable AI) avec un message d'erreur clair dans `blog_generation_log`.
- Conserver `GEMINI_API_KEY` comme fallback optionnel uniquement si `LOVABLE_API_KEY` est absent (pour ne rien régresser).

### 2. Relancer immédiatement un article
Une fois la function redéployée (auto), invoquer manuellement `generate-blog-article` (sans topic forcé) via `curl` pour produire l'article de la semaine. Vérification ensuite via `SELECT` sur `blog_articles` et `blog_generation_log`.

### 3. Vérifier le cron GitHub Actions
Le workflow `.github/workflows/lettre-eau-weekly.yml` (tous les lundis 07:00 UTC) reste inchangé — il continuera à appeler la même URL, qui utilisera désormais Lovable AI.

## Détails techniques

```text
Avant : edge function ──► Google Generative Language API (GEMINI_API_KEY) ✗ crédits 0
Après : edge function ──► Lovable AI Gateway (LOVABLE_API_KEY) ──► Gemini 2.5 Flash ✓
```

Aucune migration DB nécessaire. Aucun changement front. Pas de nouveau secret à créer.

## Fichiers touchés

- `supabase/functions/generate-blog-article/index.ts` (refonte des deux helpers `callGeminiText` et `generateCoverImage`).
