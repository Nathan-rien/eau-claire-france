

## Plan : Refonte UX de la carte parcours bouteille

### Problème actuel

La fonction `getStepPosition()` place les 5 étapes industrielles (Analyse, Traitement, Embouteillage, Stockage, Transport) en offset mécanique depuis chaque source — toujours dans la même direction, avec des carrés colorés identiques. Cela produit des grappes de carrés répétitifs qui encombrent la carte sans refléter la réalité géographique.

### Nouvelle approche

Séparer la carte (géographie réelle) de la timeline du processus industriel (pédagogie) :

**1. Retirer les step markers de la carte**

Supprimer les 5 marqueurs carrés par source. La carte ne garde que :
- Les **sources de captage** (cercles bleus) — positions réelles
- Les **magasins/communes** (cercles verts) — positions réelles
- Les **arcs de distribution** entre source et communes

**2. Ajouter une timeline horizontale interactive sous la carte**

Une barre horizontale avec les 6 étapes du processus (Captage → Analyse → Traitement → Embouteillage → Stockage/Expédition → Magasin) :
- Chaque étape = un cercle coloré avec icône, reliés par une ligne pointillée
- Au clic/hover sur une étape : affichage d'un tooltip avec description et durée
- L'étape "Captage" et "Magasin" sont synchronisées avec la carte (highlight de la source / des communes)

**3. Panneau détail au clic sur une source**

Quand l'utilisateur clique sur un marqueur source sur la carte :
- Un petit panneau latéral ou popup enrichi affiche le parcours spécifique de cette source
- Nom de la source, distributeurs associés, et la timeline des étapes avec les durées

**4. Meilleurs marqueurs sur la carte**

- Sources : cercles avec icône goutte (déjà OK)
- Communes : cercles plus petits, verts, avec effet pulse subtil au hover
- Supprimer le styling carré brut des anciens step markers

### Fichiers modifiés

- `src/components/WaterJourneyMap.tsx` — retirer la logique `getStepPosition` et les step markers, ajouter la timeline horizontale en dessous de la carte, panneau détail au clic source
- Supprimer `JOURNEY_STEPS` de la logique de marqueurs cartographiques, les garder comme données pour la timeline

### Résultat attendu

- Carte épurée avec uniquement sources + communes + arcs
- Timeline pédagogique lisible sous la carte
- Interaction : clic source → détail du parcours
- Plus de carrés identiques répétés partout

