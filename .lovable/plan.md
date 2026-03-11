

## Probleme

1. **Tailles inegales** : La taille des marqueurs est calculee dynamiquement selon la population (`10 + populationServedMillions * 0.35`), ce qui donne des cercles de 16px a 40px. Sur le screenshot, FR et DE ont une taille uniforme d'environ 32px.

2. **Popup fonctionne deja** : Le code appelle `openPopup()` au clic, qui cree un `mapboxgl.Popup` avec les infos. Le screenshot montre bien cette popup (Autriche). Si elle ne s'affiche pas, c'est probablement un probleme d'evenement (le `click` sur le marker element peut etre bloque).

## Solution

**`src/pages/CarteEurope.tsx`** :

- **Taille uniforme** : Remplacer le calcul dynamique `Math.max(16, Math.min(40, ...))` par une taille fixe de 32px pour tous les marqueurs. Font-size fixe a 11px.
- **Click fiable** : Deplacer le `click` listener directement sur `el` (au lieu de `marker.getElement()` qui est un wrapper) pour garantir que le popup s'ouvre bien au clic. Ajouter aussi `e.stopPropagation()` pour eviter les conflits avec la carte.

