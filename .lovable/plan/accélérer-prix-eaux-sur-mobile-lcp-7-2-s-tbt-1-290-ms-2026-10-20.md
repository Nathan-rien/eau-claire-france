# Accélérer /prix-eaux sur mobile (LCP 7,2 s, TBT 1 290 ms)

## Diagnostic (d'après le code, à confirmer par mesure)

**Confirmé par lecture du code :**
- La page HTML pré-générée existe pour les robots, mais au démarrage React **efface et redessine tout** (`createRoot`, pas d'hydratation). Le texte visible pré-généré ne compte donc pas pour l'utilisateur : rien de « définitif » ne s'affiche avant que tout le JavaScript soit téléchargé et exécuté.
- La page charge d'un coup **jusqu'à 500 prix** (`pageSize: 500`, `select *` + comptage exact), et les affiche **deux fois** (liste mobile et tableau desktop, l'un simplement masqué) : environ 1 000 blocs créés en une fois. C'est le candidat principal du TBT.
- Avant les prix, quatre appels sont faits **l'un après l'autre** (état des données, enseignes, marques, correspondance marque/enseigne), puis deux requêtes prix (dernier relevé, puis liste). Chaîne réseau longue avant l'affichage des résultats.
- Des éléments communs à tout le site se chargent dès le départ : chatbot Ondine, bandeau d'actualités, surveillance « sécurité », bannière cookies.

**Élément LCP probable (non mesuré) :** le grand encadré des résultats (« eau la moins chère » ou la liste de prix) qui n'apparaît qu'après la chaîne de requêtes ; à défaut, le titre H1, retardé par le JavaScript. L'étape 0 tranche.

**Bloc affilié et squelettes (point 4) :** ils ne sont probablement **pas** la cause. Le bloc Amazon est statique, sans image lourde, placé bas dans la page. Le squelette réserve la place mais peut, lui, devenir l'élément LCP « tardif » si son contenu final est plus grand ; à vérifier à l'étape 0. Le chargement de 500 lignes et les appels en chaîne sont antérieurs à ces ajouts.

## Plan priorisé

**0. Mesure de référence** (aucun changement)
Lighthouse mobile local + trace de performance sur /prix-eaux : élément LCP exact, tâches longues, taille du code de la page. Sert de point avant/après.

**1. Afficher moins de lignes au départ** — gain attendu le plus fort sur le TBT (estimé −50 à −70 %)
- Charger 50 prix d'abord, bouton « Voir plus » (le paramètre `pageSize` de l'adresse reste respecté).
- N'afficher qu'une seule des deux versions (mobile OU desktop) selon l'écran, au lieu des deux.
- Fichiers : `src/pages/PrixEaux.tsx`. Risque : faible ; le texte indexé (titre, intro, FAQ, liens marques) ne change pas. Rollback : remettre 500 et la double liste.

**2. Lancer les appels en parallèle** — gain LCP estimé 1 à 2 s
- Les quatre appels initiaux + la recherche du dernier relevé partent en même temps ; mise en cache courte (2 min, règle déjà en vigueur) pour les visites suivantes.
- Fichiers : `src/pages/PrixEaux.tsx`, `src/services/pricesApi.ts` (réutiliser le dernier relevé déjà connu). Risque : faible. Rollback : revenir à l'enchaînement.

**3. Retarder les éléments non essentiels** — gain TBT/LCP sur tout le site
- Chatbot Ondine et bandeau d'actualités chargés après l'affichage (temps libre du navigateur) ; surveillance sécurité différée.
- Fichiers : `src/App.tsx`. Risque : faible (apparaissent ~1 s plus tard). Rollback : imports directs.

**4. Alléger le code de la page** — gain moyen
- Charger à la demande les parties du bas de page (bloc affilié, liens marques/régions) quand on s'en approche, en gardant leurs liens présents dans la page pré-générée pour Google.
- Vérifier la taille du code partagé (icônes, composants d'interface) chargé par cette page.
- Fichiers : `src/pages/PrixEaux.tsx`. Risque : moyen pour le SEO si mal fait — contrôle obligatoire que liens et textes restent dans le HTML pré-généré. Rollback : imports directs.

**5. (Optionnel, plus lourd) Prix pré-calculés** — gain LCP fort
- Un résumé « moins cher par marque / dernier relevé » calculé une fois par jour après le relevé de 06:00, lu en une seule petite requête.
- Fichiers : nouvelle vue ou table + script quotidien existant. Risque : moyen (données à un jour). À valider séparément.

**Hors plan (risqué) :** remplacer `createRoot` par une vraie hydratation du HTML pré-généré — gain potentiellement le plus fort sur le LCP, mais touche tout le site ; à étudier dans un plan distinct.

## Vérification après chaque étape
Lighthouse mobile local avant/après, CLS toujours à 0, title/meta/H1/JSON-LD identiques, liens internes présents dans le HTML pré-généré, clic affilié toujours mesuré.

## Non mesurable depuis ma position
- Données réelles des visiteurs (CrUX) : quota PageSpeed épuisé ; les chiffres 38/100, 7,2 s et 1 290 ms sont les vôtres, non re-mesurés ici.
- Temps de réponse réel de Supabase et des fonctions depuis un mobile en France.
- Gains chiffrés : estimations, confirmées seulement à l'étape 0 puis après chaque correctif, et sur infoeau.fr qu'après publication.
