

## Intégration de l'API DISCODATA (EEA WISE_DWD) pour les données européennes

### Objectif
Remplacer les CSV statiques (`wise_dwd_quality.csv`, `eu_pollutants_by_country.csv`) par des appels a l'API DISCODATA de l'Agence Europeenne de l'Environnement, qui expose les donnees officielles de la Directive Eau Potable en JSON via des requetes SQL.

### Architecture

```text
Frontend (pages Europe)
    ↓
europeWaterApi.ts (service existant)
    ↓
Supabase Edge Function "eu-water-quality"
    ↓
discodata.eea.europa.eu/sql?query=...
    → JSON (données WISE_DWD)
```

### Fichiers a creer/modifier

**1. Creer `supabase/functions/eu-water-quality/index.ts`**
- Edge function proxy vers DISCODATA (gere CORS)
- 3 endpoints via query param `type`:
  - `national-summary` → requete SQL sur `[WISE_DWD].[latest].[DWD_NS]` : conformite globale par pays
  - `quality-info` → requete SQL sur `[WISE_DWD].[latest].[DWD_QI]` : parametres de qualite par pays (nitrates, pesticides, plomb, bacteries, PFAS...)
  - `non-compliance` → requete SQL sur `[WISE_DWD].[latest].[DWD_NCI]` : detail des non-conformites
- Cache en memoire avec TTL 24h (donnees mises a jour tous les 3 ans)
- Fallback sur les CSV statiques en cas d'echec API

**2. Modifier `src/services/europeWaterApi.ts`**
- Ajouter des fonctions `fetchFromDiscodata()` qui appellent l'edge function
- Conserver `getEUWaterQuality()` et `getEUPollutants()` comme interface publique
- Strategie : tenter l'API d'abord, fallback CSV si erreur
- Mapper les donnees DISCODATA vers les interfaces existantes (`EUCountryWaterQuality`, `EUPollutant`)

**3. Enrichir les CSV statiques comme fallback**
- Garder les fichiers CSV existants inchanges comme fallback fiable

**4. (Optionnel) Ajouter l'API WHO/Europe**
- Creer un second endpoint dans l'edge function pour les indicateurs sante/eau de l'OMS
- Donnees complementaires : acces a l'eau potable sure par pays, maladies hydriques
- Affichage dans la page diagnostic-europe

### Requetes SQL DISCODATA cles

```sql
-- Résumé national par pays
SELECT * FROM [WISE_DWD].[latest].[DWD_NS]

-- Qualité par paramètre et pays  
SELECT CountryCode, ParameterName, SamplesNumber,
       SamplesExceedingPV, ParametricValue, Unit
FROM [WISE_DWD].[latest].[DWD_QI]

-- Non-conformités
SELECT CountryCode, ParameterName, NonComplianceBeginDate,
       NCICause, NCIRemedialAction
FROM [WISE_DWD].[latest].[DWD_NCI]
```

### Impact
- Aucun changement d'interface utilisateur — les pages existantes (carte, classement, alertes, diagnostic) continuent de fonctionner avec les memes types de donnees
- Les donnees deviennent officielles et a jour au lieu de statiques
- Pas de cle API necessaire (DISCODATA est public et gratuit)

