

## Plan : Enrichir le diagnostic complet avec de nouveaux choix

### Vue d'ensemble
Ajouter 4 nouvelles dimensions au diagnostic complet : profils de sante supplementaires, preferences etendues, selection age/sexe, et consommation quotidienne. Les donnees de composition existantes (pH, bicarbonates ne sont pas dans le modele) limitent certains criteres, mais on peut enrichir significativement la logique avec les 5 mineraux disponibles (nitrates, sodium, calcium, magnesium, residu sec).

### Changements

#### 1. `src/data/waterProfiles.ts` — Nouveaux profils et preferences

**Nouveaux profils de sante** (ajouter a `userProfiles`) :
- **Diabete type 2** : magnesium eleve (min 30), sodium faible (max 20)
- **Insuffisance renale** : sodium strict (max 10), residu sec strict (max 500), calcium (max 100)
- **Allaitement** : calcium eleve (min 100), magnesium (min 25), nitrates faible (max 10)
- **Enfant 1-6 ans** : nitrates faible (max 15), sodium faible (max 20), residu sec (max 600)
- **Enfant 6-12 ans** : calcium (min 50), magnesium (min 15)
- **Regime cetogene / low carb** : sodium (min 30), magnesium (min 30) — compenser les pertes electrolytiques
- **Crampes musculaires** : magnesium (min 40), calcium (min 80)
- **Detox / drainage** : residu sec faible (max 300), sodium (max 10)
- **Retention d'eau** : sodium strict (max 10), residu sec (max 500)

**Nouvelles preferences** (ajouter a `userPreferences`) :
- **Riche en bicarbonates** : residu sec eleve (min 800) — proxy, car bicarbonates non modelise
- **Eco-responsable** : critere bonus dans le scoring (ecoscore A/B)
- **Budget serre** : critere bonus sur prix_moyen_litre < 0.30 euro/L
- **Eau tres mineralisee** : residu sec (min 1000)

**Nouvelles structures de donnees** :
- `AgeGroup` : `'bebe'|'enfant-1-6'|'enfant-6-12'|'adulte'|'senior'`
- `Gender` : `'homme'|'femme'|'autre'`
- `DailyConsumption` : `'1L'|'1.5L'|'2L'|'3L+'`

Exporter un objet `ageGenderModifiers` avec des ajustements de criteres par combinaison age/sexe (ex: femme senior → calcium priority boost).

#### 2. `src/services/waterRecommendationService.ts` — Scoring etendu

- Ajouter un parametre optionnel `context?: { age?: AgeGroup, gender?: Gender, dailyConsumption?: DailyConsumption }` a `calculateRecommendations`
- Appliquer des modificateurs de priorite selon age/sexe (ex: femme + senior → calcium priority x1.5)
- Ajouter un bonus eco-score si la preference "eco-responsable" est selectionnee
- Ajouter un bonus prix si la preference "budget serre" est selectionnee
- Ajouter dans les `reasons` des mentions contextuelles ("Adaptee a votre consommation de 2L/jour")
- La consommation quotidienne influence les warnings : a 3L+/jour une eau tres mineralisee merite un avertissement supplementaire

#### 3. `src/pages/QuelleEauBoire.tsx` — Nouvelle UI du diagnostic complet

Passer de 4 a 6 etapes :

1. **Type d'eau** (existant) — plate/gazeuse/toutes
2. **Votre profil** (existant, enrichi avec les nouveaux profils) — organiser en categories visuelles :
   - Situation de vie : Grossesse, Allaitement, Nourrisson, Enfant 1-6, Enfant 6-12
   - Sante : Hypertension, Diabete, Insuffisance renale, Calculs renaux, Osteoporose
   - Bien-etre : Sportif, Activite intense, Fatigue, Constipation, Crampes, Detox
   - Alimentation : Regime sans sel, Cetogene, Alcaline, Gout neutre, Eau pure
3. **NEW — Age et sexe** : selecteurs simples (boutons radio pour tranche d'age, boutons radio pour sexe)
4. **NEW — Consommation quotidienne** : slider ou boutons (< 1L, 1-1.5L, 1.5-2L, 2L+)
5. **Intolerances** (existant)
6. **Preferences** (existant, enrichi avec eco-responsable, budget, etc.)

#### 4. Mise a jour du bouton "Obtenir mes recommandations"
Passer le nouveau contexte (age, sexe, consommation) au service de recommandation.

### Fichiers modifies
- `src/data/waterProfiles.ts` — ~80 lignes (nouveaux profils, preferences, types)
- `src/services/waterRecommendationService.ts` — ~40 lignes (scoring etendu)
- `src/pages/QuelleEauBoire.tsx` — ~80 lignes (2 nouvelles etapes UI)

### Limites
- Les criteres fluor, sulfates, bicarbonates et pH ne sont pas exploitables car absents du modele de donnees `BottleWaterData` pour la plupart des bouteilles (seul pH est present mais pas dans `WaterCriteria`). On utilise des proxys (residu sec) quand pertinent.

