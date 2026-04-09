

## Plan : Enrichir les données de la carte /carte

### Constat actuel

La page `/carte` repose sur deux composants :

1. **`InteractiveMap.tsx`** — carte Mapbox avec seulement **10 villes** (Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Strasbourg, Montpellier, Bordeaux, Lille) et des champs limités : nom, coords, quality (A-E), score, source, region. Les popups n'affichent que 4 lignes basiques.

2. **`QualityMap.tsx`** — cartes régionales déjà bien enrichies (13 régions, polluants détaillés, conformité, population, zones). Cette partie est déjà complète.

L'enrichissement doit donc porter sur **`InteractiveMap.tsx`** : plus de villes et des popups plus informatifs.

### Modifications prévues

#### 1. Passer de 10 à 25+ villes sur la carte Mapbox
Ajouter des villes pour couvrir toutes les régions : Rennes, Rouen, Dijon, Clermont-Ferrand, Grenoble, Toulon, Metz, Reims, Orléans, Angers, Brest, Limoges, Ajaccio, Amiens, Pau.

Chaque ville aura des champs supplémentaires :
- `population` (habitants desservis)
- `conformityRate` (% conformité)
- `lastAnalysis` (date dernier contrôle)
- `waterSource` (type de captage)
- `nitrates` (mg/L), `pesticides` (µg/L), `lead` (µg/L) — valeurs clés mesurées

#### 2. Popups Mapbox enrichis
Refondre le HTML des popups pour afficher :
- Score avec barre visuelle colorée
- Population desservie
- Taux de conformité avec couleur
- Date du dernier contrôle
- Tableau compact des 3 polluants clés (nitrates, pesticides, plomb) avec valeurs et limites

#### 3. Bandeau statistique national
Ajouter au-dessus de la carte (dans `QualityMap.tsx`) un résumé avec 4 chiffres clés calculés dynamiquement depuis les régions :
- Villes surveillées (somme des communes)
- Conformité moyenne nationale
- Régions avec alertes
- Population totale desservie

### Fichiers modifiés
- `src/components/InteractiveMap.tsx` — données villes + popups
- `src/components/QualityMap.tsx` — bandeau statistique national

### Ce qui ne change pas
Aucune fonctionnalité, filtre, toggle zones, légende ou navigation modifié.

