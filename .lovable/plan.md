

## Plan : Animation séquentielle du parcours industriel au clic sur une source

### Concept

Quand l'utilisateur clique sur un marqueur source (avec le toggle industriel actif), une animation séquentielle se déclenche : les marqueurs industriels de cette source s'allument un par un (source → analyse → traitement → embouteillage → stockage → logistique), avec un "pulse" lumineux qui progresse le long des segments de liaison. La timeline en bas se synchronise.

### Fichier modifié
- `src/components/WaterJourneyMap.tsx`

### Modifications

**1. Nouvel état `animatingSource`**

```ts
const [animatingSource, setAnimatingSource] = useState<string | null>(null);
const animTimeoutRefs = useRef<number[]>([]);
```

**2. Modifier le handler de clic sur les marqueurs source (ligne ~261)**

Quand le toggle industriel est actif et qu'on clique sur une source :
- Stocker le `srcKey` dans `animatingSource`
- Lancer une séquence de `setTimeout` espacés de ~600ms
- À chaque étape : mettre en surbrillance le marqueur industriel correspondant (scale + pulse CSS), mettre à jour `activeStep` sur la timeline, et animer le segment de ligne entre l'étape précédente et l'étape courante
- À la fin de la séquence (après ~3.6s), revenir à l'état normal

**3. Animation des marqueurs industriels**

Chaque marqueur industriel reçoit un `data-source-key` en plus du `data-step-type` existant. Pendant l'animation :
- Les marqueurs de la source animée sont initialement en opacity 0.3
- Chaque étape fait passer le marqueur correspondant à opacity 1 + scale(1.4) + un ring animé (box-shadow pulse) via une classe CSS `.industrial-pulse`
- Les marqueurs des étapes précédentes restent à opacity 1 (état "déjà visité")

**4. Animation des lignes de liaison**

Ajouter un layer Mapbox supplémentaire `industrial-anim-line` qui dessine progressivement les segments au fur et à mesure de l'animation :
- À chaque étape de la séquence, ajouter le segment courant au GeoJSON source `industrial-anim-lines`
- Le layer utilise une ligne pleine (pas pointillée), plus épaisse (width 3), avec la couleur du segment et une opacity de 0.8
- À la fin de l'animation, supprimer ce layer et revenir aux pointillés normaux

**5. Synchronisation timeline**

Pendant l'animation, `activeStep` est mis à jour automatiquement (0→1→2→3→4→5) à chaque intervalle, ce qui met en surbrillance l'étape correspondante dans la frise chronologique en bas.

**6. Classe CSS `.industrial-pulse`**

Ajouter dans le style inline ou via le DOM :
```css
.industrial-pulse .industrial-inner {
  animation: industrialPulse 0.6s ease-out;
}
@keyframes industrialPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 currentColor; }
  50% { transform: scale(1.4); box-shadow: 0 0 0 8px transparent; }
  100% { transform: scale(1.2); box-shadow: 0 0 0 0 transparent; }
}
```

**7. Nettoyage**

- Un nouveau clic sur une autre source relance l'animation (annule les timeouts précédents via `animTimeoutRefs`)
- Cliquer ailleurs ou désactiver le toggle annule l'animation en cours
- Changer de distributeur annule aussi l'animation

### Résultat attendu
- Clic sur une source → les étapes s'illuminent une à une avec un effet pulse, les lignes se dessinent progressivement, la timeline se synchronise
- Animation fluide de ~3.6s (6 étapes × 600ms)
- Pas d'interférence avec le survol de la timeline (qui reste fonctionnel après l'animation)

