

## Créer la page /composition-europe

### Approche

Nouvelle page dédiée affichant un tableau comparatif interactif des 11 paramètres physico-chimiques pour les 27 pays de l'UE. Utilise `getEUWaterComposition()` existant. Style cohérent avec les autres pages Europe (ClassementEurope, DiagnosticEurope).

### Fonctionnalités

- **Tableau pivot** : lignes = pays (27), colonnes = paramètres (11). Valeurs moyennes avec unité.
- **Tri interactif** : clic sur l'en-tête de colonne pour trier par n'importe quel paramètre (asc/desc).
- **Filtre pays** : champ de recherche pour filtrer les pays affichés.
- **Coloration conditionnelle** : cellules colorées selon les seuils réglementaires (vert = OK, orange = proche limite, rouge = dépassement). Ex: nitrate > 50 mg/L = rouge, > 40 = orange.
- **Responsive** : sur mobile, le tableau scroll horizontalement avec la colonne pays sticky à gauche.
- **Détail au clic** : cliquer sur une ligne pays affiche min/max/échantillons sous la ligne.

### Fichiers modifiés

1. **`src/pages/CompositionEurope.tsx`** (nouveau) — Page principale avec tableau pivot, tri, filtre, coloration.
2. **`src/App.tsx`** — Ajouter lazy import + route `/composition-europe`.
3. **`src/utils/seoData.ts`** — Ajouter entrée SEO `compositionEurope`.

### Détails techniques

- Mapping PARAM_LABELS identique aux autres pages (Total hardness → Dureté totale, etc.)
- Seuils de coloration : `{ 'Nitrate': { warn: 40, danger: 50 }, 'pH': { warn: [6.5, 9.0], danger: [6.0, 9.5] }, ... }`
- Données pivotées en mémoire : groupBy countryCode, puis spread des paramètres en colonnes
- Tri sur `useState<string>` pour le paramètre actif + `sortAsc` boolean
- Filtre texte sur `countryName` avec `toLowerCase().includes()`

