

## Plan : Afficher les données eau du robinet (pas eau en bouteille) au clic sur les zones

### Problème

Le panneau latéral au clic sur une zone charge `buildSources()` qui contient les **sources d'eau en bouteille** (Évian, Volvic, Alizée, Montfras, etc.). Or la page `/carte` traite de la **qualité de l'eau du robinet** par ville. Les zones représentent des bassins d'alimentation en eau potable, pas des zones de captage d'eau minérale.

Alizée et Montfras ne sont pas des sources d'eau du robinet — ce sont des eaux minérales naturelles embouteillées à Chambon-la-Forêt qui tombent géographiquement dans le polygone "Bassin parisien".

### Solution

Remplacer le contenu du panneau latéral : au lieu d'afficher les sources d'eau en bouteille (`buildSources`), afficher les **villes** situées dans la zone cliquée avec leurs données de qualité d'eau du robinet déjà présentes dans `waterQualityData`.

### Modifications — `src/components/InteractiveMap.tsx`

**1. Supprimer les imports et états liés aux sources en bouteille**
- Retirer `buildSources`, `SourceItem`, les helpers d'analyse (`getMineralizationLevel`, `computeHardness`, etc.)
- Retirer les états `allSources` et `zoneSources`
- Retirer le `useEffect` qui charge `buildSources()`
- Retirer le composant `SourceCard`

**2. Ajouter un état `zoneCities`** de type `CityData[]`
- Au clic sur une zone, filtrer `waterQualityData` pour ne garder que les villes dont les coordonnées tombent dans le polygone de la zone (via `isPointInZone` — conserver cette seule fonction utilitaire)

**3. Remplacer le panneau latéral par un panneau "Eau du robinet"**
Pour chaque ville dans la zone, afficher une carte compacte avec :
- Nom de la ville + note qualité (badge A/B/C coloré)
- Source d'alimentation (`waterSource` — ex: "Eaux de surface + souterraines")
- Taux de conformité (barre de progression colorée)
- Tableau compact des polluants mesurés :
  - Nitrates : valeur / 50 mg/L (seuil réglementaire)
  - Pesticides : valeur / 0.1 µg/L
  - Plomb : valeur / 10 µg/L
  - Chaque ligne avec icône vert/orange/rouge selon ratio
- Population desservie
- Date de dernière analyse

**4. En-tête du panneau** : afficher un résumé de zone
- Nombre de villes dans la zone
- Type de captage dominant (déduit des `waterSource` des villes)
- Score moyen de la zone

### Résultat attendu

Cliquer sur "Bassin parisien" affichera Paris, Orléans et Rouen avec leurs données de qualité d'eau du robinet (nitrates, pesticides, plomb, taux de conformité), au lieu d'Alizée et Montfras qui sont des eaux en bouteille sans rapport.

### Fichier modifié
- `src/components/InteractiveMap.tsx` — refonte du panneau latéral
- `src/utils/waterSourceAnalysis.ts` — inchangé (toujours utilisé par `/sources-eau`)

