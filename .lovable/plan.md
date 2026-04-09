

## Plan : Enrichir davantage la page /carte-polluants

### Ce qui existe déjà
25 villes avec polluants chiffrés, 13 régions avec conformité/population/zones, popups détaillés.

### Enrichissements proposés

#### 1. Polluants émergents — ajouter PFAS, microplastiques, sélénium
Compléter les données de chaque ville avec des polluants émergents (PFAS, microplastiques) et des métaux lourds supplémentaires (sélénium, chrome, cuivre) là où c'est pertinent. Passer de 1-4 polluants par ville à 3-6.

#### 2. Tendance annuelle par ville
Ajouter un champ `trend: 'up' | 'down' | 'stable'` à chaque ville indiquant l'évolution de la qualité vs l'année précédente. Afficher dans le popup une flèche colorée (↗ rouge, ↘ vert, → gris).

#### 3. Bandeau statistique en haut
Ajouter un bandeau récapitulatif au-dessus de la carte avec 4 chiffres clés :
- Nombre de villes surveillées
- Taux de conformité moyen national
- Nombre de dépassements détectés
- Nombre de régions à risque élevé

#### 4. Barre de conformité visuelle dans les cartes régionales
Remplacer le simple pourcentage textuel par une barre de progression colorée (vert/jaune/rouge) pour rendre la conformité immédiatement lisible visuellement.

#### 5. Ajouter 5 villes supplémentaires (30 total)
Ajouter : Caen, Poitiers, Besançon, Nancy, Saint-Étienne — pour couvrir les régions sous-représentées.

### Fichier modifié
- `src/components/PollutantMap.tsx`

### Ce qui ne change pas
Aucune fonctionnalité, filtre ou navigation modifiée. Même structure de composant.

