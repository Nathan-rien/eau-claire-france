# Deux correctifs : double comptage GA4 et colonne « Prix/L »

## 1) Double page_view au chargement

Constat vérifié dans `index.html` : `gtag('config','G-2DE2LT87EY',{ anonymize_ip: true })` (ligne 126) sans `send_page_view: false`, et `window.__loadGA()` charge le script après acceptation. `RouteTracker` envoie un `page_view` 350 ms après le premier rendu → deux page_view pour la page d'atterrissage.

### Correctif minimal retenu
Dans `RouteTracker.tsx`, ignorer le tout premier déclenchement via un `useRef(true)` : le page_view automatique de gtag couvre la page d'arrivée, RouteTracker ne couvre que les navigations suivantes.

Comportement par cas :
- **Consentement déjà accordé au chargement** : gtag compte la page d'arrivée, RouteTracker saute son premier envoi, puis compte chaque navigation. Exact, aucun doublon, aucune perte.
- **Consentement accordé après coup** (`__loadGA` déclenché par CookieConsent) : gtag se charge à ce moment et envoie un page_view pour la page *alors affichée*. Si l'utilisateur a déjà navigué avant d'accepter, les pages vues avant l'acceptation sont perdues — comportement voulu par le consentement, pas un bug. Aucun doublon, car le premier rendu de RouteTracker est déjà passé. Hypothèse : le composant reste monté toute la session (il est dans le Router, donc oui).
- **Consentement refusé** : `trackEvent` sort immédiatement (garde `cookie_consent === 'granted'`) et gtag n'est jamais chargé. Zéro envoi.

Cas limite assumé : acceptation des cookies sans changer de page → gtag envoie la page d'arrivée, correct. Acceptation pile pendant une navigation → léger décalage possible du titre de page (négligeable).

### Alternative (`send_page_view: false` + RouteTracker seul)
Plus robuste conceptuellement : une seule source de page_view, donc aucun risque de doublon si le chargement de gtag évolue. Risques : si RouteTracker n'est pas monté ou plante, on perd **tous** les page_view (aujourd'hui la page d'arrivée resterait comptée), et il faut aussi gérer l'envoi initial après `__loadGA` → plus de code. Recommandation : correctif minimal maintenant ; l'alternative n'apporte rien tant qu'un seul `config` existe.

**Fichier touché** : `src/components/analytics/RouteTracker.tsx` uniquement.
**Risque** : nul côté SEO/performance ; seul point à vérifier = une seule page vue à l'arrivée dans les rapports temps réel GA4.
**Rollback** : supprimer les 4 lignes du `useRef`.
**Rappel** : la mesure améliorée « modifications de l'historique du navigateur » doit rester désactivée dans GA4, sinon doublon sur chaque navigation (action de votre côté).

## 2) Colonne « Prix/L »

### a) Formulation « prix minimum »
- En-tête : « Prix/L dès » (FR) / « Price/L from » (EN), avec `title` + `aria-label` : « prix le plus bas relevé, toutes enseignes et formats confondus ».
- Valeur : « dès 0,14 €/L » (FR) / « from €0.14/L » (EN).
- Cellules sans donnée : inchangées (« non relevé »).
- Fichiers : `src/components/Ranking/RankingTableView.tsx`, `src/i18n/translations.ts`.

### b) La limite de 1000 lignes est-elle un risque ?
Vérifié en lecture seule : la table `prices` contient **118 115 lignes**, mais `getPrices` ne lit que le **dernier run** de `prices_history` → **521 lignes complètes, 20 marques**. Avec `limit: 1000`, aucune marque n'est tronquée aujourd'hui ; les 20 minima sont corrects.

Deux limites réelles, indépendantes de la pagination :
- `PRICED_BRAND_SLUGS` liste 21 marques ; le dernier run n'en couvre que 20 (**Saint-Amand** absent) → « non relevé » légitime, pas un bug de requête.
- Si un futur run dépasse 1000 lignes complètes, le tri par prix croissant protège les marques les moins chères, mais une marque chère pourrait tomber hors des 1000 premières lignes → faux « non relevé ». Hypothèse : le volume actuel (521) laisse de la marge, mais il croît avec le nombre d'enseignes scrapées.

**Correctif proposé (léger)** : dans `useBrandMinPrices.ts`, remplacer `getPrices` par une requête étroite sur `prices_history` du dernier run ne sélectionnant que `brand, price_per_l_eur` (au lieu de `*`) avec `limit: 5000`. Charge réseau plus faible qu'aujourd'hui, agrégation du minimum côté client inchangée, aucun CLS (largeur de colonne réservée, hydratation post-rendu).
Alternative plus solide mais plus lourde : vue/RPC `brand_min_price_per_l` renvoyant 20 lignes — nécessite une migration ; à faire seulement pour clore définitivement la question du volume.

**Fichiers touchés** : `src/hooks/useBrandMinPrices.ts`, `src/components/Ranking/RankingTableView.tsx`, `src/i18n/translations.ts`.
**Risques** : requête directe sur `prices_history` = même table et même RLS publique que `getPrices`, donc pas de nouveau risque. Aucun impact SEO ni LCP.
**Rollback** : revenir à l'appel `getPrices` et aux anciens libellés ; les deux points sont isolés.
