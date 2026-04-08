

## Plan : Réduire l'espacement entre le Hero et la section "Quelle eau boire ?"

### Problème
L'espace vertical entre la section Hero (chiffres clés) et le titre "Quelle eau boire ?" est trop important, causé par le padding cumulé des deux sections.

### Modification — `src/pages/Index.tsx`

**Ligne 31 (Hero section)** — Réduire le padding bottom :
- Avant : `py-6 md:py-10 lg:py-12`
- Après : `pt-6 pb-3 md:pt-10 md:pb-4 lg:pt-12 lg:pb-6`

**Ligne 77 (Section "Quelle eau boire ?")** — Réduire le padding top :
- Avant : `py-6 md:py-10 lg:py-12`
- Après : `pt-3 pb-6 md:pt-4 md:pb-10 lg:pt-6 lg:pb-12`

Cela divise par deux l'espace entre les deux sections tout en conservant le rythme vertical ailleurs.

