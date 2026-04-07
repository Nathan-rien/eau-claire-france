

## Plan: Ajouter un filtre par distributeur sur le graphique "Prix par marque"

### Modification dans `src/pages/CoursEau.tsx`

1. **Ajouter un état** `selectedRetailers` (type `string[]`, défaut = tous sélectionnés) dérivé des retailers présents dans `brandTimeseries`

2. **Ajouter un sélecteur multi-choix** à côté du sélecteur de marque, permettant de cocher/décocher les enseignes. Utiliser un `Popover` + `Command` (pattern combobox multi-select) avec des `Checkbox` pour chaque enseigne disponible, plus un bouton "Tout / Aucun"

3. **Filtrer les données du graphique** : ne rendre les `<Area>` que pour les retailers sélectionnés, et filtrer les gradients en conséquence. Le `timeseriesChartData` reste complet, seules les `Area` rendues changent.

4. **Layout** : placer les deux Select côte à côte dans un `flex gap-3 flex-wrap`

```text
┌──────────────────────────────────────────────┐
│ 📈 Prix par marque — évolution               │
│ [Evian ▼]  [Distributeurs (3/24) ▼]          │
│                                               │
│  AreaChart avec seulement les lignes cochées  │
└──────────────────────────────────────────────┘
```

### Détails techniques
- `selectedRetailers` se réinitialise quand `brandTimeseries` change (nouvelle marque)
- Par défaut, les 5 premiers retailers sont sélectionnés pour éviter le bruit visuel
- Le compteur `(3/24)` dans le trigger indique combien sont actifs
- Les gradients SVG ne sont générés que pour les retailers visibles

