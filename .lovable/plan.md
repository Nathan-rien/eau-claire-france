# Plan — Mise en avant + redesign de la Lettre de l'eau

## 1. Navigation

Le lien `/lettre-de-leau` existe déjà dans `src/components/Navigation.tsx` (dernier élément de `directNavigationItems`, pour FR et EU), mais il se perd en bout de barre.

Proposition :
- Le déplacer en tête des items directs (juste après les dropdowns Cartes/Prix), pour qu'il soit visible immédiatement.
- Lui appliquer un style distinctif (badge "Nouveau" + petite icône `Newspaper`, accent primary) pour le différencier visuellement des autres liens.
- Ajout dans le footer (section "Ressources") si pas déjà présent.

## 2. Redesign de `/lettre-de-leau`

Le design actuel est fonctionnel mais générique (h1 + filtres + grille 3 colonnes uniforme). On vise un rendu plus éditorial type magazine.

### Nouvelle structure de page

```
┌─────────────────────────────────────────────────┐
│  HERO éditorial                                  │
│  - Eyebrow "Lettre de l'eau · N°XX"             │
│  - Titre XL serif + sous-titre                  │
│  - Stats inline (X articles · MAJ tous les 3j)  │
│  - Dégradé bleu→vert subtil, motif vague SVG    │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  ARTICLE À LA UNE (le plus récent)              │
│  Layout 2 colonnes 60/40 : image large + texte  │
│  Badge "À la une", titre 2xl, excerpt long      │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Filtres catégories (pills sticky en haut)      │
│  + compteur résultats                           │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  GRILLE éditoriale articles 2-6                 │
│  Layout bento : 1 grand (col-span-2) + petits   │
│  Skeleton loaders améliorés (image + texte)     │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  GRILLE classique articles 7+                   │
│  3 colonnes uniformes (BlogCard actuelle)       │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  CTA abonnement / alertes (bandeau dégradé)     │
└─────────────────────────────────────────────────┘
```

### Détails design
- Tokens existants : primary blue `#3b82f6`, accent green `#22c55e`, fond `sky-50`
- Typo : titres en `font-bold` + tracking-tight ; éventuellement classe `font-serif` pour l'eyebrow magazine
- Cartes : `BlogCard` reçoit un variant `featured` (image plus grande, titre 2xl, excerpt 4 lignes)
- Nouveau composant `BlogHeroCard` pour l'article à la une
- Animations : `fade-in-up` sur scroll (déjà dispo via CSS), `hover:scale-[1.02]` sur images
- États : skeleton avec ratio image préservé, état vide illustré
- Responsive : bento → 1 col sur mobile, 2 cols sur tablette, 2 cols (1 grand + 1 petit) sur desktop

## Détails techniques

Fichiers modifiés :
- `src/components/Navigation.tsx` : réordonner items, ajouter badge "Nouveau" sur "Lettre de l'eau"
- `src/components/Footer.tsx` : vérifier/ajouter lien
- `src/pages/LettreEau.tsx` : refonte structure (hero, à la une, bento, grille, CTA)
- `src/components/blog/BlogCard.tsx` : ajouter variant `featured`
- Nouveau `src/components/blog/BlogHeroCard.tsx` : carte article à la une

Aucune modification backend/API requise — `fetchArticles(50)` fournit déjà tout. Le premier article (`articles[0]`) sert pour la une, `[1..6]` pour le bento, `[7..]` pour la grille standard.
