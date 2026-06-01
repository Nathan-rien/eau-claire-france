# Corriger la mise en page des articles "Lettre de l'eau"

## Diagnostic

Le composant `LettreEauArticle.tsx` utilise déjà des classes `prose prose-lg prose-h2:mt-12 prose-p:my-5 …` pour styliser titres, paragraphes et espacements. Ces classes proviennent du plugin `@tailwindcss/typography`.

Le paquet est bien installé (`package.json` → `@tailwindcss/typography: ^0.5.15`), **mais il n'est pas enregistré** dans `tailwind.config.ts` :

```ts
plugins: [require("tailwindcss-animate")],   // ← typography manquant
```

Résultat : toutes les classes `prose-*` sont ignorées, ce qui explique le rendu "tout collé" du screenshot (H2 sans marge au-dessus, paragraphes sans espace, line-height par défaut).

## Changement

Un seul fichier à modifier : `tailwind.config.ts`

```ts
plugins: [
  require("tailwindcss-animate"),
  require("@tailwindcss/typography"),
],
```

Aucune autre modification nécessaire — les classes `prose-h2:mt-12`, `prose-h3:mt-10`, `prose-p:my-5`, `prose-p:leading-[1.85]`, `prose-blockquote:my-7`, etc. déjà présentes dans `LettreEauArticle.tsx` produiront alors l'espacement et la hiérarchie attendus (titre H2 détaché, paragraphes aérés, citations stylisées, liens en couleur primaire).

## Vérification

Recharger `/lettre-de-leau/nestle-waters-perquisitions-eaux-minerales-scandale` et confirmer :
- marge claire au-dessus des `##` (sous-titres)
- interligne plus généreux sur les paragraphes
- séparation visible entre paragraphes
