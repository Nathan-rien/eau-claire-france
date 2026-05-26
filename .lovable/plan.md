
# Plan — Nouvelle cover + périodicité hebdomadaire

## 1. Nouvelle image de couverture
- Regénérer `src/assets/lettre-eau-cover.jpg` (16:9, modèle `standard`) avec une nouvelle direction artistique :
  - Photographie éditoriale d'un **verre d'eau cristallin** posé sur une surface claire, lumière naturelle latérale, jeux de réfraction bleutés, fines bulles, fond doux flou bleu/vert très désaturé.
  - Style magazine premium, sans texte, palette cohérente avec `#3b82f6` / `#22c55e`.
- Le fichier garde le même chemin → aucun import à modifier dans `LettreEau.tsx`.
- L'`alt` de l'image sera mis à jour : "Verre d'eau cristallin éclairé par la lumière naturelle — Lettre de l'eau".

## 2. Périodicité hebdomadaire
Dans `src/pages/LettreEau.tsx` :
- Hero stats : remplacer `"Nouvel article tous les 3 jours"` par `"Nouvel article toutes les semaines"`.

Dans `SEOHead` (même fichier) :
- Mettre à jour la description : `"Un nouvel article toutes les semaines par InfoEau."`

Vérifier rapidement les autres occurrences à harmoniser :
- `src/components/blog/HomeBlogTeaser.tsx`
- `public/llms.txt` / `public/llms-full.txt`
- toute autre mention "tous les 3 jours" dans le repo → remplacer par "toutes les semaines".

## Fichiers touchés
- `src/assets/lettre-eau-cover.jpg` (regénéré)
- `src/pages/LettreEau.tsx`
- Éventuellement `src/components/blog/HomeBlogTeaser.tsx`, `public/llms.txt`, `public/llms-full.txt` si la phrase y apparaît.

Aucune modif backend ni de données.
