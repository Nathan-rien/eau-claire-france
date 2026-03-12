

## Ajouter une étape introductive "Vue d'ensemble" avec animation complète du cheminement

### Objectif
Insérer une nouvelle section entre le hero et les 6 étapes existantes. Cette section montrera une animation SVG panoramique du parcours complet de l'eau — du captage au robinet — avec les 6 étapes reliées visuellement par un flux d'eau animé.

### Nouvelle animation : `FullJourneyAnimation`

Un SVG horizontal (~600×250) montrant :
- **6 icônes/illustrations** alignées : montagne/source → pompe → usine de traitement → château d'eau → réseau de canalisations → robinet/maison
- **Un flux d'eau animé** (cercles bleus qui se déplacent le long d'un chemin sinueux reliant les 6 étapes)
- **Labels** sous chaque icône avec le nom de l'étape
- **Effet de progression** : les étapes s'illuminent séquentiellement avec un léger délai entre chaque (staggered glow)
- **Chiffres-clés animés** au-dessus : distance totale, temps moyen, nombre d'étapes

### Fichiers modifiés

1. **`src/components/parcours/SecondaryAnimations.tsx`** — Ajouter le composant `FullJourneyAnimation`
2. **`src/pages/ParcoursEauV2.tsx`** — Insérer une nouvelle section "Vue d'ensemble" entre le hero et la section Captage, avec :
   - Titre "Le voyage complet de l'eau"
   - L'animation `FullJourneyAnimation`
   - 3 stats rapides animées (distance, durée, contrôles)
   - Bouton "Explorer chaque étape" qui scroll vers Captage
3. **`src/index.css`** — Ajouter un keyframe `v2-flow-particle` pour les particules d'eau qui se déplacent le long du chemin

### Structure de la section

```text
┌──────────────────────────────────────────────────┐
│  "Le voyage complet de l'eau"                    │
│                                                  │
│  🏔️ ──→ ⚡ ──→ 🧪 ──→ 🏗️ ──→ 🔧 ──→ 🚰       │
│  Captage  Pompage  Trait.  Stock.  Distrib. Rob. │
│  ~~~~ particules d'eau animées ~~~~              │
│                                                  │
│  906 000 km    24-48h    63 paramètres           │
│  de réseau     de voyage  contrôlés              │
│                                                  │
│        [ Explorer chaque étape ↓ ]               │
└──────────────────────────────────────────────────┘
```

### Détails techniques
- L'animation SVG utilise `<animateMotion>` le long d'un `<path>` pour les particules d'eau
- Les icônes d'étape pulsent séquentiellement via des `animate` avec des `begin` décalés
- La section est observée par l'IntersectionObserver existant pour déclencher les animations au scroll
- Responsive : sur mobile, le chemin sera vertical au lieu d'horizontal

