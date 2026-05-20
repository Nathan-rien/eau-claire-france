## Réduire l'espacement au-dessus du titre "Diagnostic complet"

Sur `/quelle-eau-boire/complet`, un grand vide apparaît entre le fil d'Ariane et le bouton "Retour au choix", puis un second vide avant le titre.

### Modifications (`src/pages/QuelleEauBoire.tsx`)

1. **Ligne 580** — Réduire le padding vertical du conteneur principal :
   - `py-6 md:py-8` → `pt-2 md:pt-3 pb-6 md:pb-8`
2. **Ligne 583** — Réduire la marge sous "Retour au choix" :
   - `mb-6` → `mb-3`
3. **Ligne 589** — Réduire la marge sous le bloc titre :
   - `mb-6 md:mb-8` → `mb-4 md:mb-6`

Appliquer les mêmes ajustements (lignes 459, 463 du mode rapide) pour garder la cohérence entre `/rapide` et `/complet`.

### Hors périmètre
Aucun changement de logique, de routes ou de contenu.