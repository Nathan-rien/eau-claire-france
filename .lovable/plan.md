

## Plan : Afficher le prix du robinet en €/L (au lieu de €/m³)

### Contexte
Le hero de la page `/cours-eau` affiche le prix du robinet en €/m³ (4.34 €/m³). L'utilisateur veut une cohérence avec l'eau en bouteille, donc tout en €/L.

4.34 €/m³ = 0.00434 €/L → affiché comme **0.004 €/L** (3 décimales).

### Modifications

**Fichier : `src/pages/CoursEau.tsx`**

1. **Hero card robinet (ligne ~260-308)** : Convertir `latestTap` de €/m³ en €/L (÷1000), adapter le counter pour 3 décimales, changer le suffixe de `€/m³` à `€/L`.

2. **Onglet "robinet" — titre du graphique (ligne ~383)** : Changer "Prix moyen eau du robinet (€/m³)" → "Prix moyen eau du robinet (€/L)".

3. **Axe Y du graphique robinet (ligne ~397)** : Diviser les valeurs par 1000 dans le `tickFormatter` ou transformer les données, pour afficher en €/L.

4. **Tooltip robinet (ligne ~398)** : Passer `unit="€/L"` au lieu de `"€/m³"`.

**Fichier : `src/data/waterPriceHistory.ts`**

5. **Optionnel** : Soit convertir les données source `tapPriceHistory` en €/L directement (diviser chaque `price` par 1000), soit faire la conversion côté affichage. La conversion côté données est plus propre pour éviter des divisions répétées.

### Approche retenue
Convertir les données `tapPriceHistory` en €/L directement dans le fichier source, et adapter tous les labels/tooltips en conséquence. Cela simplifie le code d'affichage.

