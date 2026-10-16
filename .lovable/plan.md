# Affiliation : suivi des clics sortants, puis placement sur /classement et /prix-eaux

## Constats vérifiés dans le code (à lire avant de valider)

- **/classement contient déjà de l'affiliation.** `src/pages/Classement.tsx` (l. 422-450) affiche `AffiliateComparisonTable` (catégorie `filtration`, avec `AffiliateDisclosure` intégrée) dans une section sous le classement, avant « À lire aussi », les marques et les régions. Il n'y a pas d'`AffiliateProductPick`, mais des liens Amazon sont déjà présents.
- **/prix-eaux n'a aucune affiliation.** Seul l'encadré vert « traiter l'eau du robinet » (l. 692-706) renvoie vers /traiter-eau-robinet, avant `BrandLinksSection` et `RegionLinksSection`.
- **Les produits ne correspondent pas aux marques du classement.** `affiliateProducts.ts` ne contient que 9 produits de filtration et de goût (carafes, filtres robinet, osmoseur, gourde, charbon, perles). Aucune eau en bouteille (Evian, Volvic, etc.). On ne peut donc pas associer un produit à un rang du classement, et une colonne « acheter » dans le tableau est impossible sans inventer de produits : je l'écarte.
- **Aucun lien Amazon n'est mesuré** aujourd'hui, ni dans `AffiliateProductPick` ni dans `AffiliateComparisonTable`. Tous les liens passent par `getAmazonUrl()`, en `rel="nofollow sponsored"`.
- `trackEvent` (`src/utils/ga.ts`) n'envoie rien sans `cookie_consent === 'granted'`. C'est la même garde que RouteTracker.

## Volet 1 : événement `affiliate_click` (à faire en premier)

**Fonctionnement**
- Nouvelle fonction `trackAffiliateClick(product, { placement, position })` dans `src/utils/ga.ts`. Elle passe par `trackEvent`, donc respecte le consentement.
- Paramètres envoyés :
  - `page_path` : page d'origine, sans l'URL Amazon et sans le tag ;
  - `product_slug` et `product_name` ;
  - `product_tier` : entrée, standard ou premium ;
  - `product_category` ;
  - `placement` : nom du bloc, par exemple `classement_comparatif`, `prix_eaux_picks`, `guide_nitrates`, `comparatif_filtres` ;
  - `position` : 1, 2, 3… dans le bloc affiché, après tri ;
  - `language`.
- Le rang dans le classement des eaux n'a pas de sens ici, puisque les produits ne sont pas liés aux eaux. La position est donc celle du produit dans son bloc.
- On écoute `onClick` sur le lien (sans `preventDefault`). Le lien s'ouvre dans un nouvel onglet, donc la page d'origine reste ouverte et l'envoi n'est pas perdu. On ajoute `transport_type: 'beacon'` par sécurité.
- Une nouvelle prop optionnelle `placement` sur `AffiliateProductPick` et `AffiliateComparisonTable`. Si elle manque, on utilise le chemin de la page.

**Fichiers touchés** : `src/utils/ga.ts`, `src/components/affiliate/AffiliateProductPick.tsx`, `src/components/affiliate/AffiliateComparisonTable.tsx`. Ajout optionnel de la prop `placement` dans `Classement.tsx`, `ComparatifFiltresEau.tsx` et les 4 guides. Diagnostic utilise déjà `AffiliateProductPick` : il est couvert automatiquement.

**Test** : un petit test Jest sur la fonction. Sans consentement, aucun appel à `gtag`. Avec consentement, un appel avec les bons paramètres.

**Risques**
- SEO, CLS et LCP : aucun, rien ne change à l'affichage.
- Accessibilité : aucune.
- Hypothèses :
  - Il faut déclarer les dimensions personnalisées (`placement`, `product_slug`, `position`) dans GA4 pour les voir dans les rapports. Je n'ai pas accès à GA4, ce réglage est de votre côté.
  - Les clics de visiteurs qui refusent les cookies ne sont pas comptés. Les volumes seront donc sous-estimés.

**Rollback** : retirer les `onClick`. La fonction peut rester sans effet.

## Volet 2 : placement

### /classement : réutiliser l'existant, ne rien ajouter dans le tableau
- **Option recommandée (A)** : garder le bloc `AffiliateComparisonTable` à sa place actuelle et seulement le mesurer (volet 1, `placement="classement_comparatif"`). Il ne touche ni le haut de page ni le tableau. Avec une semaine de données, on saura si le bloc convertit avant d'en ajouter un autre.
- **Option B, si vous voulez plus visible** : remplacer ce tableau par `AffiliateProductPick category="filtration"` (3 cartes, une par budget, plus lisibles sur mobile, qui fait 80 % des clics), au **même emplacement**. Pas d'ajout sous le top 3 : `RankingCrossLinks` y est déjà, et un bloc de plus repousserait le reste du classement, ce que vous voulez éviter.
- **Écarté** : une colonne dans le tableau ou un lien par rang. Aucun produit ne correspond à une eau, ce serait trompeur.
- Fichiers : `src/pages/Classement.tsx`, une ligne pour l'option A, un remplacement de composant pour l'option B.
- Risques :
  - CLS : nul. Le bloc est très en dessous du premier écran et s'affiche sans attendre de chargement (données statiques).
  - LCP : inchangé.
  - SEO : le title, le H1, la meta description et les données structurées ne bougent pas, et les liens restent en `nofollow sponsored`.

### /prix-eaux : nouveau bloc après les résultats
- Insérer `AffiliateProductPick category="filtration" placement="prix_eaux_picks"` juste après l'encadré vert « traiter l'eau du robinet » (l. 706), avant `BrandLinksSection`. C'est la suite logique de la comparaison « bouteille ou robinet » déjà présente sur la page. La mention d'affiliation est incluse, en tête du bloc.
- Pas de bloc dans la synthèse du haut (`CheapestWaterSummary`) ni dans la liste des prix : ce sont des contenus qui se chargent après coup, un ajout à côté créerait des décalages et ferait concurrence aux prix réels.
- Fichiers : `src/pages/PrixEaux.tsx` (import et insertion).
- Risques :
  - CLS : le bloc est placé sous une liste qui se charge après coup, il peut donc se déplacer quand elle arrive. Mais il est hors de l'écran au chargement, donc l'effet mesuré est probablement nul. C'est une hypothèse, à vérifier avec Playwright à 390 px.
  - SEO : du contenu commercial ajouté sur une page au CTR déjà faible (1,30 %). Pas d'effet attendu sur le classement Google, mais le texte du bloc doit rester factuel.
  - Accessibilité : le composant a déjà un `aria-label` et des boutons d'au moins 44 px.
  - Hypothèse : le bloc est en `px-4 container` alors que la page a son propre conteneur. Les marges devront peut-être être ajustées avec `className`, sans changer le composant.

### Commun aux deux pages
- Le tag `infoeau-PLACEHOLDER-21` reste tel quel : les clics seront mesurés, mais **aucune commission** ne sera perçue tant que le vrai tag ne l'aura pas remplacé.
- Aucun nouveau produit.
- Version anglaise (`/en/...`) : le composant est déjà bilingue, mais les liens vont vers amazon.fr. Je les laisse identiques en anglais (hypothèse à valider).

**Rollback** : retirer l'insertion sur /prix-eaux et, pour l'option B, remettre `AffiliateComparisonTable` sur /classement.

## Vérifications prévues
- Typage, build et test Jest de `trackAffiliateClick`.
- Playwright à 390 et 1280 px sur /classement et /prix-eaux :
  - le bloc est visible au bon endroit ;
  - pas de décalage avant le premier écran ;
  - avec consentement simulé, un clic Amazon envoie `affiliate_click` avec la page, le produit et la position ;
  - sans consentement, rien n'est envoyé.
- Non vérifiable par moi : les rapports GA4 (pas d'accès) et les Core Web Vitals réels en production (seulement après publication).

## Choix à faire avant de commencer
1. /classement : option A (on mesure l'existant) ou option B (3 cartes au même endroit) ?
2. /prix-eaux : d'accord pour l'emplacement après l'encadré vert ?
