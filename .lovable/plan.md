
# Pages SEO par commune

Objectif : générer une page dédiée pour chaque commune française afin de capter les requêtes du type « qualité de l'eau [ville] », « analyse eau potable [ville] », « eau du robinet [ville] ». Mot-clé principal : **qualité de l'eau dans ma commune** (KDI faible, forte intention locale).

## Route et URL

- Nouveau route : `/qualite-eau/:slug` où `slug = ville-codepostal` (ex. `/qualite-eau/paris-75000`).
- Redirection SEO propre : slug canonique unique par commune.
- Route ajoutée dans `src/App.tsx` (lazy).

## Contenu de la page (par commune)

Chaque page contient, dans cet ordre :

1. **H1** : « Qualité de l'eau à {Ville} ({code postal}) »
2. **Résumé chiffré** : score, dernière date de prélèvement, note A–E (via `useWaterQuality` déjà existant).
3. **Bloc « Analyse eau potable » ** : conformité microbiologique / physico-chimique, polluants détectés, dureté si dispo.
4. **Tableau des derniers prélèvements** (limite 10 lignes).
5. **Mini-carte** (composant existant `WaterQualityCard` ou `QualityMap` centré sur la commune).
6. **FAQ locale** (JSON-LD `FAQPage`) : 4 questions calibrées SEO :
   - « L'eau du robinet est-elle potable à {Ville} ? »
   - « Quelle est la dureté de l'eau à {Ville} ? »
   - « Y a-t-il des polluants dans l'eau de {Ville} ? »
   - « Où trouver le rapport officiel d'analyse de l'eau à {Ville} ? »
7. **Liens contextuels internes** : villes voisines de la même région + liens vers `/carte`, `/polluants`, `/prix-eaux`, `/gout-eau`.
8. **CTA** vers `/diagnostic` et `/quelle-eau-boire`.

## SEO technique

- `<SEOHead>` par page :
  - `title` : « Qualité de l'eau à {Ville} ({CP}) — Analyse et polluants | InfoEau.fr » (<60 char cible)
  - `description` : « Découvrez la qualité de l'eau du robinet à {Ville} : score, polluants, dureté, dernier prélèvement officiel. Analyse eau potable {Ville} mise à jour. »
  - `canonical` : `/qualite-eau/{slug}`
  - Schema.org : `Place` + `Dataset` + `FAQPage` + `BreadcrumbList`.
- Contenu généré **côté client** (SPA) mais visible aux crawlers JS (Googlebot). Note : les crawlers non-JS (LinkedIn, Facebook) ne verront que l'og:image générique — acceptable pour du SEO Google.

## Sitemap

- Étendre `scripts/generate-sitemap.ts` pour émettre une `<url>` par commune (35 villes principales dans `FRENCH_CITIES` en v1, extensible).
- `changefreq: monthly`, `priority: 0.7`.

## Navigation / maillage

- Ajouter un **index de communes** sur `/qualite-eau` (page hub) : liste alphabétique + regroupement par région → 1 clic vers chaque page.
- Ajouter le hub dans `InternalLinkHub.tsx` pour maillage depuis home / blog / catégories.

## Périmètre v1

- **35 communes** (celles déjà dans `src/data/frenchCities.ts`).
- Données via `useWaterQuality` (Hub'Eau, déjà en place).
- Pas de génération statique / SSR : rendu client-side, indexable par Googlebot.

## Fichiers touchés

```
src/pages/QualiteEauCommune.tsx      (nouveau — page commune)
src/pages/QualiteEauIndex.tsx        (nouveau — hub /qualite-eau)
src/utils/communeSlug.ts             (nouveau — slug ↔ commune)
src/App.tsx                          (routes)
src/components/Header.tsx            (lien vers /qualite-eau)
src/components/InternalLinkHub.tsx   (maillage)
scripts/generate-sitemap.ts          (ajout URLs communes)
```

## Extension future (hors v1, à valider avec toi)

- Passer de 35 à ~5 000 communes principales via un CSV INSEE.
- Pré-rendu statique (Vite SSG plugin) pour rendre les pages visibles aux crawlers sans JS.
- Traduire titres/FAQ dynamiquement selon `useWaterQuality` (ex. mention automatique du polluant dominant).

Confirme-moi (a) que tu valides ce périmètre v1 à 35 communes et (b) si tu veux que j'ajoute déjà un CSV plus large (par ex. les 500 plus grandes communes) — dans ce cas dis-moi si tu as un fichier source, sinon je pars sur une liste dérivée d'INSEE publique.
