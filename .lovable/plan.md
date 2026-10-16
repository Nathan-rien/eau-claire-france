# Plan : CLS /prix-eaux + page calculateur de consommation d'eau

## 1) Correctif CLS sur /prix-eaux

### Constat (lu dans le code)
Haut de page de `src/pages/PrixEaux.tsx`, dans l'ordre :
1. `CheapestWaterSummary` (`src/components/prices/CheapestWaterSummary.tsx`) : renvoie `null` tant que `loading` ou sans données (ligne 188), puis apparaît d'un coup avec sa carte de résultats → décale tout le contenu en dessous.
2. Encadré « sources » (statique, ne bouge pas).
3. `DataBanner` (`src/components/DataBanner.tsx`) : affiche un état de chargement (l. 87), puis `null` ou un bandeau de taille différente (l. 98/140) → hauteur qui change.
4. `DataWarmupBanner` : rendu conditionnel (`showDataBanner`, défini après les stats) + son propre état de chargement puis `null`.
5. Zone liste : `common.loading` en texte simple (l. 520), remplacé par le tableau.

Hypothèse non confirmée : la répartition exacte du 0,54 entre ces éléments. Première étape = mesurer les `layout-shift` (PerformanceObserver via Playwright) à 390 et 1280 px pour attribuer chaque décalage à son élément, avant de modifier.

### Correctif proposé
- `CheapestWaterSummary` : pendant le chargement, rendre un squelette de même structure (titre + cartes `Skeleton`) avec un `min-height` égal à la hauteur réelle mesurée (mobile / desktop via classes `min-h-[...] md:min-h-[...]`). Sans données après chargement : garder un message court « aucune donnée » dans le même espace réservé plutôt que `null` (conforme à la règle « aucune donnée » au lieu de mocks).
- `DataBanner` : état de chargement aux mêmes dimensions que le bandeau final ; si le bandeau final est `null`, ne rien afficher dès le départ quand c'est prévisible, sinon conteneur à hauteur réservée.
- `DataWarmupBanner` : ne plus afficher son état de chargement intermédiaire (rendre `null` jusqu'à décision), car il apparaît rarement ; à valider par la mesure.
- Zone liste : squelette de lignes de tableau avec `min-height` au lieu du texte « Chargement ».
- Aucun changement au contenu, au H1, au title, aux données structurées ni au bloc affiliation.

### Vérification
Script Playwright mesurant le CLS cumulé sur /prix-eaux uniquement, avant/après, à 390 px et 1280 px (3 chargements chacun, cache vide). Objectif < 0,1. Typage et build.

### Fichiers
`CheapestWaterSummary.tsx`, `DataBanner.tsx`, `DataWarmupBanner.tsx`, `PrixEaux.tsx` (zone liste uniquement).

### Risques
- SEO : nul (texte identique). Le prerendering capturera le squelette au lieu de rien : neutre.
- LCP : léger gain possible (espace stable). Risque : un `min-height` trop grand laisse un vide si la donnée est plus courte.
- Accessibilité : squelettes marqués `aria-hidden`, conteneur `aria-busy` pendant le chargement.
- `DataBanner` est aussi utilisé ailleurs ? À vérifier en début de build ; si oui, la réservation d'espace passera par une prop pour ne pas changer les autres pages.

### Rollback
Revenir aux quatre fichiers ; aucune donnée ni route touchée.

---

## 2) Page dédiée : calculateur de consommation d'eau du foyer

### Identification (vérifiée)
- Calculateur de la page Finistère : `CrisisWaterCalculator` (`src/components/CrisisWaterCalculator.tsx`), modèle pur `src/lib/crisisWaterModel.ts`, tests `src/components/__tests__/crisisWaterCalculator.test.ts`.
- Différent de `/calculateur-hydratation` (`CalculateurHydratation.tsx`, quantité d'eau à boire).
- Entrées : aucune prop ; état local (personnes, douches, durée, bains, chasses, type de chasse, lessives, vaisselle, mode habitudes/compteur, relevés compteur). Sorties : estimation L/pers/jour (fourchette), leviers d'économie, texte à copier, événements GA4.

### Dépendances à la crise Finistère (à rendre génériques)
- Constantes `FINISTERE_AVG = 112` et `TARGET = 56` (source ICI) et barres de comparaison « moyenne du Finistère » / « objectif Nord-Finistère ».
- Phrases d'objectif (« ces gestes ne suffisent pas à atteindre 56 L »), texte de partage mentionnant le Nord-Finistère, `SHARE_URL` pointant vers l'article.
- `resultBucket` basé sur 56/112.
- Événements `crisis_calc_*`.
- Textes FR en dur (pas d'EN).

Proposition : ajouter une prop `context?: 'finistere' | 'generic'` (défaut `finistere`, comportement actuel inchangé). En mode `generic` : pas de barres Finistère, pas d'objectif ; affichage de la fourchette, du volume foyer par jour/an (m³) et des leviers ; texte de partage et URL vers la nouvelle page ; événements `water_calc_*` (ou même nom avec paramètre `context`, à choisir). Le modèle de calcul reste identique (valeurs de contrôle inchangées) ; tests complétés pour le mode générique.

Donnée absente : une référence nationale de consommation par personne. Je n'en ajoute aucune sans source que vous fournissez ; sinon aucune comparaison n'est affichée.

### Page proposée
- URL FR : `/calculateur-consommation-eau` ; EN : `/en/calculateur-consommation-eau` (pattern actuel : même slug préfixé `/en`).
- Title FR : « Calculateur de consommation d'eau du foyer (litres par jour) » ; meta : « Estimez en 2 minutes la consommation d'eau de votre foyer : douches, chasses, lessives, vaisselle. Gestes pour la réduire, mesure au compteur. »
- Title EN : « Household water usage calculator (litres per day) » + meta équivalente.
- H1 FR : « Calculer la consommation d'eau de son foyer ».
- Intro (3 courts paragraphes) : budget/facture, restrictions sécheresse, sensibilisation ; mention « estimation indicative, hors jardin, voiture, piscine et fuites ».
- Le calculateur (mode `generic`).
- FAQ (4 questions, FAQPage) : comment lire son compteur ; pourquoi l'estimation diffère de la facture ; quels gestes économisent le plus (renvoi vers les leviers du calculateur) ; mes données sont-elles enregistrées (non). Réponses sans chiffre non sourcé.
- Schémas : `WebApplication` ou `Article` (selon pattern existant des guides), `FAQPage`, `BreadcrumbList` (Accueil → Calculateur), via `SEOHead` qui accepte un tableau.

### Maillage
- Page Finistère : garder le calculateur intégré (contexte crise, objectif 56 L utile localement) et ajouter sous le calculateur un lien « Version générale du calculateur, valable partout en France ». Option alternative : remplacer l'inclusion par un lien ; déconseillé car le teaser de l'accueil pointe vers `#calculateur`.
- Sortants depuis la nouvelle page : `/traiter-eau-robinet` (pertinent pour l'eau du robinet) et `/qualite-eau` ; `/diagnostic` non retenu (sujet différent : choix d'eau à boire).
- Entrant supplémentaire possible : lien depuis `/calculateur-hydratation` (« vous cherchez votre consommation domestique ? ») — à confirmer.

### Symétrie FR/EN
- Route FR + EN dans `src/App.tsx` (lazy), ajout à `INTERNATIONAL_PATHS` (`src/lib/i18nRoutes.ts`) pour hreflang et sitemap bilingue, entrée dans `scripts/routes.ts`, régénération de `public/sitemap.xml`, prerendering.
- Textes : la page et le mode générique ont besoin de textes EN. Deux options : (a) clés dans `src/i18n/translations.ts` (pattern du site), (b) dictionnaire FR/EN local au composant. Je propose (a) pour la page et (b) pour le calculateur, afin de ne pas toucher les textes de crise. À valider.
- `public/llms.txt` : ajout d'une ligne pour la nouvelle page.

### Fichiers
Nouveau `src/pages/CalculateurConsommationEau.tsx` ; modifiés `CrisisWaterCalculator.tsx`, `crisisWaterModel.ts` (si besoin, sans changer les calculs), test associé, `App.tsx`, `i18nRoutes.ts`, `scripts/routes.ts`, `public/sitemap.xml`, `src/i18n/translations.ts`, `CriseEauFinistere.tsx` (un lien), `public/llms.txt`, éventuellement `src/utils/seoData.ts`.

### Risques
- SEO : cannibalisation faible avec l'article (intentions différentes) ; la page doit être prerendue pour être indexée.
- CLS/LCP : calculateur sans données distantes, faible risque.
- Accessibilité : reprise des libellés et `aria-valuetext` existants ; cibles ≥ 44 px.
- Régression page Finistère : protégée par le défaut `context='finistere'` et les tests existants.

### Rollback
Retirer la route, l'entrée sitemap/INTERNATIONAL_PATHS et le lien ; la prop `context` est sans effet en défaut.

---

## Questions ouvertes
1. Nommage des événements : nouveaux `water_calc_*` ou `crisis_calc_*` + paramètre `context` ?
2. Avez-vous une référence nationale sourcée (L/pers/jour) à afficher en comparaison ? Sinon aucune.
3. Ajouter le lien depuis `/calculateur-hydratation` ?
