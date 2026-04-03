

## Enrichir les donnees de composition d'eau potable pour les 27 pays de l'UE

### Contexte

Les parametres demandes (durete totale, durete carbonatee, conductivite, nitrate, pH, calcium, magnesium, sodium, ammonium, chlorure, sulfate) sont des parametres physico-chimiques standards que la base WISE_SOE de l'AEE (Agence Europeenne pour l'Environnement) contient deja. La base DISCODATA est deja connectee via l'edge function `eu-water-quality`. Il suffit d'etendre cette infrastructure existante plutot que de scraper 27 sites nationaux differents.

### Architecture

```text
DISCODATA WISE_SOE (EEA)
        │
        ▼
 Edge Function eu-water-quality
 (nouveau endpoint ?type=composition)
        │
        ▼
 Table Supabase eu_water_composition
 (cache persistant, refresh quotidien)
        │
        ▼
 CSV baseline public/data/eu/
 (fallback si API indisponible)
        │
        ▼
 Service europeWaterApi.ts
 (nouvelle fonction getEUWaterComposition)
```

### Etapes

**1. Table Supabase `eu_water_composition`**

Stocke les donnees de composition par pays, avec colonnes : `country_code`, `parameter` (ex: "Calcium"), `avg_value`, `unit`, `samples_count`, `min_value`, `max_value`, `data_year`, `source` (discodata/csv), `updated_at`. Index sur `(country_code, parameter)`. RLS : lecture publique, ecriture service_role uniquement.

**2. Etendre l'edge function `eu-water-quality`**

Ajouter un endpoint `?type=composition&country=XX` (ou `country=all` pour les 27). La requete DISCODATA filtre sur les 11 determinands cibles via un `WHERE observedPropertyDeterminandLabel IN (...)` avec le mapping :

| Parametre demande | Determinand WISE_SOE |
|---|---|
| Durete totale | Total hardness |
| Conductivite | Electrical conductivity |
| Nitrate | Nitrate |
| pH | pH |
| Calcium | Calcium |
| Magnesium | Magnesium |
| Sodium | Sodium |
| Ammonium | Ammonium |
| Chlorure | Chloride |
| Sulfate | Sulphate |

La durete carbonatee sera calculee a partir du calcium et du magnesium si non disponible directement.

Resultats ecrits en cache dans la table `eu_water_composition` pour eviter de re-interroger DISCODATA a chaque requete. Cache en memoire 24h + persistance Supabase.

**3. CSV baseline `public/data/eu/eu_water_composition.csv`**

Fichier CSV genere a partir d'une premiere execution de l'edge function, servant de fallback. Format : `country_code,country_name,parameter,avg_value,unit,min_value,max_value,samples,data_year`.

**4. Service frontend `europeWaterApi.ts`**

Nouvelle fonction `getEUWaterComposition(countryCode?: string)` qui :
- Tente de lire depuis l'edge function (donnees fraiches)
- Fallback sur le CSV baseline
- Retourne un type `EUWaterComposition[]`

Aucune page existante n'est modifiee. Les donnees seront disponibles pour une future page ou un enrichissement des pages existantes.

**5. Endpoint de refresh (optionnel)**

Ajouter `?type=refresh-composition` (admin uniquement) pour forcer le re-scraping DISCODATA et la mise a jour de la table. Peut etre branche sur le cron existant.

### Ce qui ne change pas

- Aucune page existante modifiee
- Aucun composant existant modifie
- Les donnees CSV actuelles (pollutants, quality) restent intactes
- Le flux DISCODATA existant pour les polluants reste identique

### Details techniques

- La requete DISCODATA pour les 27 pays en une seule requete SQL (pas de boucle pays par pays) pour eviter les timeouts
- Timeout DISCODATA augmente a 30s pour cette requete plus lourde
- Les labels WISE_SOE peuvent varier legerement selon les pays ; le mapping inclura des variantes connues
- La table Supabase sert de cache persistant entre les cold starts de l'edge function

