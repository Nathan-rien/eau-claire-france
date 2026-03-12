

## Enrichir chaque étape avec plus de texte et d'animations

### Objectif
Ajouter du contenu textuel éducatif et des micro-animations supplémentaires à chacune des 6 étapes pour rendre la page plus immersive et informative.

### Modifications par étape

**1. Captage** — Ajouter un encart "Le saviez-vous ?" sur le cycle de l'eau (temps de filtration naturelle, âge des nappes profondes). Ajouter une animation de compteur pour les 33 000 points de captage.

**2. Pompage** — Ajouter un paragraphe sur les enjeux énergétiques du pompage (consommation électrique, pompes solaires). Ajouter des icônes animées de type "pulse" sur les stats.

**3. Traitement** — Ajouter un paragraphe expliquant la différence entre eau souterraine (traitement léger) et eau de surface (traitement complet). Ajouter un encart sur les 63 paramètres réglementaires avec animation fade-in progressive.

**4. Stockage** — Ajouter du texte sur le rôle des châteaux d'eau dans la pression gravitaire, la gestion des pics de consommation et le renouvellement de l'eau. Ajouter une animation de pulsation sur l'indicateur de niveau.

**5. Distribution** — Ajouter un paragraphe sur les pertes réseau (20% en moyenne, jusqu'à 50% dans certaines communes). Ajouter un encart "Enjeu environnemental" avec animation. Ajouter des stats animées supplémentaires.

**6. Robinet** — Ajouter un paragraphe sur le coût de l'eau (prix moyen en France ~4€/m³), la comparaison eau du robinet vs eau en bouteille (×100 à ×300 plus cher). Ajouter un encart comparatif animé.

### Animations ajoutées

- **Pulse glow** sur les icônes d'étape au scroll (classe `animate-pulse` existante)
- **Staggered fade-in** pour les nouveaux paragraphes (déjà en place, étendre les delays)
- **Scale-in** sur les encarts "Le saviez-vous" avec un léger rebond
- **Compteurs animés** réutilisant `useAnimatedCounter` existant pour les nouvelles stats
- **Shimmer** sur les chiffres-clés avec un gradient animé

### Fichiers modifiés

1. **`src/pages/ParcoursEauV2.tsx`** — Ajout de texte et d'animations dans chaque section
2. **`src/index.css`** — Ajout d'un keyframe `v2-shimmer` pour l'effet de brillance sur les chiffres

