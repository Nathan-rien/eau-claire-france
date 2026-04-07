

## Remplacer le BarChart par un graphique d'évolution (AreaChart) dans la section "Prix par marque"

### Objectif
Fusionner les deux sections actuelles (BarChart par enseigne + LineChart timeseries) en une seule section avec un graphique d'évolution type AreaChart (ligne + gradient fill), similaire au style des graphiques généraux de la page (cf. image de référence).

### Modifications dans `src/pages/CoursEau.tsx`

1. **Supprimer le BarChart** (lignes 417-445) et les stats min/max/moy/médiane en dessous (lignes 447-472)

2. **Remplacer par un AreaChart** utilisant les données timeseries existantes (`getBrandTimeseries`), avec :
   - Gradient fill sous la courbe (style identique au graphique "Prix moyen eau en bouteille")
   - Une `Area` par retailer, empilées visuellement avec des opacités différentes
   - Axes formatés en `€/L` et dates `dd/mm`
   - Tooltip personnalisé montrant le prix par enseigne
   - Légende des enseignes

3. **Supprimer la section "BRAND TIMESERIES" séparée** (lignes 479-561) puisqu'elle est absorbée dans la section principale

4. **Déplacer le chargement timeseries** directement dans la section brand (le `useEffect` pour `getBrandTimeseries` reste inchangé)

5. **Conserver** : le sélecteur de marque, les skeletons de chargement, le message "aucune donnée"

6. **Mettre à jour le titre** : "Prix par marque — évolution" avec l'icône `TrendingUp` au lieu de `BarChart3`

7. **Retirer les imports inutilisés** : `Bar`, `Cell`, `BarChart`, `BarChart3` si plus utilisés nulle part

### Résultat visuel

```text
┌─────────────────────────────────────────┐
│ 📈 Prix par marque — évolution          │
│ [Select: Evian ▼]                       │
│                                         │
│  AreaChart (ligne + gradient fill)       │
│  Une courbe par enseigne                │
│  Axe X: dates (90j)  Axe Y: €/L        │
│  Légende: Carrefour, Leclerc, Auchan... │
└─────────────────────────────────────────┘
```

