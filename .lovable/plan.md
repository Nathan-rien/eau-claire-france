

## Version 2 visuelle du Parcours de l'eau : `/parcours-eau-v2`

Nouvelle page immersive conservant les memes donnees que `/parcours-eau` mais avec une presentation de type scrollytelling visuel : hero plein ecran, images Unsplash, animations staggerees, compteurs animes, et illustrations SVG inline.

### Fichiers a creer/modifier

**1. Creer `src/pages/ParcoursEauV2.tsx`**

Page complete avec :

- **Hero 100vh** : fond gradient bleu profond avec animation de goutte d'eau CSS, particules flottantes (divs absolues animees), titre en apparition staggeree, bouton "Commencer le voyage" scroll smooth
- **6 sections full-width** (~80vh min) avec fonds alternants (gradients subtils bleu, indigo, purple, amber, teal, green)
- **Images Unsplash** via URL directe pour chaque section :
  - Captage : nappe phreatique / paysage aquifere
  - Pompage : forage / station de pompage
  - Traitement : usine de traitement d'eau
  - Stockage : chateau d'eau
  - Distribution : canalisations
  - Robinet : eau du robinet
- **Layout 2 colonnes desktop** : image a gauche / contenu a droite, alternance gauche-droite
- **Compteurs animes** : chiffres qui comptent de 0 a la valeur cible quand la section entre dans le viewport (IntersectionObserver + requestAnimationFrame)
- **Cards sources avec barre de pourcentage animee** au lieu du simple badge
- **Timeline traitement horizontale** : nodes circulaires connectes par une ligne avec animation de progression (gradient anime via CSS)
- **Animations staggerees** : chaque element enfant apparait avec un delai incremental (style `transition-delay: ${i * 100}ms`)
- **Illustrations SVG inline simplifiees** : coupe geologique pour le captage (couches colorees), silhouette chateau d'eau avec niveau anime
- **Barre de progression sticky** identique a V1 mais avec style plus visuel (cercles plus grands, labels visibles)

**2. Modifier `src/App.tsx`**
- Ajouter lazy import `ParcoursEauV2`
- Ajouter route `/parcours-eau-v2`

**3. Modifier `src/index.css`**
- Ajouter keyframes : `water-drop` (goutte tombante), `float` (particules), `fill-up` (niveau d'eau), `count-up-fade`
- Classes utilitaires pour les animations staggerees

**4. Modifier `src/utils/seoData.ts`**
- Ajouter metadonnees SEO pour `parcoursEauV2`

**5. Modifier `src/components/Navigation.tsx`**
- Remplacer ou ajouter le lien vers V2 dans la navigation (garder V1 accessible)

### Pas de nouvelle dependance. Tout en CSS natif + IntersectionObserver + images Unsplash hotlink.

