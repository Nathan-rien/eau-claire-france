

## Carte des polluants Europe

Creer une page `/carte-polluants-europe` qui reprend le meme modele que la version francaise (`/carte-polluants` + `PollutantMap.tsx`) mais avec les donnees EU du CSV `eu_pollutants_by_country.csv`.

### Fichiers a creer/modifier

**1. Creer `src/components/PollutantMapEurope.tsx`** — Nouveau composant base sur `PollutantMap.tsx`

- Carte Mapbox centree sur l'Europe (center: [10, 50], zoom: 3.5)
- Charger les donnees via `getEUPollutants()` et `getEUWaterQuality()` au mount
- Pour chaque pays, calculer un `riskLevel` a partir du `qualityScore` (A=low, B=medium, C=high)
- Marqueurs 32px uniformes, colores selon le risque (vert/jaune/rouge), avec le code pays
- Popup au clic montrant : nom du pays, niveau de risque, liste des polluants detectes avec valeur moyenne, limite et taux de depassement
- Hover : effet box-shadow (pas de transform)
- Sous la carte : grille de cards par pays avec badge de risque, polluants principaux, zones affectees, et alerte pour les pays a haut risque
- Legende identique a la version francaise (Faible / Modere / Eleve)

**2. Creer `src/pages/CartePolluantsEurope.tsx`** — Page wrapper

- Structure identique a `CartePolluants.tsx` : Layout, titre "Carte des polluants en Europe", description adaptee, puis `<PollutantMapEurope />`
- Navigation vers `/carte-europe`, `/polluants-europe`, `/diagnostic-europe`

**3. Modifier `src/App.tsx`**

- Ajouter le lazy import et la route `/carte-polluants-europe`

**4. Modifier `src/components/Navigation.tsx` et `src/components/Header.tsx`**

- Ajouter un lien vers `/carte-polluants-europe` dans le menu Europe (s'il existe) ou dans les cartes

