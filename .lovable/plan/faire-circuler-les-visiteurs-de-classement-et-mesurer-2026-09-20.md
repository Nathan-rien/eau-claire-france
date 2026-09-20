# Faire circuler les visiteurs de /classement (et mesurer)

Objectif : envoyer une partie des ~13 400 visites mensuelles de /classement vers /prix-eaux, /quelle-eau-boire et /marque/:slug, et mesurer ce passage — sans toucher au H1, au title, à la meta description, aux données structurées, ni au contenu au-dessus de la ligne de flottaison.

## Ce que j'ai vérifié dans le projet

- /classement ne contient aujourd'hui que : tableau comparatif filtres, appel « traiter l'eau », BrandLinksSection (21 marques), RegionLinksSection.
- Le prix au litre **existe** en base (`prices.price_per_l_eur`, exploité par `getPrices` et par l'encadré de /prix-eaux). Il est disponible **par marque commercialisée** (21 marques dans `pricedBrands.ts`), alors que le classement compte beaucoup plus d'eaux. Conséquence : le prix ne pourra s'afficher que sur une partie des lignes ; les autres resteront vides (pas de « — » trompeur, cellule vide + libellé « non relevé »).
- GA4 est chargé via `index.html` (G-2DE2LT87EY) avec Consent Mode v2 : tout est refusé par défaut, le script GA n'est chargé qu'après acceptation (`CookieConsent.tsx`). Un helper d'événements existe déjà : `src/utils/ga.ts` (`trackEvent`), utilisé sur 4 composants seulement.
- **Aucun page_view n'est envoyé au changement de route** : `App.tsx` monte `BrowserRouter` sans écouteur de navigation. La mesure améliorée GA4 « modifications de l'historique du navigateur » couvre en pratique les navigations React Router, mais elle relève le titre de page avant que Helmet ne l'ait mis à jour → titres faux dans les rapports. Hypothèse à confirmer côté GA4 (l'option est activable/désactivable dans l'interface, je ne peux pas la lire depuis ici).

## 1) Maillage interne sur /classement

**a. Encadré CTA sous le podium** (après le bloc « Podium », avant la liste restante)
- Nouveau composant `src/components/Ranking/RankingCrossLinks.tsx` : deux liens forts côte à côte (desktop) / empilés (mobile) — « Voir les prix au litre » → /prix-eaux, « Quelle eau boire selon mon profil » → /quelle-eau-boire.
- Hauteur fixe, pas d'image, pas de chargement de données → aucun impact CLS/LCP (le bloc est sous le podium, donc hors LCP sur mobile).

**b. Prix au litre dans le tableau**
- `RankingTableView.tsx` : une colonne « Prix/L » supplémentaire, valeur = prix minimum relevé pour la marque, avec lien vers `/marque/:slug` uniquement si le slug est dans `PRICED_BRAND_SLUGS`.
- Données : nouveau hook `src/hooks/useBrandMinPrices.ts` (une requête agrégée sur la dernière campagne de relevés, mise en cache, chargée **après** le rendu du tableau → la colonne s'hydrate sans décaler la mise en page car sa largeur est réservée).
- Limite assumée : seules les ~21 marques relevées auront un prix. Si vous voulez couvrir plus de marques, il faut élargir le scraping — hors périmètre ici.
- Le nom de la marque dans la colonne « Eau » devient également un lien vers /marque/:slug (même condition), ce qui profite aussi à la vue cartes plus tard si souhaité.

**c. Bloc « À lire aussi » en bas de page**
- Composant `src/components/Ranking/AlsoReadSection.tsx`, inséré au-dessus de `BrandLinksSection` : 4 à 6 liens éditorialisés (prix, quelle eau boire, dureté, goût, marques). Liens `<a>` réels via `LocalizedLink`.

**d. Barre d'action mobile discrète**
- Dans `Classement.tsx` : barre fine en bas d'écran (`md:hidden`), deux liens « Prix au litre » / « Quelle eau boire », affichée seulement après un défilement d'environ un écran, masquée dès que la barre de comparaison existante est visible pour éviter la superposition.
- Pas de pop-up, pas d'interstitiel, fermable, hauteur ≤ 48 px, cibles tactiles ≥ 44 px.

**Fichiers touchés** : `src/pages/Classement.tsx`, `src/components/Ranking/RankingTableView.tsx`, nouveaux `RankingCrossLinks.tsx`, `AlsoReadSection.tsx`, `MobileActionBar.tsx`, `src/hooks/useBrandMinPrices.ts`, traductions FR/EN dans `LanguageContext`.

**Risques**
- SEO : ajout de liens internes sortants uniquement ; H1, title, meta, JSON-LD inchangés. Risque faible. Le seul vrai risque serait une baisse d'engagement si la barre mobile gêne — d'où l'apparition différée et la fermeture.
- Performance : une requête prix supplémentaire, non bloquante, déclenchée après le premier rendu. LCP inchangé (tout est sous le podium). Largeur de colonne réservée → pas de CLS.
- Accessibilité : `aria-label` sur la fermeture de la barre, contraste conforme, navigation clavier sur les liens de tableau.

**Rollback** : retirer les trois insertions de `Classement.tsx` et la colonne du tableau (chaque élément est un composant isolé, aucun état partagé) ; les nouveaux fichiers peuvent rester inertes.

## 2) Suivi d'engagement GA4

- `src/utils/ga.ts` : conserver `trackEvent`, ajouter une garde consentement (ne rien envoyer si `cookie_consent !== 'granted'`) — aujourd'hui les appels sont silencieusement perdus, ce qui est correct mais non explicite.
- Événements posés (noms GA4 personnalisés, paramètres minimaux) :
  - `ranking_brand_click` (marque, rang, profil)
  - `ranking_sort` (colonne, sens)
  - `ranking_filter` (nom du filtre)
  - `ranking_cta_click` (destination : prix-eaux | quelle-eau-boire ; emplacement : podium | bas de page | barre mobile)
  - `outbound_click` sur les liens affiliés (marchand, produit)
- **Correctif page_view** : nouveau composant `src/components/analytics/RouteTracker.tsx` monté dans `BrowserRouter`, qui envoie un `page_view` explicite (`page_path`, `page_location`, `page_title`) à chaque changement de route, après un court délai laissant Helmet écrire le titre. À combiner avec la désactivation de la mesure améliorée « modifications de l'historique du navigateur » dans l'interface GA4, sinon chaque navigation compte double — action de votre côté, je ne peux pas la faire.
- Marquer les 5 événements comme « événements clés » n'est pas nécessaire ; en revanche il faudra créer les dimensions personnalisées (destination, emplacement, profil) dans GA4 pour les voir dans les rapports — action manuelle.

**Fichiers touchés** : `src/utils/ga.ts`, `src/App.tsx` (montage du tracker), `Classement.tsx`, `RankingTableView.tsx`, `RankingFilters.tsx`, nouveaux `RouteTracker.tsx`.

**Risques** : double comptage si la mesure améliorée reste active (visible immédiatement dans les rapports temps réel) ; aucun risque SEO ni CLS. Rollback : retirer le montage de `RouteTracker` et les appels `trackEvent`.

## 3) Comparer avant / après sur une semaine

Base de comparaison indisponible aujourd'hui : aucun événement de clic n'existe et aucun page_view de navigation n'est fiable, donc **il n'y a pas d'historique à comparer**. Le protocole réaliste :

1. Semaine 0 (avant tout ajout de liens) : déployer uniquement le point 2 (mesure), laisser tourner 7 jours pleins → référence « taux de passage » = sessions ayant vu /classement puis une autre page / sessions entrées sur /classement, via l'exploration GA4 « chemin » ou le rapport Pages et écrans.
2. Semaine 1 : déployer le point 1 (liens), même fenêtre de 7 jours, même segment (mobile / bureau séparés puisque 73 % mobile).
3. Indicateurs suivis : pages par session sur les sessions entrées par /classement, nombre de `ranking_cta_click`, nombre de `ranking_brand_click`, sessions /prix-eaux et /quelle-eau-boire dont la page précédente est /classement.
4. Contrôle SEO en parallèle : position moyenne et CTR de /classement dans Search Console sur les mêmes 7 jours vs les 7 précédents. Si le CTR baisse de plus de 0,5 point sans explication de position, rollback du point 1.

Ce découpage en deux semaines est la seule façon d'obtenir un avant/après propre ; si vous préférez tout déployer d'un coup, la comparaison ne sera qu'indicative.

## Hypothèses et dépendances explicites

- Hypothèse : la mesure améliorée « historique du navigateur » est active dans GA4 (valeur par défaut) — à confirmer dans l'interface.
- Dépendance : prix au litre disponible pour ~21 marques seulement ; les autres lignes resteront sans prix.
- Dépendance : création des dimensions personnalisées GA4 de votre côté pour exploiter les paramètres d'événements.
- Les visiteurs ayant refusé les cookies ne seront pas mesurés — les volumes GA4 resteront donc inférieurs à la réalité.
