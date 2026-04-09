

## Plan : Corriger le déplacement des marqueurs au survol

### Diagnostic
Les marqueurs Mapbox utilisent `transform` en interne pour se positionner sur la carte. Le CSS actuel (ligne 118) applique `transition:transform .2s,box-shadow .2s`, ce qui interfère avec le repositionnement Mapbox : au hover, la transition sur `transform` provoque un glissement visuel vers le coin supérieur gauche.

### Correction — `src/components/PollutantMap.tsx`, ligne 118
Retirer `transform` de la transition et ne garder que `box-shadow`. Remplacer l'effet `scale` au hover par un changement de taille (`width`/`height`) ou simplement par le changement de `box-shadow` seul.

**Avant :**
```
transition:transform .2s,box-shadow .2s;
```
hover : `el.style.transform = 'scale(1.2)'`

**Après :**
```
transition:box-shadow .2s;
```
hover : retirer `el.style.transform = 'scale(1.2)'` et `el.style.transform = 'scale(1)'`, ne conserver que le changement de `box-shadow`.

### Fichier modifié
- `src/components/PollutantMap.tsx` — lignes 118, 121-122

