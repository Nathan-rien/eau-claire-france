

## Plan : Étendre l'historique et afficher les années sur le graphique par marque

### Problèmes
1. **Données limitées à 90 jours** : `getBrandTimeseries(selectedBrand, 90)` ne remonte qu'à 3 mois, alors que la base contient ~6 mois de données (depuis sept. 2025).
2. **Pas d'année sur l'axe X** : le `tickFormatter` n'affiche que `jour/mois` (ex: `25/02`), sans année.
3. **Tooltip sans année** : même problème dans le tooltip.

### Changements

#### 1. `src/pages/CoursEau.tsx` — Passer à 365 jours au lieu de 90
- Ligne 194 : `getBrandTimeseries(selectedBrand, 90)` → `getBrandTimeseries(selectedBrand, 365)`
- Ligne 497 : Mettre à jour le message "Aucune donnée" pour refléter la nouvelle période

#### 2. `src/pages/CoursEau.tsx` — Afficher les années sur l'axe X
- Ligne 526-529 : Modifier le `tickFormatter` du XAxis pour inclure l'année quand les données couvrent plus de 3 mois, ou au minimum afficher `mois/année` :
  ```tsx
  tickFormatter={(d: string) => {
    const [y, m] = d.split('-');
    return `${m}/${y.slice(2)}`;
  }}
  ```
- Réduire le nombre de ticks avec `interval="preserveStartEnd"` ou `minTickGap={40}` pour éviter le chevauchement

#### 3. `src/pages/CoursEau.tsx` — Afficher l'année dans le tooltip
- Ligne 540-543 : Inclure l'année dans le formatage de la date du tooltip :
  ```tsx
  const [y, m, day] = (label as string).split('-');
  <p>{day}/{m}/{y}</p>
  ```

### Fichiers modifiés
- `src/pages/CoursEau.tsx` — 4 modifications mineures

