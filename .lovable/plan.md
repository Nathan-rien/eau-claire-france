

## Plan : Enrichir les données de la page `/sources-eau`

### Constat
Le panneau de détail affiche déjà la composition minérale et les caractéristiques techniques, mais il manque des indicateurs dérivés et des informations contextuelles que les données permettent de calculer. La page manque aussi de statistiques synthétiques.

### Modifications

**Fichier : `src/components/WaterSourcesMap.tsx`**

1. **Indicateur de minéralisation** — Ajouter un badge coloré sous le type d'eau, calculé à partir du résidu sec :
   - Très faiblement minéralisée (< 50 mg/L) — bleu clair
   - Faiblement minéralisée (50-500 mg/L) — vert
   - Moyennement minéralisée (500-1500 mg/L) — orange
   - Fortement minéralisée (> 1500 mg/L) — rouge
   
2. **Dureté de l'eau (°f)** — Calculer et afficher la dureté française à partir de Ca et Mg : `((Ca/40.08) + (Mg/24.31)) * 5.0`, avec un label qualitatif (Très douce / Douce / Moyennement dure / Dure / Très dure).

3. **Indicateurs d'usage** — Section "Recommandations" avec des badges basés sur la composition :
   - "Convient aux nourrissons" si résidu sec < 500 et nitrates < 10 et fluor < 0.5
   - "Pauvre en sodium" si Na < 20 mg/L
   - "Riche en calcium" si Ca > 150 mg/L
   - "Riche en magnésium" si Mg > 50 mg/L
   - "Riche en bicarbonates" si HCO3 > 600 mg/L

4. **Section "Contrôle qualité" enrichie** — Remplacer le message générique par des informations contextuelles basées sur les données réelles : conformité aux limites réglementaires (nitrates < 50 mg/L, fluor < 1.5 mg/L, sodium < 200 mg/L), avec un indicateur vert/orange/rouge pour chaque paramètre vérifié.

**Fichier : `src/pages/SourcesEau.tsx`**

5. **Cartes statistiques synthétiques** — Ajouter entre le titre et la carte une grille de 4 mini-cards :
   - Nombre total de sources
   - Répartition par type (Eau de source / Minérale / Gazeuse) avec compteurs
   - Nombre de sources avec composition connue
   - Résidu sec moyen (calculé à partir des données disponibles)

### Ce qui ne change pas
- La carte Mapbox, les marqueurs, les couleurs, le zoom/clic
- La structure du panneau latéral (on ajoute des sections, on n'en supprime pas)
- Le chargement des données CSV via `buildSources()`
- Les sections éducatives en bas de page

### Fichiers touchés
| Fichier | Action |
|---------|--------|
| `src/components/WaterSourcesMap.tsx` | Enrichir le panneau de détails (minéralisation, dureté, usages, contrôle qualité) |
| `src/pages/SourcesEau.tsx` | Ajouter les cartes statistiques synthétiques |

