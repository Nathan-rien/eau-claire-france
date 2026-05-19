## Plan : Faire remonter Mont Roucous dans le profil Pureté

### Diagnostic
Mont Roucous **est bien chargée** (ligne 26 du CSV) et n'est pas exclue par les filtres. Mais le profil Pureté la pénalise sur 4 critères alors qu'elle est l'archétype de l'eau ultra-pure :

| Critère | Valeur Mont Roucous | Règle actuelle Pureté | Score actuel | Problème |
|---|---|---|---|---|
| pH | 5.8 | window 5.5 / 6.5 / 7.5 / 8.5 | 3/10 | pH bas = pureté, pas un défaut |
| Calcium | 2.4 mg/L | window 0 / 5 / 80 / 200 | 4.8/10 | Ca bas = pureté, pas un défaut |
| Magnésium | 0.5 mg/L | window 0 / 1 / 25 / 80 | 5/10 | Mg bas = pureté, pas un défaut |
| Bicarbonates | 6.3 mg/L | window 0 / 10 / 200 / 600 | 6.3/10 | HCO3 bas = pureté, pas un défaut |

Résultat : Mont Roucous score ~70/80 (rang ~5–10) au lieu d'être dans le top 3.

Cristaline Aurèle finit n°1 (79.8/80) car ses minéraux modérés tombent dans toutes les fenêtres "optimales".

### Correction

**Fichier : `src/utils/rankingV2.ts`** — profil `purity` uniquement.

1. **Remplacer les windows par `low-better`** pour Ca, Mg, HCO3 (le moins minéralisé = meilleur en pureté) :
   - calcium : `low-better` fullAt 30, zeroAt 200
   - magnesium : `low-better` fullAt 10, zeroAt 80
   - bicarbonates : `low-better` fullAt 50, zeroAt 600

2. **Élargir la fenêtre pH** vers le bas pour ne plus pénaliser les eaux légèrement acides (typiques des sources granitiques pures) :
   - pH : window 4.5 / 5.5 / 7.5 / 8.5

3. **Rééquilibrer les poids** pour vraiment valoriser les marqueurs de pureté (résidu sec + nitrates + sodium + fluorure) :
   - residu 16, nitrates 14, sodium 12, fluorure 8, sulfates 8, pH 4, calcium 4, magnésium 4, bicarbonates 4, potassium 2, chlorures 4 (total 80)

### Résultat attendu
- Mont Roucous : ~78–79/80 → **Top 3** (avec Montcalm et Rosée de la Reine)
- Cristaline Aurèle redescend légèrement (résidu 156 > optimum pureté)
- Le profil Pureté tient enfin sa promesse marketing affichée sur la page.

### Aucun autre profil n'est touché
La modification est strictement limitée au profil `purity`. Quotidien, Bébé, Sport, etc. restent inchangés.
