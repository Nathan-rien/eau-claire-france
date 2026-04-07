

## Plan: Ajouter une courbe "Moyenne" dans le filtre distributeur

### Objectif
Ajouter une entrée virtuelle "Moyenne" dans le sélecteur de distributeurs, sélectionnée par défaut (seule). L'utilisateur pourra ensuite cocher individuellement les enseignes.

### Modifications dans `src/pages/CoursEau.tsx`

1. **Calculer la série "Moyenne"** : dans le `useMemo` qui construit `timeseriesChartData`, ajouter pour chaque date une clé `__moyenne__` = moyenne arithmétique de tous les retailers disponibles ce jour-là (pas seulement les visibles, tous les `brandTimeseries`).

2. **Modifier le défaut de `selectedRetailers`** : au lieu des 5 premiers slugs, initialiser à `['__moyenne__']` quand `brandTimeseries` change.

3. **Modifier `allRetailerSlugs`** : préfixer le tableau avec `'__moyenne__'` pour qu'il apparaisse dans le compteur et le toggle "tout".

4. **Modifier le sélecteur Popover** : afficher "Moyenne" en premier dans la liste (avant les enseignes), avec un style légèrement différencié (icône `TrendingUp` ou texte en gras) pour le distinguer visuellement.

5. **Modifier `visibleSeries` et le rendu `<Area>`** : 
   - Si `__moyenne__` est sélectionné, ajouter une `<Area>` dédiée avec un style distinctif (trait plus épais, couleur neutre type gris foncé, gradient plus prononcé)
   - Le gradient et la couleur de la moyenne utilisent une constante dédiée (ex: `#374151`)

6. **Tooltip et Legend** : afficher "Moyenne" comme nom pour la clé `__moyenne__`

### Résultat visuel
```text
┌──────────────────────────────────────────────┐
│ 📈 Prix par marque — évolution               │
│ [Evian ▼]  [Distributeurs (1/25) ▼]          │
│                                               │
│  AreaChart: courbe "Moyenne" seule            │
│  L'utilisateur coche ensuite Carrefour, etc.  │
└──────────────────────────────────────────────┘
```

