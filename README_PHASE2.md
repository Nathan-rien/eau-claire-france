# Phase 2: Production Water Pricing System

## Vue d'ensemble

Phase 2 étend le système de scraping des prix des eaux en bouteille avec :
- **17 enseignes actives** + 6 enseignes beta
- **Historisation complète** des données de prix
- **Monitoring qualité** automatisé
- **API time series** pour l'analyse temporelle
- **Exports CSV** automatiques
- **Cron séquencé** Europe/Paris

## Enseignes supportées

### Actives (17)
- Carrefour, Carrefour Market, Carrefour Drive
- Auchan, Auchan Supermarché  
- Leclerc
- Intermarché
- U Express
- Monoprix, Monoprix+
- Casino, Géant Casino
- Franprix
- Cora
- Match
- Chronodrive
- Houra

### Beta (6)
- Lidl, Aldi
- Greenweez, La Fourche
- Amazon Fresh FR
- Deliveroo Grocery

## Architecture technique

### Base de données
- `prices_history` : historique complet des prix
- `retailers` : étendu avec status 'beta'
- `runs` : métriques qualité (outliers_count, quality_score)

### APIs
- `/api/brand/:slug/timeseries` : courbes de prix temporelles
- `/api/quality/runs` : monitoring des runs
- Pagination et filtres étendus

### Qualité des données
- Détection automatique des outliers (0.05€ - 5.00€/L)
- Validation des formats (volumes standards)
- Reconnaissance des marques (11+ marques connues)
- Score qualité par run (0-1)

## Commandes CLI

### Smoke test standard
```bash
pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1
```

### Test élargi (6 enseignes)
```bash
pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,u_drive,monoprix --brands evian,cristaline,volvic --formats "50 cl,1 l,1,5 l" --maxPages 2
```

### Options CLI
- `--retailers` : liste des enseignes
- `--brands` : liste des marques  
- `--formats` : formats à rechercher
- `--maxPages` : pages max par query
- `--headful` : mode débogage (navigateur visible)
- `--dry-run` : simulation sans insertion DB

## Cron séquencé (Europe/Paris)

**06:20-10:20** : Scraping étalé par tranches de 15min
- 06:20 Carrefour → 06:35 Carrefour Market → etc.
- Évite la surcharge serveur
- Logs par run dans `/admin/runs`

## Pages admin

### /admin/runs
- Liste des runs avec métriques
- Statut temps réel (running/success/failed)
- Actions : Relancer, Pause/Resume enseigne

### /admin/quality  
- Anomalies par run (outliers, marques inconnues)
- Export CSV des problèmes
- Scoring qualité automatique

## Pages publiques améliorées

### /prix-eaux
- ✅ Filtres persistants (querystring)
- ✅ Badge "Promo" si is_promo
- ✅ Filtre disponibilité (en stock/tous)
- ✅ Pagination 50/100 items

### /marque/:slug
- ✅ Graphique €/L médian 7/30 jours
- ✅ Date dernière MAJ par enseigne
- ✅ Composition placeholder

### /comparateur-prix
- ✅ Mode "2 enseignes" : top 5 marques
- ✅ Mode "2 marques" : dispersion par enseigne

## Exports automatiques

### CSV temps réel
- `exports/prices_latest.csv` : derniers prix
- `exports/prices_history_YYYYMMDD.csv` : archive quotidienne
- UTF-8, en-têtes normalisés

## Monitoring & alertes

### Règles qualité
- **Score < 0.7** → Badge "Attention"  
- **Items = 0** → Badge "Critique"
- **Error rate > 30%** → Auto-pause + alerte

### Alertes (placeholder)
- Webhook configurable pour items_saved = 0
- Email pour 2 runs consécutifs vides
- Status auto 'paused' si problème persistant

## Tests

### Unitaires étendus
- `lib/normalize.ts` : 20+ cas (formats imbriqués, prix FR)
- `lib/quality.ts` : validation outliers/volumes/marques

### E2E fixtures
- Pages HTML anonymisées pour Carrefour/Auchan/Leclerc
- Tests extraction sans réseau
- Validation pipeline complet

## Validation manuelle

1. **Smoke test** → /admin/runs vert
2. **UI** → /prix-eaux filtrable, /marque/evian avec timeseries  
3. **Export** → CSV cohérents UTF-8
4. **Qualité** → /admin/quality sans outliers critiques

## Performance & légal

- **Throttle** : 1000-1500ms + jitter ±250ms
- **UA rotatif** : 5 User-Agents desktop stables  
- **Respect robots.txt** et CGU
- **Anti-ban passif** : timeouts progressifs, détection captcha

## Prochaines étapes

- Finaliser scrapers manquants (selectors robustes)
- Activer cron production
- Monitoring alertes en temps réel  
- Tests e2e sur fixtures HTML complètes