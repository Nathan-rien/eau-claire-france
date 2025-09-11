# Validation Report - Production Deployment

**Generated:** 2025-09-11T00:00:00.000Z
**Overall Status:** ⚠️ PENDING

## Summary

This report will be generated automatically by the validation pipeline.
To generate the actual report, run:

```bash
node src/scripts/validation-pipeline.ts
```

## Validation Steps

The validation pipeline will execute the following steps:

### 1. Smoke Test (3 retailers)
**Command:** `pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1`
**Criteria:** 
- At least 2/3 runs successful
- Average error rate < 30%
- Items saved > 0

### 2. Extended Test (6 retailers)
**Command:** `pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,coursesu,monoprix --brands evian,cristaline,volvic --formats "50 cl,1 l,1,5 l" --maxPages 2`
**Criteria:**
- At least 4/6 runs successful
- Average error rate < 40%
- Average quality score > 0.6

### 3. Quality Check
**Validation:**
- Outliers analysis
- Unknown brands detection
- Volume format validation
- Overall quality score > 0.7

### 4. CSV Export
**Verification:**
- `exports/prices_latest.csv` generated
- `exports/prices_history_YYYYMMDD.csv` generated
- Proper UTF-8 encoding with BOM
- Decimal separator "." and comma separator ","

### 5. Cron Activation
**Schedule (Europe/Paris):**
- 06:20 carrefour
- 06:35 carrefour_market
- 06:50 auchan
- 07:05 leclerc
- 07:20 intermarche
- 07:35 coursesu
- 07:50 monoprix
- 08:05 casino
- 08:20 franprix
- 08:35 cora
- 08:50 match
- 09:05 chronodrive
- 09:20 houra

## Manual Testing Commands

```bash
# Complete validation pipeline
node src/scripts/validation-pipeline.ts

# Manual smoke test
pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1

# Manual extended test
pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,coursesu,monoprix --brands evian,cristaline,volvic --formats "50 cl,1 l,1,5 l" --maxPages 2

# Debug single retailer
pnpm scrape --retailers carrefour --brands evian --formats "1 l" --maxPages 1 --headful

# Help
pnpm scrape --help
```

## Pages to Test

- **Public:** [/prix-eaux](/prix-eaux), [/marque/evian](/marque/evian), [/comparateur-prix](/comparateur-prix)
- **Admin:** [/admin/runs](/admin/runs), [/admin/quality](/admin/quality)

## Production Readiness Checklist

- [ ] CLI harmonized (English flags only)
- [ ] Smoke test passes (3 retailers)
- [ ] Extended test passes (6 retailers)
- [ ] Quality monitoring active
- [ ] CSV exports automated
- [ ] UX filters persistent via URL
- [ ] Badge "PROMO" visible
- [ ] Date format JJ/MM HH:MM
- [ ] Server-side sorting (€/L asc, date desc)
- [ ] Pagination 50/100 items
- [ ] Cron jobs configured (ignores paused/beta)

---
*To complete validation, run: `node src/scripts/validation-pipeline.ts`*