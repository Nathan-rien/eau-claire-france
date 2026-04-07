

## Aligner les couleurs du bouton et du texte "votre eau" sur la charte du logo InfoEau.fr

Le logo utilise un degradé `#3b82f6` (bleu) → `#22c55e` (vert). Actuellement le bouton et le texte utilisent `from-primary to-green-600`, mais `--primary` est un bleu tres fonce (`hsl(222, 47%, 11%)`) qui ne correspond pas au logo.

### Modification

**Fichier : `src/pages/Index.tsx`**

1. **Texte "votre eau"** (ligne 36) : remplacer `from-primary to-green-600` par `from-[#3b82f6] to-[#22c55e]` pour reprendre exactement le degrade du logo.

2. **Bouton CTA** (ligne 44) : remplacer `from-primary to-green-600 hover:from-primary/90 hover:to-green-700` par `from-[#3b82f6] to-[#22c55e] hover:from-[#2563eb] hover:to-[#16a34a]` (versions legèrement plus foncées au hover).

### Fichier modifie
- `src/pages/Index.tsx` uniquement (2 lignes)

