# InfoEau - Configuration Environnement

## Variables BACKEND (Node.js/Edge Functions)
Variables serveur uniquement - **JAMAIS** côté client

```bash
SUPABASE_URL=https://xblogttmomuogdhmaztf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key-here...
```

## Variables FRONTEND (Vite/React)
Prefix `VITE_` **OBLIGATOIRE** pour exposition client

```bash
VITE_SUPABASE_URL=https://xblogttmomuogdhmaztf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key-here...
```

## Sécurité & Admin

```bash
# Token d'accès admin (générer un token fort et aléatoire)
ADMIN_DASHBOARD_TOKEN=change-me-to-a-very-long-random-secure-token-here

# Liste d'IPs autorisées pour l'admin (optionnel, CSV)
ADMIN_IP_ALLOWLIST=192.168.1.100,203.0.113.0/24
```

## Feature Flags PRODUCTION (sécurisé par défaut)

```bash
FF_ADMIN_UI=false
FF_DEBUG_ROUTES=false
FF_QUICKSTART=false
FF_SECURITY_HEADERS=true
FF_RATE_LIMITING=true
FF_AUDIT_LOGGING=true
FF_PUBLIC_TIMESERIES_API=true
```

## CORS & Origines

```bash
# Origines autorisées (CSV, pas de wildcard * en production)
ALLOWED_ORIGINS=https://infoeau.fr,https://www.infoeau.fr
```

## CRON & Automation

```bash
# Désactivé par défaut, activation via Security Dashboard uniquement
CRON_ENABLED=false
```

## Alertes & Monitoring (Optionnel)

```bash
# Webhook Slack/Discord pour alertes sécurité
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Données CSV Locales (Optionnel)

```bash
VITE_WATER_COMPO_CSV_URL=/data/infoeau_emn_composition_v2_partial.csv
VITE_WATER_CATALOG_CSV_URL=/data/infoeau_catalog_eaux_v3.csv
VITE_WATER_MDD_CSV_URL=/data/eaux_MDD_par_distributeur_et_source_FR_v3.csv
```

## ⚠️ Instructions de Sécurité CRITIQUES

1. **JAMAIS** exposer `SERVICE_ROLE_KEY` côté client (pas de prefix `VITE_`)
2. Générer un `ADMIN_DASHBOARD_TOKEN` fort (minimum 32 caractères aléatoires)
3. En production: `FF_DEBUG_ROUTES=false`, `FF_QUICKSTART=false`
4. CORS: jamais de wildcard `*`, uniquement domaines spécifiques
5. `CRON_ENABLED=false` tant que Security Smoke Test n'est pas PASS
6. Surveiller les logs d'audit pour tentatives d'intrusion

## ✅ Vérification Configuration

```bash
# Lancer tous les tests de sécurité
npm run security:smoke

# Vérifier configuration de sécurité
npm run harden:check

# Tester les politiques RLS Supabase
npm run rls:check
```

## 🔗 Accès Admin

1. Configurer `ADMIN_DASHBOARD_TOKEN`
2. Activer `FF_ADMIN_UI=true` (development uniquement)
3. Accéder à `/admin/security` avec le token
4. Lancer Security Smoke Test avant activation CRON