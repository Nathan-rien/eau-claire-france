# Plan — Image de couverture pour /lettre-de-leau

## Objectif
Donner une vraie présence visuelle au hero éditorial de la page, qui est aujourd'hui uniquement texte sur dégradé bleu/vert.

## Proposition retenue : hero split + image générée

### 1. Image de couverture du hero
- Générer une image éditoriale en **16:9** (1536×864), enregistrée dans `src/assets/lettre-eau-cover.jpg`.
- Direction artistique : photographie macro d'une **goutte d'eau cristalline avec ondulations**, lumière naturelle bleutée, légère touche verte (cohérent avec la palette `#3b82f6` / `#22c55e`), ambiance magazine / National Geographic. Style sobre, premium, pas de texte dans l'image.
- Modèle : `standard` (assez de fidélité pour un hero, sans le coût premium).

### 2. Intégration dans le hero (`src/pages/LettreEau.tsx`)
Refonte du hero en layout 2 colonnes desktop, 1 colonne mobile :

```
Desktop (≥ lg)                       Mobile
┌──────────────────┬──────────────┐  ┌──────────────────┐
│ Eyebrow          │              │  │     IMAGE 16:9   │
│ H1 titre XL      │   IMAGE      │  ├──────────────────┤
│ Sous-titre       │   arrondie   │  │ Eyebrow          │
│ Stats inline     │   shadow-xl  │  │ H1 + sous-titre  │
└──────────────────┴──────────────┘  │ Stats            │
                                     └──────────────────┘
```

- Image : `rounded-2xl shadow-xl`, légère rotation/scale au hover désactivée (statique), overlay subtil dégradé bleu pour fondre avec le fond.
- Garder le dégradé `from-blue-50 via-sky-50 to-green-50` + le motif vague SVG en bas.
- Le bloc texte garde sa hiérarchie actuelle, simplement contraint à `lg:col-span-3` sur 5 colonnes (image `lg:col-span-2`).

### 3. Image Open Graph (partage social)
- Réutiliser la même image de couverture comme `og:image` via `SEOHead` (props `ogImage`) pour améliorer le rendu lors des partages LinkedIn / Twitter / WhatsApp.
- Vérifier que `SEOHead` accepte une prop `ogImage` ; sinon, passer par `schemaData.image`.

### 4. Fallback visuel pour les articles sans `cover_image_url`
- Dans `BlogCard` et `BlogHeroCard`, lorsque `article.cover_image_url` est `null`, afficher un bloc dégradé bleu→vert avec une grosse icône `Droplets` semi-transparente plutôt que de masquer la zone image (uniformise la grille).

## Fichiers modifiés
- **Nouveau** : `src/assets/lettre-eau-cover.jpg` (généré via `imagegen--generate_image`)
- `src/pages/LettreEau.tsx` : hero en 2 colonnes, import + intégration de l'image, ajout `ogImage` dans `SEOHead`
- `src/components/blog/BlogCard.tsx` : fallback dégradé + icône quand pas d'image
- `src/components/blog/BlogHeroCard.tsx` : même fallback

Aucune modification backend ou de données.

## À confirmer avant de lancer
Une seule image de couverture suffit ou tu préfères que je génère aussi :
- une bannière secondaire pour le bandeau CTA "alertes" en bas de page ?
- des illustrations placeholder par catégorie (scandale, qualité, santé…) ?

Si tu veux juste la cover du hero, je pars sur l'option ci-dessus telle quelle.
