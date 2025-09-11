# Production Checklist - Bottle Water Pricing

## Pre-Production Validation ✅

### 1. CLI Harmonization
- [ ] ✅ All flags in English only: `--retailers`, `--brands`, `--formats`, `--maxPages`, `--headful`, `--since`, `--dry-run`, `--smoke`
- [ ] ✅ No French variants remaining in code
- [ ] ✅ Help command updated: `pnpm scrape --help`
- [ ] ✅ Documentation consistent across README_PRICING.md and README_PHASE2.md

### 2. Validation Pipeline
- [ ] ✅ Smoke test command: `pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1`
- [ ] ✅ Extended test command: `pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,coursesu,monoprix --brands evian,cristaline,volvic --formats "50 cl,1 l,1,5 l" --maxPages 2`
- [ ] ✅ Quality analysis with proper thresholds (score > 0.8)
- [ ] ✅ CSV export verification (latest + history)
- [ ] ✅ Automated cron activation only on PASS

### 3. UX & Admin Pages
- [ ] ✅ `/prix-eaux`: Persistent filters via URL, server-side sorting (€/L asc, date desc), "Promo" badges, "Maj" column (DD/MM HH:MM)
- [ ] ✅ `/marque/:slug`: Timeseries API, period selector (7/30 days), recent prices by retailer
- [ ] ✅ `/comparateur-prix`: 2 brands/2 retailers modes, min/median/max €/L, loading states
- [ ] ✅ `/admin/quality`: Anomalies list, outliers detection, unknown brands, quality score summary, CSV export

### 4. CSV Auto-Export
- [ ] ✅ After each successful run: `exports/prices_latest.csv`
- [ ] ✅ Daily history: `exports/prices_history_YYYYMMDD.csv`
- [ ] ✅ UTF-8 encoding, decimal separator ".", comma separator ","
- [ ] ✅ Exact headers: `retailer,brand,product_name,pack_count,unit_volume_l,total_volume_l,price_total_eur,price_per_l_eur,is_promo,promo_label,availability,sku,url,scraped_at`

### 5. E2E Tests & Fixtures
- [ ] ✅ Fixtures: `fixtures/{carrefour,auchan,leclerc}/search_eau_1_5l.html`
- [ ] ✅ E2E test: Load fixture → normalize → quality check → CSV export
- [ ] ✅ Extended normalize tests: parseFormat, parseEuro, guessBrand variants
- [ ] ✅ Tests pass: `npm test`

### 6. Documentation
- [ ] ✅ README_PRICING.md: Updated with validation pipeline
- [ ] ✅ README_PHASE2.md: Production activation procedures  
- [ ] ✅ docs/CRON_SETUP.md: Complete scheduler documentation
- [ ] ✅ docs/SELECTORS.md: Selector methodology and fallbacks
- [ ] ✅ INCIDENT_RUNBOOK.md: Emergency procedures and escalation

---

## Production Deployment 🚀

### Step 1: Execute Validation Pipeline
```bash
node src/scripts/validation-pipeline.ts
```

**Expected Output:**
- ✅ Smoke Test: 2/3 retailers successful, error rate < 30%
- ✅ Extended Test: 4/6 retailers successful, quality score > 0.8
- ✅ Quality Check: Overall quality > 0.7
- ✅ CSV Export: Both latest and history files generated
- ✅ Cron Activation: Configured for active retailers only
- ✅ Overall Status: **PASS**

### Step 2: Verify VALIDATION_REPORT.md
```bash
cat VALIDATION_REPORT.md
```

**Must Show:**
- Overall Status: ✅ PASS
- Summary metrics within acceptable ranges
- All validation steps marked as ✅ PASS
- Production readiness confirmed

### Step 3: Manual Verification (Optional)
```bash
# Test public pages
curl -s "http://localhost:5173/prix-eaux" | grep -q "prix"
curl -s "http://localhost:5173/marque/evian" | grep -q "evian"
curl -s "http://localhost:5173/admin/quality" | grep -q "quality"

# Check CSV exports
ls -la exports/prices_latest.csv
ls -la exports/prices_history_$(date +%Y%m%d).csv
```

### Step 4: Production Activation (Automatic)
If validation pipeline shows **PASS**, cron jobs are automatically configured.

**Manual override (if needed):**
```bash
# Activate cron schedule
node src/scripts/cron-scheduler.ts run

# Pause specific retailer if issues
node src/scripts/cron-scheduler.ts pause <retailer-slug>
```

---

## Post-Production Monitoring 📊

### Daily Health Checks
1. **Check validation status:** `cat VALIDATION_REPORT.md`
2. **Monitor runs:** Visit [/admin/runs](/admin/runs)
3. **Review quality:** Visit [/admin/quality](/admin/quality)
4. **Verify exports:** `ls -la exports/prices_*$(date +%Y%m%d)*`

### Key Metrics to Monitor
- **Success Rate:** > 70% per retailer
- **Quality Score:** > 0.7 overall  
- **CSV Exports:** Generated daily
- **Error Rate:** < 30% per retailer
- **Response Time:** < 5min per retailer

### Alert Conditions
- ❌ **Critical:** 0 items found for > 2 hours
- ⚠️ **Warning:** Error rate > 50% for single retailer  
- ℹ️ **Info:** Quality score < 0.8

---

## Incident Response 🚨

### Quick Reference
- **Pause retailer:** `node src/scripts/cron-scheduler.ts pause <slug>`
- **Resume retailer:** `node src/scripts/cron-scheduler.ts resume <slug>`
- **Debug mode:** `pnpm scrape --retailers <slug> --brands evian --formats "1 l" --maxPages 1 --headful`
- **Re-validate:** `node src/scripts/validation-pipeline.ts`

### Emergency Contacts
- **Technical Issues:** Check INCIDENT_RUNBOOK.md
- **Selector Updates:** See docs/SELECTORS.md
- **Admin Dashboard:** [/admin/runs](/admin/runs)
- **Quality Dashboard:** [/admin/quality](/admin/quality)

---

## Success Criteria Met ✅

- [x] **CLI harmonized** (English flags only)
- [x] **Validation pipeline** operational
- [x] **Public UX** finalized (filters, sorting, badges)
- [x] **Admin quality** monitoring active
- [x] **CSV exports** automated (latest + history)
- [x] **E2E tests** with fixtures
- [x] **Cron scheduling** with auto-activation
- [x] **Documentation** complete
- [x] **Incident procedures** documented

**🎉 SYSTEM READY FOR PRODUCTION 🎉**

---
*Generated: 2024-12-10 | Status: PRODUCTION READY*