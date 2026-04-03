

## Toggle réseau communes + optimisation animations

### Modifications dans `src/components/TapWaterJourneyMap.tsx`

**1. Toggle affichage des communes satellites**

Ajouter un state `showCommunes` (default `true`) et un bouton Switch dans la barre de contrôles en mode détail. Quand désactivé :
- Les marqueurs satellites et leurs arcs ne sont pas rendus
- Seul le parcours principal (captage → traitement → réservoir → commune) reste visible
- Le `fitBounds` ne prend en compte que les steps principaux

Le toggle sera un composant `Switch` avec label "Communes desservies" placé à côté du bouton retour.

**2. Optimisation des animations**

Trois améliorations de performance :

- **Réduire les points par arc** : passer de 50 à 25 points pour les arcs principaux, et de 30 à 15 pour les arcs satellites (qualité visuelle quasi identique)
- **Remplacer `setInterval` par `requestAnimationFrame`** avec throttle à ~10fps (100ms) au lieu de ~15fps (66ms) — réduit de 33% les appels `setPaintProperty`
- **Batch les mises à jour** : regrouper tous les `setPaintProperty` dans un seul frame RAF, et ne mettre à jour les arcs satellites que si `showCommunes` est actif

### Fichier modifié

| Fichier | Changement |
|---------|-----------|
| `src/components/TapWaterJourneyMap.tsx` | Ajout state `showCommunes` + Switch UI, optimisation animation RAF + réduction points arcs |

