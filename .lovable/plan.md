
Objectif: remettre le site publié en ligne immédiatement, sans perdre le travail SEO utile.

Constats tirés du code
- Le site publié est bien public, donc ce n’est pas un problème de visibilité/publish privé.
- Les changements SEO purs (`sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`) ne peuvent pas à eux seuls provoquer un écran blanc.
- Le point le plus risqué est le couple :
  - `index.html` : ajout de scripts Amplitude externes + inline
  - `src/components/SecurityHeaders.tsx` : CSP de production très stricte
- Le site n’utilise pas encore `ErrorBoundary` au point d’entrée, donc la moindre erreur runtime peut donner un écran blanc sans filet.

Plan de correction
1. Sécuriser le rendu en priorité
- Brancher `ErrorBoundary` dans `src/main.tsx` autour de `<App />`
- Ainsi, même en cas d’erreur runtime, le site n’affichera plus une page blanche totale

2. Corriger la cause probable production-only
- Revoir `src/components/SecurityHeaders.tsx`
- Deux options sûres :
  - soit assouplir la CSP pour autoriser correctement Amplitude et les scripts inline nécessaires
  - soit, plus fiable pour un hotfix, désactiver temporairement la meta CSP injectée côté client en production
- C’est la correction la plus probable pour le blanc sur la version publiée

3. Réduire le risque dans `index.html`
- Retirer temporairement le bootstrap Amplitude ajouté récemment, ou le remettre en place de façon compatible avec la CSP
- Conserver les balises SEO et les JSON-LD, qui sont utiles pour Google/IA
- Garder la structure SEO, mais enlever ce qui peut casser le runtime

4. Forcer un nouveau déploiement frontend
- Comme vous ne pouvez pas republier “sans nouveauté”, ce hotfix créera une vraie modification frontend
- Cela débloquera le bouton “Update/Publish” avec un correctif utile, pas un faux changement

5. Préserver le SEO déjà ajouté
- Garder :
  - `public/sitemap.xml`
  - `public/robots.txt`
  - `public/llms.txt`
  - `public/llms-full.txt`
  - la route `/diagnostic-prix` si elle est voulue
- Ne revenir en arrière que sur les éléments pouvant casser l’exécution du site

6. Plan B si le site reste blanc après hotfix
- Restaurer la dernière version fonctionnelle via History
- Puis réappliquer uniquement les fichiers SEO “sans risque” en second temps
- Réintroduire ensuite analytics/CSP proprement dans une étape séparée

Fichiers à toucher
- `src/main.tsx`
- `src/components/SecurityHeaders.tsx`
- `index.html`
- éventuellement `src/App.tsx` seulement si on décide de différer `/diagnostic-prix`

Vérifications après correction
- La home publiée se charge normalement
- Plus d’écran blanc sur `https://infoeau.lovable.app`
- Pas d’erreur fatale CSP/script au chargement
- `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt` restent accessibles
- La route `/diagnostic-prix` fonctionne si elle est conservée

Détail technique
- Suspicion principale : incompatibilité entre la CSP de production et les scripts ajoutés dans `index.html`
- Symptôme attendu d’une telle casse : preview/dev peut sembler OK, mais la version publiée tombe en erreur au runtime
- L’ajout d’un `ErrorBoundary` est important pour éviter qu’un futur incident SEO/analytics/head ne transforme encore le site en écran blanc
