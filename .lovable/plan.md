

## Enrichir la carte eau du robinet : villes manquantes + ramifications communes

### Constat

Actuellement 15 routes (Paris x2, Lyon, Marseille, Bordeaux, Lille, Toulouse, Nantes, Strasbourg, Nice, Rennes, Montpellier, Grenoble, Dijon, Clermont-Ferrand). Il manque ~20 agglomerations importantes et le modele actuel ne montre qu'une seule commune par route — pas de ramification vers les communes voisines desservies par la meme source.

### Modifications

**1. Enrichir le modele de donnees** (`src/data/tapWaterSources.ts`)

Ajouter un champ optionnel `communes` sur `TapWaterRoute` pour lister les communes peripheriques desservies par le meme reseau :

```ts
export interface ServedCommune {
  name: string;
  lat: number;
  lng: number;
  population?: number;
}

export interface TapWaterRoute {
  // ... existant
  communes?: ServedCommune[]; // communes peripheriques desservies
}
```

**2. Ajouter ~20 nouvelles agglomerations**

Rouen, Caen, Le Havre, Tours, Orléans, Limoges, Angers, Brest, Amiens, Metz, Nancy, Besançon, Perpignan, Toulon, Aix-en-Provence, Saint-Étienne, Annecy, Le Mans, Reims, Mulhouse — avec captage, traitement, reservoir et commune principale.

**3. Ajouter les ramifications** pour les routes existantes et nouvelles

Exemple pour Paris : ajouter Boulogne-Billancourt, Montreuil, Saint-Denis, Nanterre, Créteil. Pour Lyon : Villeurbanne, Vénissieux, Vaulx-en-Velin. Etc. Environ 3-5 communes satellites par agglomeration.

**4. Adapter le composant carte** (`src/components/TapWaterJourneyMap.tsx`)

En mode detail (route selectionnee) :
- Apres l'animation principale (captage → commune centre), ajouter des arcs secondaires depuis la commune ou le reservoir vers chaque commune peripherique
- Marqueurs plus petits pour les communes satellites, avec popup indiquant le nom et la population
- Animation en cascade : d'abord le trajet principal, puis les ramifications avec un leger delai

### Fichiers modifies

| Fichier | Action |
|---------|--------|
| `src/data/tapWaterSources.ts` | Ajouter interface `ServedCommune`, champ `communes?`, ~20 nouvelles routes, communes satellites pour chaque route |
| `src/components/TapWaterJourneyMap.tsx` | Afficher les communes satellites en mode detail avec arcs secondaires depuis la commune/reservoir |

