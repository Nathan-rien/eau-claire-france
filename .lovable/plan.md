

## Plan : Enrichir la carte France `/carte` au niveau de la carte Europe

### Objectif
Aligner le niveau d'informations de la page `/carte` (France) sur celui de `/carte-polluants-europe` : légende des niveaux de risque, popups détaillées avec tableau de polluants par région, cartes pays/région avec badges risque, conformité, zones affectées.

### Écart actuel
- **Europe** : données riches (conformité %, 8-9 polluants par pays avec valeurs/limites/taux de dépassement, niveaux de risque, zones affectées)
- **France** : données mock basiques (6 régions avec note A-E, nombre de communes, alertes, source d'eau). Popups villes = nom + score + source uniquement.

### Modifications

**1. Créer un fichier de données régionales France**
`public/data/fr/fr_regions_quality.csv` — Données de qualité par région (13 régions métropolitaines) :
- `region_code, region_name, compliance_rate, nitrate_avg, quality_score, population_millions, communes, water_supply_zones`

`public/data/fr/fr_pollutants_by_region.csv` — Polluants détaillés par région (même structure que le CSV Europe) :
- `region_code, region_name, pollutant, category, avg_value, unit, limit_value, exceedance_rate_pct, affected_zones, report_year`
- Polluants couverts : Nitrates, Pesticides total, Plomb, PFAS, Trihalométhanes, Chlore résiduel, Bactéries coliformes, Microplastiques
- Données basées sur les ordres de grandeur réels Hub'Eau / ARS pour chaque région

**2. Créer un service de données France**
`src/services/franceWaterApi.ts` — Service miroir de `europeWaterApi.ts` :
- `getFRRegionQuality()` : charge le CSV qualité régionale
- `getFRPollutants()` : charge le CSV polluants régionaux
- Coordonnées centrales des 13 régions métropolitaines
- Types `FRRegionWaterQuality` et `FRRegionPollutant`

**3. Refondre `QualityMap.tsx`**
Réécrire le composant en s'inspirant directement de `PollutantMapEurope.tsx` :
- **Légende** : 3 niveaux de risque (Faible / Modéré / Élevé) avec pastilles colorées, comme la version Europe
- **Carte Mapbox** : Marqueurs ronds par région (32px, code région) colorés selon le risque. Popups riches avec :
  - Nom de la région, niveau de risque coloré, taux de conformité
  - Tableau de polluants (Polluant | Moy. | Limite | Dép.) identique à l'Europe
- **Grille de cartes régionales** : triées par risque décroissant, avec Badge risque, conformité %, polluants principaux (badges), zones affectées, alerte "Région à surveiller" pour les risques élevés
- Supprimer le toggle "sources d'eau" et la légende A-E devenue obsolète

**4. Adapter `InteractiveMap.tsx`** (optionnel)
Ce composant n'est plus utilisé directement si `QualityMap` intègre sa propre carte Mapbox avec les marqueurs régionaux. On peut le conserver pour d'autres usages mais `QualityMap` deviendra autonome.

**5. Mettre à jour `Carte.tsx`**
- Ajuster le titre/sous-titre pour refléter le contenu enrichi (qualité + polluants)
- Conserver le breadcrumb et le SEO existants

### Fichiers touchés
| Fichier | Action |
|---------|--------|
| `public/data/fr/fr_regions_quality.csv` | Créer |
| `public/data/fr/fr_pollutants_by_region.csv` | Créer |
| `src/services/franceWaterApi.ts` | Créer |
| `src/components/QualityMap.tsx` | Réécrire (modèle PollutantMapEurope) |
| `src/pages/Carte.tsx` | Ajuster titres |

### Résultat attendu
La page `/carte` affichera les 13 régions métropolitaines avec le même niveau de détail que la carte Europe : niveaux de risque, conformité, popups avec tableaux de polluants détaillés, et grille de cartes régionales triées par risque.

