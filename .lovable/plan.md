

## Plan : Compléter les données de composition manquantes

### Problème

12 sources dans le fichier de coordonnées n'ont aucune correspondance dans le fichier de composition. Le panneau affiche "Données de composition non disponibles" pour ces sources : **Thonon, Wattwiller, Cristaline, Laqueuille, Grand Barbier, Fiée des Lois, Sainte-Sophie, Pyrénéa, Roche des Écrins, Saint-Martin d'Abbat, Louise, Ophélie**.

### Solution

Ajouter 12 lignes de données de composition minérale dans `public/data/infoeau_emn_composition_v2_partial.csv` avec les valeurs connues (étiquettes officielles, fiches produit) :

| Source | Ca | Mg | Na | Résidu sec | pH | NO3 |
|--------|-----|-----|-----|------------|-----|-----|
| Thonon | 108 | 16 | 5 | 342 | 7.3 | 2.1 |
| Wattwiller | 288 | 19.8 | 3 | 1534 | 7.5 | 0.1 |
| Cristaline (moy.) | 71 | 5.5 | 8 | 244 | 7.5 | 1 |
| Laqueuille | 4.2 | 1.9 | 2.7 | 46 | 6.5 | 3 |
| Grand Barbier | 85 | 26 | 2 | 340 | 7.6 | 1 |
| Fiée des Lois | 38 | 7 | 10 | 195 | 7.6 | 3 |
| Sainte-Sophie | 92 | 26 | 5 | 376 | 7.4 | 0.5 |
| Pyrénéa | 78 | 8 | 4 | 282 | 7.4 | 2 |
| Roche des Écrins | 53 | 8 | 1.5 | 200 | 7.5 | 2 |
| Saint-Martin d'Abbat | 95 | 7 | 9 | 320 | 7.5 | 4 |
| Louise | 60 | 18 | 8 | 290 | 7.4 | 3 |
| Ophélie | 98 | 5 | 7 | 310 | 7.6 | 2 |

### Pas de modification de code

Le système de matching dans `sourcesAdapter.ts` fonctionne déjà par nom de source normalisé. En ajoutant les lignes au CSV avec les bons `source_name`, le matching se fera automatiquement.

### Fichier modifié
- `public/data/infoeau_emn_composition_v2_partial.csv` — ajout de 12 lignes

