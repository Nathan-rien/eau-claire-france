

## Plan : Corriger les lignes industrielles et le bug de saut des marqueurs

### Problème 1 — Lignes pointillées monochromes
Les lignes industrielles utilisent une seule couleur violette (`#a78bfa`). Elles devraient refléter les couleurs des étapes qu'elles relient (bleu → violet → ambre → vert).

**Solution** : Au lieu d'un seul LineString par source, générer un segment séparé par paire d'étapes consécutives (source→analyse, analyse→traitement, etc.) avec une propriété `color` correspondante. Remplacer le layer unique par un layer utilisant `'line-color': ['get', 'color']` pour colorer chaque segment individuellement.

### Problème 2 — Marqueurs qui sautent en haut à gauche
L'effet de surbrillance (lignes 433-448) écrit directement `el.style.transform = 'scale(1.3)'` ou `el.style.transform = ''` sur l'élément du marqueur. Or Mapbox utilise aussi `transform: translate(...)` sur cet élément pour le positionner. Écraser le `transform` supprime le `translate` → le marqueur saute en (0,0) de la carte.

**Solution** : Ne plus toucher `el.style.transform`. Utiliser plutôt un wrapper `div` intérieur au marqueur pour le scale, ou appliquer le scale via une classe CSS avec `transform: scale()` sur un enfant, pas sur l'élément racine du marqueur. Concrètement :
- Modifier la création des marqueurs industriels (lignes 371-376) pour encapsuler le contenu dans un `div` enfant avec une classe `.industrial-inner`
- L'effet de highlight appliquera `scale(1.3)` sur `.industrial-inner` (pas sur l'élément racine)
- L'opacité peut rester sur l'élément racine (ne casse pas le transform)

### Fichier modifié
- `src/components/WaterJourneyMap.tsx`

### Détails techniques

**Segments colorés** : Dans l'effet `showIndustrial`, au lieu de pousser un seul LineString avec toutes les coordonnées, boucler sur les paires consécutives :
```
[source, analyse] → color: '#60a5fa'
[analyse, traitement] → color: '#3b82f6'
[traitement, embouteillage] → color: '#8b5cf6'
[embouteillage, stockage] → color: '#f59e0b'
[stockage, logistique] → color: '#22c55e'
```

**Fix transform** : Restructurer le DOM du marqueur :
```html
<div class="industrial-marker"> <!-- élément Mapbox, ne PAS toucher son transform -->
  <div class="industrial-inner ..."> <!-- appliquer scale ici -->
    <svg>...</svg>
  </div>
</div>
```

