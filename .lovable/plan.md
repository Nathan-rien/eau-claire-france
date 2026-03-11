

## Mise à jour automatique quotidienne des prix via pg_cron

### Problème identifié

Les prix en base de données datent du **16 décembre 2025** (plus de 2 mois). Le workflow GitHub Actions corrigé ne s'exécute pas, probablement car :
- Les secrets GitHub (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) ne sont pas configurés dans le repository
- Ou le workflow Playwright échoue silencieusement en CI

### Solution proposee : pg_cron Supabase

Plutot que de dependre de GitHub Actions (qui necessite Playwright, des secrets, et un runner CI), on va utiliser **pg_cron** directement dans Supabase pour appeler l'Edge Function `admin-smoke` chaque matin a 6:00 UTC (7:00 Paris).

Cela fonctionne sans aucune infrastructure externe.

### Etapes

**1. Activer les extensions pg_cron et pg_net**

Ces extensions permettent a PostgreSQL de planifier des taches et de faire des appels HTTP.

**2. Creer le job pg_cron**

Un job SQL qui appelle l'Edge Function `admin-smoke` via `net.http_post` chaque jour a 6:00 UTC :

```text
cron.schedule(
  'daily-price-refresh',
  '0 6 * * *',   -- Chaque jour a 6:00 UTC (7:00 Paris)
  appel HTTP POST vers admin-smoke
)
```

**3. Lancer un premier appel immediat**

Pour mettre a jour les donnees tout de suite (sans attendre demain matin), on declenchera aussi l'Edge Function manuellement.

### Ce qui change

- Les prix seront regeneres automatiquement chaque matin a 7h00 (heure de Paris)
- Les dates `scraped_at` afficheront la date du jour
- La page `/prix-eaux` montrera des donnees fraiches
- Aucune dependance a GitHub Actions, Playwright, ou des secrets externes

### Limites

L'Edge Function `admin-smoke` genere des **donnees realistes simulees** (prix aleatoires dans des fourchettes credibles par marque). Ce n'est pas du vrai scraping de sites marchands. Pour du scraping reel, il faudrait faire fonctionner le workflow GitHub Actions avec les bons secrets. Mais pour l'affichage et la demonstration, le smoke test produit des donnees coherentes et a jour.

### Fichiers concernes

- Aucun fichier modifie : la configuration se fait via une requete SQL directe dans Supabase (pg_cron)
- L'Edge Function `admin-smoke` existante est utilisee telle quelle

