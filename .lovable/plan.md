## Plan : Faire de /classement un vrai comparateur d'eaux enrichi

### Objectif
Transformer la page en comparateur complet : Mont Roucous correctement valorisée, base de données enrichie (~100 eaux), sélection multi-eaux, filtres avancés, vue tableau triable, recherche et favoris.

---

### 1. Nouveau profil "Pureté / Bébé+" (scoring)

Fichier : `src/utils/rankingV2.ts`

Ajouter un profil `purity` qui valorise les eaux ultra-faiblement minéralisées :
- Résidu sec : optimum **10–150 mg/L** (Mont Roucous = 25 → score max)
- Sodium, nitrates, fluorure, sulfates : règles `low-better` strictes
- Exclusion : résidu sec > 500 mg/L
- Icône 💎 — description : "Eau ultra-pure, idéale bébé et usage quotidien léger"

Avec ce profil, Mont Roucous, Montcalm, Rosée de la Reine, Volvic atterriront dans le top 5.

### 2. Enrichir la base de données (~40 eaux supplémentaires)

Fichier : `public/data/infoeau_emn_composition_v2_partial.csv`

Ajouter en 3 vagues :
- **FR manquantes** : Courmayeur, Mont Blanc, Carola, Vals, Rosée de la Reine, Spa, St-Géron, St-Antonin, Vernière, Salvetat (variantes), Wattwiller variantes
- **Internationales premium** : San Pellegrino, Acqua Panna, Fiji, Highland Spring, Voss, Gerolsteiner, Apollinaris, Vittel International, Selters
- **MDD / économiques** : Cristaline (déjà), Auchan source, Carrefour source, Leclerc Eco+, Lidl Saskia, Monoprix Bio, Rozana variantes, Casino source

Sources : Wikipedia "Eaux minérales françaises", étiquettes officielles, fiches techniques producteurs. Marquer `source_url` pour traçabilité.

### 3. Refonte de la page en vrai comparateur

Fichier : `src/pages/Classement.tsx` + nouveaux composants

**Structure UI :**
```text
[ Header + sélecteur profil ]
[ Barre recherche  ★ Favoris  [Cartes|Tableau] ]
[ Filtres avancés (collapsible) :
  - Gazeuse/Plate  - Origine (FR/EU/Monde)
  - Sliders : minéralisation, calcium, sodium, pH, nitrates
  - MDD / Marque   - Exclure non-recommandées
]
[ Barre comparaison sticky : 0/5 sélectionnées → [Comparer] ]
[ Résultats : cartes OU tableau triable ]
[ Modal/section comparaison côte-à-côte ]
```

**Nouveaux composants :**
- `RankingFilters.tsx` : filtres avancés avec sliders Radix
- `RankingTableView.tsx` : tableau triable (rang, marque, score, lettre, 11 minéraux, gaz)
- `RankingViewToggle.tsx` : switch Cartes/Tableau
- `BottleCompareModal.tsx` : comparaison côte-à-côte de 2–5 eaux (mêmes barres que `BottleRankingCard` + tableau minéraux + recommandation textuelle)
- `RankingSearchBar.tsx` : input avec suggestions

**Hooks réutilisés** :
- `useFavorites` (existant) pour le système favoris
- `useWaterCompositions` (étendu pour exposer toutes les colonnes)

**État local** dans `Classement.tsx` :
- `selectedForCompare: string[]` (max 5)
- `viewMode: 'cards' | 'table'`
- `filters: { minRes, maxRes, minCa, maxNa, ... }`
- `search: string`
- `showFavoritesOnly: boolean`

### 4. Améliorations scoring globales

Dans `rankingV2.ts` :
- Valeur neutre actuelle pour donnée manquante = 5. La passer à 4 pour pénaliser légèrement les eaux sans données complètes (transparence)
- Ajouter `dataCompleteness` au retour de `scoreBottle` (déjà calculé dans la carte, le centraliser)
- Tri secondaire par complétude de données quand scores égaux

### Fichiers touchés
- `src/utils/rankingV2.ts` — nouveau profil `purity`, ajustements
- `public/data/infoeau_emn_composition_v2_partial.csv` — +40 lignes
- `src/hooks/useWaterCompositions.ts` — exposer tous les champs CSV
- `src/pages/Classement.tsx` — refonte
- `src/components/Ranking/RankingFilters.tsx` (nouveau)
- `src/components/Ranking/RankingTableView.tsx` (nouveau)
- `src/components/Ranking/BottleCompareModal.tsx` (nouveau)
- `src/components/Ranking/RankingSearchBar.tsx` (nouveau)
- `src/components/Ranking/RankingProfileSelector.tsx` — ajouter le profil purity
- `src/i18n/translations.ts` — clés nouveaux libellés

### Hors scope
- Pas de migration Supabase (les données restent en CSV statique)
- Pas de modification du système de prix
- Pas de changement aux autres pages (/comparatif-bouteilles reste tel quel)
