

## Fix: marqueurs d'etapes cliquables et liens visuels source → etapes → magasins

### Problemes identifies

1. **Popups ne s'ouvrent pas** : ligne 256 fait `e.stopPropagation()` sur le click du marqueur, ce qui empeche Mapbox d'ouvrir le popup. Il faut appeler `marker.togglePopup()` manuellement dans le handler.

2. **Pas de lien visuel** : les marqueurs d'etapes flottent dans le vide sans connexion visuelle avec la source ni les communes. Il faut tracer une ligne reliant source → etapes → direction distribution.

### Corrections

**Fichier : `src/components/WaterJourneyMap.tsx`**

**Fix 1 — Rendre les popups cliquables** :
- Dans la boucle `JOURNEY_STEPS.forEach`, remplacer le `addEventListener('click', e => e.stopPropagation())` par un handler qui appelle `stepMarker.togglePopup()` apres creation du marqueur.

**Fix 2 — Tracer une ligne source → etapes** :
- Pour chaque source unique, generer une LineString passant par la source puis les 5 positions d'etapes (via `getStepPosition`).
- Ajouter une source GeoJSON `journey-steps-lines` et un layer `journey-steps-line` (ligne pointillee, toujours visible, couleur gradient bleu→vert, largeur 2px, opacite 0.5).
- Ce trait connecte visuellement la source aux etapes du processus.

**Fix 3 — Montrer les arcs source→communes par defaut (fond leger)** :
- Changer la visibilite initiale de `journey-arcs-bg` de `'none'` a `'visible'` pour qu'on voie toujours les lignes fines vers les communes.
- Garder le toggle "Communes desservies" pour afficher/masquer les marqueurs de communes ET la couche animee `journey-arcs-anim`.

Cela cree un flux visuel complet : source (bleu) → etapes (marqueurs colores relies par un trait) → communes (arcs legers toujours visibles, marqueurs verts au toggle).

