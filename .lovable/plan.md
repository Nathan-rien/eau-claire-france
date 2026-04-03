

## Ajouter les villes manquantes à la carte parcours eau du robinet

### Constat

35 routes actuelles couvrent les grandes métropoles mais il manque ~15-20 agglomérations françaises significatives (préfectures/sous-préfectures de 50 000+ habitants ou villes côtières majeures).

### Nouvelles routes à ajouter (~18)

| Ville | Population | Captage type |
|-------|-----------|-------------|
| Pau | 77k | Gave de Pau |
| Bayonne | 52k | Nive/Adour |
| La Rochelle | 79k | Nappe du Cénomanien |
| Poitiers | 89k | Nappe du Clain |
| Nîmes | 151k | Source du Lez / BRL |
| Avignon | 92k | Canal de Provence / Durance |
| Valence | 65k | Rhône |
| Chambéry | 60k | Lac du Bourget |
| Dunkerque | 87k | Nappe d'Artois |
| Troyes | 62k | Seine amont |
| Saint-Nazaire | 72k | Loire |
| Lorient | 57k | Scorff |
| Vannes | 55k | Nappe de Noyalo |
| Quimper | 63k | Odet |
| Colmar | 70k | Nappe phréatique du Rhin |
| Ajaccio | 72k | Gravona |
| Bastia | 48k | Golo |
| Calais | 73k | Nappe de la Craie |

Chaque route suit la structure existante : 4 étapes (captage → traitement → réservoir → commune) + 3-5 communes satellites.

### Fichier modifié

| Fichier | Action |
|---------|--------|
| `src/data/tapWaterSources.ts` | Ajouter ~18 nouvelles routes avec communes satellites (~90 communes supplémentaires) |

### Impact

- Passage de 35 à ~53 routes
- Communes satellites : ~600 → ~690
- Taille fichier estimée : ~85 Ko (reste dans les limites de performance)
- Couverture : quasi-totalité des préfectures françaises métropolitaines + Corse

