

## Optimiser le responsive mobile sur l'ensemble du site

### Problemes identifies (captures mobile 375px)

1. **Titres trop grands** sur les pages secondaires : `text-4xl` fixe sur Contact, APropos, MentionsLegales, etc. sans variantes mobiles
2. **Icones mal alignees dans les titres** : `flex items-center` + grandes icones (w-10) creent un decalage vertical sur mobile (visible sur APropos, Contact, Polluants)
3. **Padding/marges excessifs** : `py-12 mb-12` sur mobile = trop d'espace blanc
4. **CSS global `min-height: 44px` sur TOUS les liens** (`a, button, [role="button"]`) : force les liens inline du footer et des textes a etre trop grands, casse le rendu naturel
5. **Carte (Carte.tsx)** : `py-12` sans variante mobile, titre `text-3xl` fixe
6. **Polluants** : titre `text-3xl` fixe, pas de responsive
7. **Footer** : liens avec `min-height: 44px` applique globalement = espacement excessif

### Plan de corrections

**1. CSS global (`src/index.css`)** -- Corriger la regle touch-target
- Limiter `min-height: 44px` aux `button` et `[role="button"]` uniquement, pas aux `<a>` generiques
- Les liens du footer et inline n'ont pas besoin de 44px de hauteur

**2. Pages secondaires (APropos, Contact, MentionsLegales, RGPD, Accessibilite, Methodologie, Sources, OpenData, ApiPublique)**
- Remplacer `text-4xl` par `text-2xl md:text-4xl` pour les h1
- Remplacer `text-3xl` par `text-xl md:text-3xl` pour les h2
- Remplacer `text-xl` par `text-base md:text-xl` pour les sous-titres
- Remplacer `py-12 mb-12` par `py-6 md:py-12 mb-6 md:mb-12`
- Reduire les icones titres : `w-8 h-8 md:w-10 md:h-10`

**3. Polluants.tsx et Carte.tsx**
- `text-3xl` -> `text-xl md:text-3xl`
- `py-12` -> `py-6 md:py-12`
- Icones `w-8 h-8` -> `w-6 h-6 md:w-8 md:h-8`

**4. Diagnostic.tsx**
- Deja partiellement responsive, ajuster `text-3xl` -> `text-xl md:text-3xl`

**5. Footer.tsx**
- Ajouter `gap-6 md:gap-8` sur la grille
- Reduire le padding `py-8 md:py-12`

### Fichiers modifies (~12 fichiers)
- `src/index.css` (1 regle CSS)
- `src/components/Footer.tsx`
- `src/pages/APropos.tsx`
- `src/pages/Contact.tsx`
- `src/pages/MentionsLegales.tsx`
- `src/pages/Polluants.tsx`
- `src/pages/Carte.tsx`
- `src/pages/Diagnostic.tsx`
- `src/pages/RGPD.tsx`
- `src/pages/Accessibilite.tsx`
- `src/pages/Methodologie.tsx`
- `src/pages/Sources.tsx`

