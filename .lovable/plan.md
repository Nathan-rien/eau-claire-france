

## Plan : Rendre les marqueurs industriels visibles sur la carte

### Problème
Les marqueurs industriels (Analyse, Traitement, Embouteillage, Stockage) sont positionnés très près de la source (offsets de 0.01-0.02°). Le marqueur source a un `z-index: 10` et une taille de 32px, ce qui masque complètement les marqueurs industriels (24px, sans z-index) aux niveaux de zoom habituels. Seuls les marqueurs "Logistique" sont visibles car ils sont géographiquement éloignés (entrepôts régionaux).

### Fichier modifié
- `src/components/WaterJourneyMap.tsx`

### Corrections

**1. Augmenter les offsets des marqueurs industriels dans `waterDistributors.ts`**

Les offsets actuels (0.008-0.02°) sont trop petits pour être distingués du marqueur source à zoom 5-8. Augmenter à ~0.05-0.08° pour que les étapes soient visuellement distinctes même au zoom France.

Fichier : `src/data/waterDistributors.ts`, fonction `getIndustrialStepsForSource` :
- analyse : offset de `[+0.012, +0.008]` → `[+0.06, +0.04]`
- traitement : `[-0.008, +0.015]` → `[-0.05, +0.07]`
- embouteillage : `[+0.02, -0.01]` → `[+0.08, -0.05]`
- stockage : `[-0.015, -0.02]` → `[-0.07, -0.08]`

**2. Donner un z-index aux marqueurs industriels**

Dans `WaterJourneyMap.tsx`, ajouter `el.style.zIndex = '5'` aux marqueurs industriels pour qu'ils passent au-dessus de la carte mais sous les marqueurs source (z-index 10).

**3. Réduire le z-index source quand industriel est actif**

Quand le toggle industriel est actif, passer les source markers à `z-index: 3` pour que les industriels (z-index 5) soient visibles au-dessus. Rétablir à 10 quand le toggle est désactivé.

### Résultat attendu
- Les 4 marqueurs proches de la source (Analyse, Traitement, Embouteillage, Stockage) sont clairement visibles et séparés visuellement, même au zoom France
- Le marqueur Logistique reste éloigné comme avant
- Les dashed lines connectent bien tous les points

