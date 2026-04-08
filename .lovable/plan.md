

## Plan : Mettre en miroir le bandeau "Surveillez la qualité" comme "Bien choisir son eau"

### Objectif
Transformer la section "Surveillez la qualité de votre eau" (actuellement centrée) en une disposition flex row identique à "Bien choisir son eau en bouteille", mais en miroir : texte à gauche justifié à droite avec un `border-right`, picto/icône à droite.

### Modification — `src/pages/Index.tsx`, lignes 240-276

Remplacer le layout centré actuel par un layout flex row miroir :

- **Structure flex** : `flex-col md:flex-row items-center gap-6 md:gap-8` (comme section B)
- **Texte à gauche** (order 1) : `text-right` avec `border-r-4 border-primary pr-5` (miroir du `border-l-4 pl-5`)
- **Picto à droite** (order 2) : le cercle avec Shield + icônes satellites, réutilisant le même style de cercle animé (dashed ring, bubbles) que les autres sections
- **Bouton** : aligné à droite (`flex justify-end`)
- Conserver le `max-w-5xl` au lieu de `max-w-3xl` pour être cohérent avec les autres sections
- Supprimer les particules décoratives de fond (lignes 243-246) qui appartenaient au layout centré
- Conserver les anneaux concentriques autour de l'icône Shield

### Résultat visuel attendu
```text
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Texte justifié à droite  │   ◯ Shield + icônes   │
│   border-right bleu        │   anneaux concentriques│
│   [Bouton aligné droite]   │   dashed ring          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

