## Objectif

Transférer toute l'autorité SEO de `/comparatif-bouteilles` vers `/classement` (page plus aboutie) et optimiser le référencement pour moteurs de recherche **et** moteurs IA (ChatGPT, Perplexity, Gemini).

## 1. Redirection 301 SEO

`/comparatif-bouteilles` → `/classement` (permanente).

- **`src/App.tsx`** : remplacer la route actuelle par `<Route path="/comparatif-bouteilles" element={<Navigate to="/classement" replace />} />`. La page `ComparatifBouteilles.tsx` est conservée comme composant (pour `/bouteilles` ou usage interne) mais n'est plus routée publiquement — à supprimer du lazy-import si totalement orpheline.
- **`index.html`** : remplacer le `BreadcrumbList` item "Comparatif bouteilles" par "Classement des eaux" pointant vers `/classement`.
- **`public/sitemap.xml`** : supprimer l'entrée `/comparatif-bouteilles` (laisser uniquement `/classement` qui existe déjà).
- **`public/robots.txt`** : ajouter une directive pour ne pas réindexer l'ancienne URL si nécessaire (optionnel, le 301 SPA suffit).
- **`public/llms.txt` / `llms-full.txt`** : remplacer toute mention de `/comparatif-bouteilles` par `/classement`.
- **`src/utils/seoData.ts`** : faire pointer `comparatifBouteilles.canonical` vers `/classement` (au cas où le composant resterait monté ailleurs), ou supprimer la clé.

> Note technique : Lovable n'a pas de redirection 301 serveur. Le `<Navigate replace>` côté React + le retrait du sitemap + canonical unique sur `/classement` est la meilleure approche SPA. Google traitera cela comme un soft-redirect et consolidera l'autorité dans les semaines suivantes.

## 2. Refonte SEO de `/classement`

Mise à jour de `src/utils/seoData.ts` clé `classement` pour reprendre **et amplifier** les mots-clés qui faisaient ranker `/comparatif-bouteilles` ("comparateur eau", "comparer eaux bouteille", "composition", "prix"), tout en valorisant la fonction de classement.

### Title (≤ 60 car.)
`Comparateur & classement des eaux en bouteille | InfoEau`

### Meta description (≤ 160 car.)
`Comparez et classez +50 eaux en bouteille selon votre profil santé : composition minérale, prix, nitrates, sodium. Trouvez la meilleure eau pour vous.`

### Keywords
`comparateur eaux bouteille, classement eaux minérales, meilleure eau bouteille, comparer Evian Contrex Hépar, composition minérale eau, score eau santé, prix eau minérale`

### Canonical
`https://infoeau.fr/classement`

### Schema.org enrichi (JSON-LD multiple)

1. **WebPage** (existant, conservé)
2. **ItemList** — top 10 du classement général (nom marque + position), permet aux IA et Google de citer le classement directement
3. **FAQPage** — 4–6 Q/R extraites du contenu : *"Quelle est la meilleure eau en bouteille ?"*, *"Quelle eau boire au quotidien ?"*, *"Quelle eau pour bébé ?"*, *"Comment est calculé le score ?"*, *"Quelle eau a le moins de nitrates ?"*
4. **BreadcrumbList** — Accueil › Eaux en bouteille › Classement

## 3. Optimisation pour IA (GEO — Generative Engine Optimization)

- **`public/llms.txt`** : ajouter section dédiée `## Classement des eaux en bouteille` avec lien `/classement` et résumé factuel en 3-4 lignes (nb d'eaux comparées, critères, profils disponibles).
- **`public/llms-full.txt`** : injecter un bloc descriptif complet avec exemples de top eaux par profil (ce que les LLMs aiment citer).
- **Contenu on-page** (`src/pages/Classement.tsx`) : ajouter un bloc texte SEO court mais sémantiquement riche sous le H1 (≈ 80–120 mots) listant explicitement : *« Comparateur d'eaux Evian, Contrex, Hépar, Volvic, Mont Roucous, Badoit, Vittel, Cristaline… selon X profils santé »*. Les IA pondèrent fortement le texte explicite vs. les composants interactifs.
- **H1 actuel conservé** mais ajout d'un H2 caché à l'œil mais sémantique : `<h2>Comparateur des meilleures eaux minérales en bouteille en France</h2>` (visible ou en lead paragraph — à préférer visible).

## 4. Liens internes

- Vérifier `Header`, `Footer`, `Index.tsx` : tout lien vers `/comparatif-bouteilles` → `/classement`.
- Ajouter un lien depuis `/bouteilles`, `/quelle-eau-boire`, `/parcours-eau-bouteille` vers `/classement` avec ancre descriptive (« Voir le classement complet des eaux en bouteille »).

## Récapitulatif fichiers modifiés

```text
src/App.tsx                       — route /comparatif-bouteilles → Navigate
src/utils/seoData.ts              — refonte classement, retrait comparatifBouteilles
src/pages/Classement.tsx          — bloc SEO sous H1, JSON-LD ItemList + FAQPage
index.html                        — BreadcrumbList mis à jour
public/sitemap.xml                — retrait /comparatif-bouteilles
public/llms.txt + llms-full.txt   — pointage vers /classement
src/components/Header.tsx, Footer.tsx, pages liées — liens internes
```

## Validation

- Vérifier qu'aucun lien interne ne pointe encore vers `/comparatif-bouteilles` (`rg`).
- Vérifier que `/comparatif-bouteilles` redirige bien vers `/classement` en preview.
- Valider le JSON-LD avec Rich Results Test (mental — pas d'outil ici).
- Vérifier le canonical unique sur `/classement`.