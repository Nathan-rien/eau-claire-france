

## Enrichir les 3 sections editoriales — Animations et visuels

### Sections concernees

Les 3 encarts en bas de la homepage : Section A (risques robinet), Section B (eau en bouteille), Section C (surveiller la qualite).

### Modifications prevues

**Fichier : `src/pages/Index.tsx`**

**Section A — Risques eau du robinet (lignes 211-241)**
- Agrandir l'illustration : ajouter un cercle decoratif exterieur avec `animate-[spin_20s_linear_infinite]` (rotation lente)
- Ajouter 2 icones satellites supplementaires : `Skull` (microplastiques) et `FlaskConical` (residus chimiques) positionnees autour du cercle principal avec des delays d'animation differents
- Ajouter un effet de "ring" pulsant autour du cercle principal (`ring-4 ring-orange-200 animate-[pulse_4s_ease-in-out_infinite]`)

**Section B — Bien choisir son eau en bouteille (lignes 243-273)**
- Ajouter des icones satellites : `Heart` (sante), `Baby` (bebes), `Dumbbell` (sportifs) autour du cercle principal avec `animate-fade-in` et delays
- Ajouter un cercle decoratif exterieur avec bordure pointillee en rotation lente inverse
- Ajouter des "bulles" decoratives (petits cercles colores) flottant autour de l'illustration avec animation `animate-[bounce_3s_ease-in-out_infinite]`

**Section C — Surveiller la qualite (lignes 275-296)**
- Ajouter des icones decoratives autour du Shield central : `Search`, `Bell`, `Activity` en orbite
- Ajouter des cercles concentriques decoratifs derriere l'icone Shield (3 anneaux avec opacite decroissante et animation scale)
- Ajouter un fond avec des "particules" decoratives (divs absolues avec des formes rondes en opacite faible, positionnees aleatoirement)

### Imports a ajouter
`Heart`, `Baby`, `Dumbbell`, `FlaskConical`, `Bell`, `Activity` depuis `lucide-react`

### Fichier modifie
- `src/pages/Index.tsx` uniquement

