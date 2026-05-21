## Premier article — Scandale Perrier & Vittel

Objectif : publier le tout premier article de la "Lettre de l'eau" sur le scandale en cours autour de Nestlé Waters (Perrier, Vittel, Hépar, Contrex), en s'appuyant sur la pipeline déjà en place (`generate-blog-article`).

### Étapes

1. **Vérifier les crédits Lovable AI**
   - La génération précédente avait échoué en 402 (crédits IA épuisés).
   - Avant de relancer, confirmer que des crédits sont disponibles dans Settings → Workspace → Usage. Sans ça, l'article ne pourra ni être rédigé ni illustré.

2. **Forcer le sujet "Perrier / Vittel"**
   - Modifier `supabase/functions/generate-blog-article/index.ts` pour accepter un paramètre optionnel `topic` (ex. `{ "topic": "scandale Perrier Vittel Nestlé Waters traitements interdits 2024 2025" }`) dans le body de la requête.
   - Quand `topic` est fourni : utiliser cette query Firecrawl au lieu du tirage aléatoire, et désactiver le filtre de déduplication (sinon on bloque inutilement le tout premier article).
   - Comportement par défaut (cron) inchangé.

3. **Déclencher la génération via `trigger-blog-article`**
   - Adapter `trigger-blog-article` pour transmettre le `topic` reçu à `generate-blog-article`.
   - Lancer un appel ciblé sur "scandale Perrier Vittel Nestlé Waters microfiltration UV 2025" en français, fenêtre temporelle élargie (mois) pour avoir des sources solides.

4. **Contrôle éditorial avant publication**
   - L'article est inséré en `status = 'published'` directement. Pour ce premier numéro on garde ce flux automatique, mais on relit l'article généré sur `/lettre-de-leau/{slug}` immédiatement après.
   - Si le contenu est imparfait (ton, structure, infographie manquante, sources faibles) : option 1 régénérer, option 2 corriger directement dans la table `blog_articles` via le tooling Supabase.

5. **Vérifications visuelles & SEO**
   - Vérifier : image de couverture présente, temps de lecture ≈ 7 min, infographie pertinente (ex. chronologie ou % de sites concernés), sources cliquables, métadonnées SEO renseignées, URL `lettre-de-leau/<slug>` propre.
   - Confirmer que l'article apparaît bien sur la home (`HomeBlogTeaser`) et dans le listing avec filtre catégorie "scandale".

### Détails techniques

- Patch minimal sur `generate-blog-article` :
  ```ts
  const { topic: forcedTopic } = await req.json().catch(() => ({}));
  const query = forcedTopic ?? queries[Math.floor(Math.random() * queries.length)];
  const skipDedupe = !!forcedTopic;
  ```
- Patch sur `trigger-blog-article` : forward `topic` au call interne.
- Aucune migration SQL nécessaire.
- Pas de changement front nécessaire — les pages `LettreEau.tsx` et `LettreEauArticle.tsx` afficheront l'article dès qu'il est en base.

### Risque principal
Crédits Lovable AI insuffisants → l'appel échouera à nouveau en 402. À régler avant toute action.
