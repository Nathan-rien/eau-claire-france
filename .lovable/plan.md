

## Ajouter un indicateur de scroll horizontal sur le tableau /prix-eaux en mobile

### Probleme

Le tableau des prix utilise `overflow-x-auto` mais rien n'indique visuellement a l'utilisateur qu'il peut scroller horizontalement. Sur mobile, le tableau depasse l'ecran sans aucun affordance.

### Solution

1. **Ajouter un indicateur visuel "Glissez pour voir plus →"** au-dessus du tableau, visible uniquement sur mobile (`md:hidden`), avec une petite icone de fleche horizontale et une animation subtile.

2. **Ajouter un fondu/gradient sur le bord droit** du conteneur `overflow-x-auto` pour signaler visuellement qu'il y a du contenu cache a droite. Le gradient disparait quand l'utilisateur a scrolle jusqu'au bout.

3. **Rendre la premiere colonne sticky** sur mobile pour garder le contexte (source/enseigne) visible pendant le scroll horizontal.

### Fichier modifie

**`src/pages/PrixEaux.tsx`** (lignes 528-636)

- Wrapper le `div.overflow-x-auto` dans un conteneur `relative` avec un pseudo-element gradient droit via une classe CSS
- Ajouter un texte hint `<p class="md:hidden text-xs text-muted-foreground flex items-center gap-1 mb-2"><MoveHorizontal /> Glissez pour voir toutes les colonnes</p>` juste avant le tableau
- Ajouter `sticky left-0 bg-white dark:bg-gray-950 z-10` sur la premiere colonne (`<th>` et `<td>` de "Source")

**`src/index.css`** -- Ajouter une classe utilitaire pour le gradient de fade-out droit :
```css
.table-scroll-hint::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 2rem;
  background: linear-gradient(to right, transparent, var(--background));
  pointer-events: none;
}
```

