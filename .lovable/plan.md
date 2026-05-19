## Problème identifié

Les fonctions de scoring actuelles ont des **plateaux à 10/10 très larges** :
- `lowBetter` renvoie **10 dès que `v ≤ fullAt`** (ex. nitrates ≤ 5 mg/L → 10/10, même si 0.1 ou 4.9)
- `windowed` renvoie **10 dès que `v` est entre `optLow` et `optHigh`** (ex. résidu sec 150–800 → 10/10 pour 200, 400, 700…)

Conséquence sur le profil **Général** (visible sur le podium) : Thonon, Grand Barbier et Sainte-Sophie atteignent toutes 10/10 sur nitrates, résidu, sodium, sulfates, fluorure, calcium → 80/80. Aucune discrimination.

## Solution : scoring continu avec pic d'optimum

### 1. Refondre les deux fonctions de scoring (`src/utils/rankingV2.ts`)

**`lowBetter` → bonus dégressif même sous `fullAt`**
- Ajouter un `idealAt` (valeur idéale, ex. 0)
- Entre `idealAt` et `fullAt` : note décroît linéairement de 10 → 9
- Entre `fullAt` et `zeroAt` : décroît de 9 → 0 (comme aujourd'hui)
- Effet : Thonon nitrates 2.1 mg/L ≈ 9.6, Grand Barbier 1 ≈ 9.8, Sainte-Sophie 0.5 ≈ 9.9 → différenciation visible

**`windowed` → pic au centre de la fenêtre optimale**
- Calcule le centre `optCenter = (optLow + optHigh) / 2`
- Au centre exact : 10
- Aux bornes `optLow`/`optHigh` : 9
- Décroissance continue jusqu'à 0 aux bornes `min`/`max`
- Effet : résidu sec 342 vs 376 vs 340 donnera 3 scores distincts

### 2. Resserrer 3–4 seuils trop laxistes du profil `general`

- `nitrates` : `fullAt` 5 → 2 (objectif eau de qualité)
- `sodium` : `fullAt` 20 → 5
- `sulfates` : `fullAt` 50 → 20
- `fluorure` : `fullAt` 0.3 → 0.15

### 3. Ne pas toucher

- Les poids, les exclusions, les autres profils santé (purity, baby, sport…) restent inchangés — leurs fenêtres sont déjà étroites et adaptées à leur objectif médical.
- L'affichage (déjà 1 décimale) et la note lettrée (A/B/C/D/E) restent identiques.

## Résultat attendu

Sur le podium Général actuel, on devrait voir des scores du type **78.4 / 76.9 / 75.2 / 80** au lieu de trois 80/80, et des barres de critères avec des valeurs comme 9.7, 9.2, 8.8 plutôt que 10.0 partout.
