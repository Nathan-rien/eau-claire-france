# Phase 2 - Production Ready Bottle Water Pricing

## Phase 2 Objectives
- ✅ CLI harmonization (English flags only)
- ✅ Enhanced public UX (/prix-eaux, /marque/:slug, /comparateur-prix)
- ✅ E2E tests with fixtures (no network)
- ✅ Automated CSV exports (latest + history)
- ✅ /admin/quality page (monitoring)
- ✅ Scheduled cron (Europe/Paris)
- ✅ Automated validation pipeline

## Production Validation

```bash
# Complete validation pipeline
node src/scripts/validation-pipeline.ts

# Manual smoke test (3 retailers)
pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1

# Manual extended test (6 retailers)
pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,coursesu,monoprix --brands evian,cristaline,volvic --formats "50 cl,1 l,1,5 l" --maxPages 2
```

## Production Features

### /prix-eaux
- ✅ Persistent filters (URL querystring)
- ✅ Server-side sorting (€/L asc then date desc)
- ✅ Pagination 50/100 items
- ✅ "PROMO" badge for promotions
- ✅ "Maj" column format DD/MM HH:MM

### /marque/:slug  
- ✅ API /api/brand/:slug/timeseries?days=7|30
- ✅ Recent prices table by retailer
- ✅ Period selector with data refresh

### /comparateur-prix
- ✅ Mode A "2 brands", Mode B "2 retailers"
- ✅ Min/median/max €/L + product count
- ✅ Loading and empty states

## Admin & Quality Monitoring

### /admin/quality
- ✅ Anomalies list (outliers, invalid formats, unknown brands)
- ✅ CSV export for anomalies
- ✅ Summary: outliers_count, unknown_brands_count, quality_score

### Quality scoring algorithm  
- Base score: 1.0
- -0.2 if outliers_count > 5
- -0.2 if unknown_brands_count > 3  
- Minimum score: 0.4

## Automated Exports

After each successful run:
1. ✅ exports/prices_latest.csv (latest data)
2. ✅ exports/prices_history_YYYYMMDD.csv (daily dump)

Fixed CSV headers:
```
retailer,brand,product_name,pack_count,unit_volume_l,total_volume_l,price_total_eur,price_per_l_eur,is_promo,promo_label,availability,sku,url,scraped_at
```

Encoding: UTF-8 with BOM, decimal separator ".", comma separator ","

## E2E Testing

Network-free fixtures:
- ✅ fixtures/{carrefour,auchan,leclerc}/search_eau_1_5l.html
- ✅ Extended normalize tests (parseFormat, parseEuro, guessBrand)
- ✅ src/lib/__tests__/e2e.test.ts
- ✅ src/lib/__tests__/normalize.test.ts

```bash
# Run tests
npm test
```

## Automated Scheduling (Europe/Paris)

**🔒 Activation ONLY after validation pipeline PASS:**
```bash
# Activate cron (only if validation passes)
node src/scripts/cron-scheduler.ts run

# Pause/resume management
node src/scripts/cron-scheduler.ts pause <retailer>
node src/scripts/cron-scheduler.ts resume <retailer>
```

**Production Sequence (auto-excludes paused/beta):**
```
06:20 carrefour      07:35 coursesu       08:50 match
06:35 carrefour_market  07:50 monoprix    09:05 chronodrive  
06:50 auchan         08:05 casino        09:20 houra
07:05 leclerc        08:20 franprix
07:20 intermarche    08:35 cora
```

✅ Complete incident runbook: INCIDENT_RUNBOOK.md  
✅ Activation/pause procedures: docs/CRON_SETUP.md

## Phase 2 Deliverables

- ✅ CLI harmonized (English flags only)
- ✅ Public pages UX finalized
- ✅ /admin/quality operational  
- ✅ Automated exports (latest + history)
- ✅ E2E fixtures + unit tests
- ✅ Updated documentation
- ✅ Production validation pipeline

## Production Deployment

```bash
# MANDATORY: Automated validation and deployment
node src/scripts/validation-pipeline.ts
```

**⚠️ CRITICAL:** Cron jobs are activated **ONLY** if validation pipeline reports PASS status.

**Validation Flow:**
1. **Smoke Test** (3 retailers) → Must pass with < 30% error rate
2. **Extended Test** (6 retailers) → Must pass with quality score > 0.8  
3. **Quality Analysis** → Must achieve overall quality > 0.7
4. **CSV Export Verification** → Both latest and history files must generate
5. **Cron Activation** → Only proceeds if ALL previous steps pass

See VALIDATION_REPORT.md for detailed results and production readiness status.

## Supported Retailers (Production)

### Active (12)
- Carrefour, Carrefour Market
- Auchan
- E.Leclerc  
- Intermarché
- Système U (coursesu)
- Monoprix
- Casino
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

## Technical Architecture

### Database Schema
- `prices_history` : Complete price history
- `retailers` : Extended with status 'beta'
- `runs` : Quality metrics (outliers_count, quality_score)

### Quality System
- Automatic outlier detection (0.05€ - 5.00€/L)
- Format validation (standard volumes)
- Brand recognition (11+ known brands)
- Quality score per run (0-1)

### Performance & Legal
- **Throttle** : 1000-1500ms + jitter ±250ms
- **User-Agent rotation** : 5 stable desktop UAs  
- **Robots.txt compliance** and Terms of Service
- **Anti-ban passive** : progressive timeouts, captcha detection

## Validation Criteria

### Success Criteria
- ✅ Smoke test: 2/3 retailers successful, error rate < 30%
- ✅ Extended test: 4/6 retailers successful, error rate < 40%
- ✅ Quality score > 0.7
- ✅ CSV exports generated automatically
- ✅ UI filters persistent via URL
- ✅ Cron activated only if all tests pass

### Failure Handling
- ❌ Failed tests → No cron activation
- ❌ Quality issues → Admin alerts
- ❌ CSV export failures → Manual intervention required
- ❌ Selector failures → Retailer-specific fixes needed

## Next Steps (Post-Production)

1. Monitor /admin/quality for anomalies
2. Review CSV exports in exports/ folder  
3. Test public pages functionality
4. Activate production cron schedule
5. Set up alerting for critical failures
6. Performance optimization based on real usage