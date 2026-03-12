

## Fusionner /parcours-eau-v2 → /parcours-eau et mettre à jour la navigation

### Changements

1. **`src/App.tsx`** — Supprimer la route `/parcours-eau-v2` et le lazy import `ParcoursEauV2`. Remplacer le composant de la route `/parcours-eau` par `ParcoursEauV2` (renommé en `ParcoursEau` dans l'import).

2. **`src/pages/ParcoursEau.tsx`** — Supprimer l'ancien contenu et le remplacer par un re-export du contenu de `ParcoursEauV2.tsx`, ou bien renommer `ParcoursEauV2.tsx` en `ParcoursEau.tsx`. Approche retenue : écraser `ParcoursEau.tsx` avec le contenu de `ParcoursEauV2.tsx`.

3. **`src/pages/ParcoursEauV2.tsx`** — Supprimer ce fichier (le contenu est déplacé dans `ParcoursEau.tsx`).

4. **`src/components/Navigation.tsx`** — Changer les deux occurrences de `/parcours-eau-v2` en `/parcours-eau`.

5. **`src/components/Footer.tsx`** — Le lien pointe déjà vers `/parcours-eau`, rien à changer.

