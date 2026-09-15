# Plan d'action SEO — priorisé par impact / effort

Basé sur le diagnostic Search Console du 15/09. Rien n'est codé avant validation.

## Constat technique préalable (vérifié dans le code)

Le sélecteur de langue existe déjà dans l'en-tête (menu déroulant FR/EN), mais il fonctionne par navigation JavaScript : Google ne voit **aucun lien** vers les pages anglaises. C'est la cause principale du problème de maillage, pas l'absence de sélecteur.
La page classement est déjà largement traduisible (textes passant par le système de traduction), mais elle n'est pas déclarée comme page bilingue, donc `/en/classement` n'existe pas.

---

## Priorité 1 — Rendre les pages anglaises réellement liées (impact fort / effort faible)

**Quoi**
- Transformer le sélecteur de langue en vrais liens cliquables (balises `<a>`) vers l'URL équivalente dans l'autre langue, avec l'attribut de langue correspondant, tout en gardant l'apparence actuelle.
- Ajouter dans le pied de page un lien texte permanent « English version » vers l'équivalent anglais de la page courante.

**Fichiers concernés** : `src/components/Header.tsx` (sélecteur ligne ~296), `src/components/Footer.tsx`, `src/lib/i18nRoutes.ts` (helper existant `localizePath`), `src/components/LocalizedLink.tsx`.

**Effort** : faible (1 passe, ~1 h).
**Impact attendu** : chaque page anglaise gagne un lien depuis sa jumelle française, y compris depuis les pages à fort trafic. C'est le signal qui manque pour que Google arrête de fusionner `/en/traiter-eau-robinet` avec la version française.

---

## Priorité 2 — Version anglaise du classement (impact fort / effort moyen)

La page classement représente 84 % du trafic, sur des recherches (« meilleure eau en bouteille », « classement eaux minérales ») qui ont un équivalent international évident (« best bottled water », « bottled water comparison »).

**À créer / traduire concrètement**
1. Déclarer `/classement` comme page bilingue → génère `/en/classement`, les liens de langue et l'entrée au plan du site. Fichier : `src/lib/i18nRoutes.ts` (liste `INTERNATIONAL_PATHS`), `scripts/routes.ts`.
2. Métadonnées anglaises dédiées (titre, description, mots-clés) : `src/utils/seoData.ts` — aujourd'hui la page utilise un bloc unique en français.
3. Compléter les traductions anglaises manquantes : `src/i18n/translations.ts` — vérifier chaque clé `ranking.*` côté anglais, plus les libellés des filtres, des profils de santé, des critères de notation et des cartes de résultat.
4. Traduire les textes encore écrits en dur dans les composants : `src/pages/Classement.tsx`, `src/components/Ranking/RankingFilters.tsx`, `RankingProfileSelector.tsx`, `BottleRankingCard.tsx`, `RankingTableView.tsx`, `ProfileRecommendationCard.tsx`.
5. Adapter les explications réglementaires : la version anglaise doit citer la directive européenne plutôt que l'ANSES seule, sinon la page paraît hors sujet pour un lecteur non français.
6. Regénérer plan du site et pages statiques (`scripts/generate-sitemap.ts`, `scripts/prerender.ts`).

**Effort** : moyen (une demi-journée, surtout de la relecture de traductions).
**Impact attendu** : c'est le seul actif du site qui a une vraie audience internationale potentielle. Sans cela, la couche anglaise n'a aucune page forte.

---

## Priorité 3 — Recentrer la page des prix sur les recherches larges (impact moyen / effort moyen)

Constat : les recherches « marque + enseigne + prix » (cristaline leclerc, mont roucous leclerc…) reculent de 2 positions en moyenne, face aux sites d'enseignes et à Google Shopping — bataille difficile à gagner. En revanche « eau la moins chère », « comparaison prix eau en bouteille », « prix eau bouteille » sont en position 1 à 6 avec un très bon taux de clic.

**Changements concrets**
1. Réponse immédiate en haut de page : un encadré « L'eau la moins chère aujourd'hui » avec les 3 eaux au prix au litre le plus bas, la date du relevé et l'enseigne — visible sans défiler, avant les filtres.
2. Un tableau de synthèse « prix moyen au litre par type d'eau » (eau de source, minérale plate, gazeuse, marque distributeur) : c'est ce que cherchent les requêtes larges, aujourd'hui absent.
3. Une section « Combien coûte l'eau en bouteille par an ? » comparant au robinet, avec lien vers le comparatif bouteille/filtration (utile aussi pour l'affiliation).
4. Trois à quatre questions/réponses structurées : « Quelle est l'eau la moins chère ? », « Quelle enseigne vend l'eau le moins cher ? », « Combien coûte un pack d'eau ? », balisées pour affichage enrichi Google.
5. Titre et description retravaillés autour de « eau la moins chère » plutôt que de l'angle enseigne.
6. Garder les pages marque telles quelles (elles captent le résiduel), mais renforcer leurs liens depuis l'annuaire des marques.

**Fichiers concernés** : `src/pages/PrixEaux.tsx`, `src/utils/seoData.ts`, `src/i18n/translations.ts`, `src/hooks/usePricesData.ts` (agrégats moyens par type), éventuellement `src/components/PriceDisplay.tsx`.

**Effort** : moyen (une demi-journée).
**Impact attendu** : récupération partielle des clics perdus, sur des recherches durables et non concurrencées par les enseignes.

---

## Priorité 4 — Europe : maintien, sans investissement (recommandation : ne pas investir)

Chiffres 28 jours : carte Europe 39 clics (1 241 vues, position 8,5), classement Europe 25 clics (434 vues), composition Europe 2 clics. Les pages polluants, diagnostic et prix Europe : 0 vue. Les recherches associées plafonnent à quelques dizaines de vues par mois. Aucun problème d'indexation.

**Recommandation** : ne pas investir en contenu. Deux actions à coût quasi nul seulement :
- Améliorer titre et description de la carte Europe et du classement Europe (1 241 et 434 vues déjà acquises, taux de clic à 3 et 6 % : un meilleur intitulé peut doubler les clics sans nouveau contenu). Fichier : `src/utils/seoData.ts`.
- Laisser les trois pages sans audience en place (elles ne coûtent rien) sans y ajouter de contenu.

**Effort** : très faible (30 min).
**Impact attendu** : quelques dizaines de clics, pas plus. Le potentiel est 100 fois inférieur à celui du classement français.

---

## Ordre d'exécution proposé

1. Liens de langue cliquables (P1)
2. Version anglaise du classement (P2)
3. Refonte du contenu de la page des prix (P3)
4. Retouche des intitulés Europe (P4)

Après les étapes 1 et 2, prévoir une regénération du plan du site et une publication, puis une nouvelle inspection d'URL sur `/en/classement` et `/en/traiter-eau-robinet` dans 2 à 3 semaines pour vérifier que Google ne fusionne plus les pages anglaises.
