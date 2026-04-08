
Plan : Stabiliser complètement les icônes sur la carte /carte-parcours-eau

Problème identifié
- `anchor: 'center'` est déjà en place sur les marqueurs.
- Le glissement visuel restant vient très probablement des transformations CSS appliquées aux éléments de marqueur eux-mêmes ou à des éléments internes sans cadre fixe :
  - le marqueur source utilise `hover:scale-110` directement sur l’élément racine du marker
  - les marqueurs industriels utilisent des `scale(...)` dynamiques sur `.industrial-inner`, mais sans normalisation explicite de la boîte et du point d’origine
- Sur une carte Mapbox, les marqueurs sont plus stables si l’élément racine reste “neutre” et que tous les effets visuels sont appliqués à un wrapper interne centré.

Fichier à modifier
- `src/components/WaterJourneyMap.tsx`

Approche
1. Neutraliser les transformations sur les racines des marqueurs
- Retirer les classes de scale/hover du conteneur racine des marqueurs source.
- Garder le root marker uniquement pour le positionnement Mapbox, sans animation visuelle.

2. Introduire un wrapper interne pour les sources
- Reprendre le même principe déjà utilisé pour les marqueurs industriels :
  - root `div` = ancrage/position
  - inner `div` = cercle + icône + hover + pulse éventuel
- Appliquer `hover:scale-*`, ombres et transitions uniquement sur ce wrapper interne.

3. Normaliser la géométrie des marqueurs industriels
- Donner au root marker industriel une boîte explicite et stable (largeur/hauteur minimales, display flex/center si nécessaire).
- Forcer `transform-origin: center center` sur `.industrial-inner`.
- Garder les effets `scale` et pulse uniquement sur `.industrial-inner`.

4. Vérifier la logique de highlight
- Conserver l’opacité sur le root si besoin.
- Conserver les `inner.style.transform = 'scale(...)'` seulement sur l’inner, jamais sur le root.
- Si nécessaire, remplacer le `transform` inline par des classes CSS dédiées pour éviter les conflits hover/animation.

5. Harmoniser tous les types de marqueurs
- Source marker
- Industrial marker
- Commune marker si un effet visuel lui est appliqué plus tard
- Objectif : même convention partout pour éviter les décalages pendant pan/zoom.

Résultat attendu
- Les icônes restent visuellement collées à leur point GPS pendant le déplacement de la carte.
- Les hover, pulses et mises en surbrillance restent fluides.
- Plus d’effet de “flottement” ou de léger décentrage lors du pan/zoom.

Détails techniques
```text
Structure cible

<Mapbox marker root>
  <div class="marker-root">      ← pas de scale ici
    <div class="marker-inner">   ← hover/pulse/scale ici
      icon
    </div>
  </div>
</Mapbox marker root>
```

Points clés
- `anchor: 'center'` conservé
- aucun `transform` sur l’élément racine du marker
- `transform-origin: center center` sur les éléments internes animés
- tailles fixes pour éviter les micro-variations visuelles
