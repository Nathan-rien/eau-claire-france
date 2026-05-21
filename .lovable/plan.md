## 1. Nettoyer les mentions "(Source N)" dans les articles

Dans `supabase/functions/generate-blog-article/index.ts` :
- Modifier le prompt système / utilisateur pour interdire explicitement les mentions inline du type `(Source 1)`, `(Source 2)`, `(Sources 1, 2)`. Les sources cliquables restent affichées en bas de l'article.
- Ajouter, après le parsing JSON, un post-traitement défensif sur `content_md` qui supprime les motifs résiduels via regex (ex. `\s*\((?:Source[s]?\s*\d+(?:\s*,\s*\d+)*)\)`), avec nettoyage des doubles espaces / ponctuation orpheline.

## 2. Améliorer l'espacement de lecture dans l'article

Dans `src/pages/LettreEauArticle.tsx`, sur le bloc `prose` :
- Augmenter la taille de lecture (`prose-lg`) et l'interligne (`leading-relaxed`).
- Espacer titres et paragraphes via les classes Tailwind typography : `prose-headings:mt-10 prose-headings:mb-4 prose-h2:mt-12 prose-h2:mb-5 prose-h3:mt-8 prose-h3:mb-3 prose-p:my-5 prose-p:leading-[1.85] prose-li:my-1.5 prose-blockquote:my-6`.
- Garder le design system existant (tokens sémantiques, pas de couleurs en dur).

## 3. Génération automatique hebdomadaire

Créer `.github/workflows/lettre-eau-weekly.yml` :
- Trigger `schedule: cron: '0 7 * * 1'` (lundi 07:00 UTC ≈ 09:00 Paris) + `workflow_dispatch` pour déclenchement manuel.
- Job unique qui fait un `curl POST` vers `https://xblogttmomuogdhmaztf.supabase.co/functions/v1/generate-blog-article` avec `Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}`, body `{}` (laisse la fonction choisir un sujet aléatoire dans sa liste).
- Pas de dédoublonnage à modifier (déjà géré par la fonction sur 90 jours).

Secrets requis dans GitHub Actions : `SUPABASE_SERVICE_ROLE_KEY` (déjà présent d'après `scrape.yml`).

## Détails techniques

- Le service role key suffit à appeler la fonction (jwt désactivé en pratique côté generate-blog-article qui n'attend qu'un body JSON).
- La regex de nettoyage gère aussi les variantes `(source 1)`, `( Source 2 )`, `(Source 1, 2 et 3)`.
- Aucun changement de schéma DB nécessaire.
- Aucun changement à `trigger-blog-article` (déclencheur admin manuel inchangé).
