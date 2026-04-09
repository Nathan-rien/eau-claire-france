

## Plan : Remonter le plus loin possible dans l'historique des prix

### Problème racine

La **politique RLS** sur `prices_history` limite les SELECT aux 90 derniers jours :
```sql
Policy: prices_history_public_select_90d
Using: (scraped_at > (now() - '90 days'::interval))
```

Même avec `getBrandTimeseries(brand, 365)`, la base ne retourne que 90 jours. C'est le vrai bloqueur.

### Changements

#### 1. Migration SQL — Étendre la politique RLS à tout l'historique
Remplacer la politique `prices_history_public_select_90d` par une politique sans restriction temporelle (les données restent en lecture seule pour le public) :

```sql
DROP POLICY "prices_history_public_select_90d" ON public.prices_history;
CREATE POLICY "prices_history_public_select"
  ON public.prices_history FOR SELECT TO public
  USING (true);
```

#### 2. `src/services/timeseriesApi.ts` — Supporter `days = 0` (tout l'historique)
Si `days === 0`, ne pas appliquer le filtre `.gte('scraped_at', ...)` pour récupérer toutes les données disponibles.

#### 3. `src/pages/CoursEau.tsx` — Ajouter un sélecteur de période + passer à "Tout" par défaut
- Ajouter un état `brandPeriod` avec options : `"6m"` (180j), `"1y"` (365j), `"all"` (0j, défaut)
- Ajouter un `Select` à côté du sélecteur de marque
- Passer `brandPeriod` converti en jours à `getBrandTimeseries`
- Ajouter `brandPeriod` aux dépendances du `useEffect`

### Fichiers modifiés
- **Migration SQL** — 1 politique RLS (drop + create)
- `src/services/timeseriesApi.ts` — condition sur `days === 0` (~3 lignes)
- `src/pages/CoursEau.tsx` — état + sélecteur + dépendance (~15 lignes)

