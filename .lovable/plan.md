

## Mise a jour des donnees europeennes avec l'API DISCODATA et donnees 2024

### Constat apres recherche

1. **DISCODATA WISE_SOE fonctionne** : la base `[WISE_SOE].[latest].[Waterbase_T_WISE6_AggregatedData]` est accessible en JSON via SQL, contient des donnees jusqu'a 2023, et couvre les nitrates, plomb, pesticides et autres polluants.
2. **Couverture partielle** : seuls ~9 pays (AT, BE, CZ, DE, DK, ES, MT, RO, AL) ont rapporte des donnees pour 2021-2023. Les 18 autres pays n'ont pas encore soumis leurs donnees recentes.
3. **La DWD (Drinking Water Directive) n'est pas sur DISCODATA** : les donnees specifiques eau potable (conformite, violations) restent disponibles uniquement via les rapports de synthese de la Commission (cycle 2020-2022, publie en 2024).

### Strategie

- **Mettre a jour les CSV** avec `report_year=2024` (basé sur le rapport EEA "State of Water 2024" publié en octobre 2024, couvrant la période 2020-2022)
- **Integrer l'API DISCODATA** dans l'edge function pour enrichir les donnees de polluants en temps reel pour les pays disponibles
- **Strategie hybride** : API DISCODATA pour les polluants detailles (nitrates, plomb, pesticides par pays) + CSV mis a jour pour la conformite globale et les scores

### Fichiers a modifier

**1. `public/data/eu/wise_dwd_quality.csv`**
- Passer `report_year` de 2023 a 2024 pour tous les pays
- Ajuster les valeurs de conformite et violations selon le dernier rapport EEA 2024

**2. `public/data/eu/eu_pollutants_by_country.csv`**
- Passer `report_year` de 2023 a 2024
- Ajuster les valeurs selon les donnees EEA les plus recentes

**3. `supabase/functions/eu-water-quality/index.ts`**
- Remplacer le placeholder par un vrai proxy DISCODATA
- 2 endpoints :
  - `type=pollutants&country=XX` : requete SQL vers DISCODATA pour les polluants agreges par pays (nitrates, plomb, pesticides) pour 2021-2023
  - `type=countries` : liste des pays avec nombre d'echantillons disponibles
- Cache en memoire (Map) avec TTL 24h
- Timeout 15s sur les requetes DISCODATA
- Retourner `source: "discodata"` ou `source: "unavailable"` selon la reponse

**4. `src/services/europeWaterApi.ts`**
- Ajouter `fetchDiscodataPolluants(countryCode)` qui appelle l'edge function
- Enrichir `getEUPollutants()` : tenter DISCODATA d'abord pour les pays disponibles, fallback CSV
- Ajouter un champ `dataSource: 'api' | 'csv'` aux interfaces pour la transparence
- Ajouter `lastApiCheck` timestamp pour le DataFreshnessIndicator

### Requetes DISCODATA utilisees

```sql
-- Polluants par pays (2021-2023)
SELECT countryCode, observedPropertyDeterminandLabel,
       AVG(resultMeanValue) as avg_val, resultUom, COUNT(*) as samples
FROM [WISE_SOE].[latest].[Waterbase_T_WISE6_AggregatedData]
WHERE phenomenonTimeReferenceYear >= 2021
  AND resultMeanValue IS NOT NULL
  AND countryCode = '{CC}'
GROUP BY countryCode, observedPropertyDeterminandLabel, resultUom
```

### Impact utilisateur
- Les dates affichees passent de "2023" a "2024"
- Pour les pays avec donnees DISCODATA (AT, BE, CZ, DE, DK, ES, MT, RO), les polluants sont enrichis dynamiquement
- L'indicateur de fraicheur distinguera "API EEA" vs "Donnees CSV (rapport 2024)"

