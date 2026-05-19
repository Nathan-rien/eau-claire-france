# Filtrer le classement par marché (France vs Europe)

## Problème
Le CSV `infoeau_emn_composition_v2_partial.csv` contient 103 eaux mélangeant :
- eaux françaises (Évian, Volvic, Mont Roucous…)
- eaux internationales vendues en France (San Pellegrino, Perrier, Acqua Panna, Voss…)
- eaux internationales **non** distribuées sur le marché français (ex. Apollinaris, Selters, Highland Spring, Fiji selon les cas)
- eaux régionales/confidentielles peu présentes en GMS française

Aujourd'hui `/classement` affiche tout, indépendamment du `RegionContext` (FR/EU dans le header).

## Objectif
Quand l'utilisateur est en région **France**, n'afficher que les eaux **réellement disponibles sur le marché français** (GMS, spécialisé, e-commerce mainstream). En région **Europe**, garder le catalogue complet.

## Approche

### 1. Ajouter un champ `available_fr` au CSV
Nouvelle colonne booléenne `available_fr` dans `public/data/infoeau_emn_composition_v2_partial.csv`.

Règle de curation :
- `true` : toutes les marques distribuées nationalement en France (Évian, Volvic, Contrex, Hépar, Vittel, Cristaline, Mont Roucous, Montcalm, Perrier, Badoit, Salvetat, Quézac, Saint-Yorre, Vichy Célestins, Wattwiller, Plancoët, Thonon, Courmayeur, San Pellegrino, Acqua Panna, Voss, Fiji, Spa, Gerolsteiner, Rozana, Arvie, Chateldon, Orezza, Saint-Géron, Mont Blanc, La Cairolle, MDD Auchan/Carrefour/Leclerc/Lidl/Monoprix/Casino/Intermarché, Laqueuille, Pyrénéa…)
- `false` : eaux très régionales ou non commercialisées en France (Hydroxydase, Amanda, Nessel, Apollinaris, Selters, Highland Spring, Reine des Basaltes, Faustine, César, Aizac, Arcens, Le Vernet, Puits Saint-Georges, Cilaos, La Française, Prince Noir, Celtic/La Liese, Luchon, Chambon, Alizée, Biovive, Vals, Rosée de la Reine, Saint-Antonin, Aix-les-Bains, Abatilles selon vérification…)

### 2. Lecture dans le hook
`src/hooks/useWaterCompositions.ts` : parser `available_fr` et l'exposer sur `WaterSource` (`available_fr: boolean`, défaut `true` si colonne absente pour rétro-compat).

### 3. Filtrage dans `Classement.tsx`
- Importer `useRegion` depuis `@/contexts/RegionContext`.
- Dans le `useMemo` `filtered`, si `isFrance`, exclure les eaux dont `available_fr === false`.
- Mettre à jour le compteur header (« X eaux comparées ») pour refléter le contexte régional.
- Ajouter un petit indicateur près du compteur : « Marché français » / « Catalogue Europe » lié au `RegionSwitcher` du header.

### 4. Aucun impact sur `ClassementEurope.tsx`
Cette page reste sur les données européennes (`eu_water_composition.csv`), pas touchée.

## Fichiers modifiés
- `public/data/infoeau_emn_composition_v2_partial.csv` (ajout colonne + valeurs)
- `src/hooks/useWaterCompositions.ts` (parse + expose `available_fr`)
- `src/pages/Classement.tsx` (filtre selon `useRegion()`, badge indicateur)

## Question ouverte
La curation `available_fr` repose sur une connaissance marché. Je proposerai une liste explicite dans le PR pour relecture, marquant comme `true` toutes les marques nationales + internationales premium courantes en GMS française, et `false` les eaux confidentielles ou étrangères absentes du marché FR.
