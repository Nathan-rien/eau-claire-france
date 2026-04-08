

## Plan : Harmoniser les espacements de la page d'accueil

### Problème
Les sections de la page d'accueil utilisent des paddings et marges incohérents :
- La plupart des sections : `py-8 md:py-12 lg:py-16`
- Section C (Surveiller) : `py-10 md:py-14 lg:py-20` — plus grand
- Les marges internes (titres, sous-titres, CTA) varient entre `mb-3`, `mb-4`, `mb-6`, `mb-8`, `mb-12`

### Fichier modifié
`src/pages/Index.tsx`

### Changements

**1. Uniformiser le padding vertical de toutes les sections**
Toutes les sections passent à `py-6 md:py-10 lg:py-12` (légèrement réduit pour un rendu plus compact).

**2. Standardiser les espacements internes**
- Titre `h2` → `mb-2`
- Sous-titre / description → `mb-4`
- Bloc CTA (bouton) → `mt-4`
- Bloc stats dans le Hero → `mb-4 md:mb-6`
- Grilles de cartes → gap uniforme `gap-4`
- Sections éditoriales (A, B, C) : gap entre colonnes `gap-6 md:gap-8`

**3. Hero : réduire les marges internes**
- Titre principal : `mb-3 md:mb-4`
- Sous-titre : `mb-4 md:mb-6`
- Bouton CTA : `mb-4 md:mb-6`

### Résultat attendu
Espacement visuel homogène entre toutes les sections, titres, et boutons CTA sur toute la page.

