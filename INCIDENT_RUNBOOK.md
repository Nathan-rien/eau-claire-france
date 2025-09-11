# Incident Runbook - Bottle Water Pricing

## Quick Response Guide

### 🚨 Critical Issues (Response within 1 hour)

#### Symptom: Zero items found across all retailers
**Immediate Actions:**
1. Check validation report: `cat VALIDATION_REPORT.md`
2. Run smoke test: `pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1`
3. Check /admin/quality for anomalies
4. If all retailers fail → likely infrastructure issue

**Root Causes:**
- Network connectivity issues
- Supabase database downtime  
- Major site redesigns across multiple retailers
- Anti-bot measures activated

#### Symptom: Error rate > 50% for multiple retailers
**Immediate Actions:**
1. Pause affected retailers: `node src/scripts/cron-scheduler.ts pause <retailer>`
2. Test in headful mode: `pnpm scrape --retailers <retailer> --brands evian --formats "1 l" --maxPages 1 --headful`
3. Check console for specific errors
4. Update selectors if needed (see SELECTORS.md)

### ⚠️ Warning Issues (Response within 4 hours)

#### Symptom: Single retailer consistently failing
**Diagnostic Steps:**
1. Check recent runs: Visit [/admin/runs](/admin/runs)
2. Review error messages in run notes
3. Test manual extraction:
   ```bash
   pnpm scrape --retailers <failing-retailer> --brands evian --formats "1,5 l" --maxPages 1 --headful
   ```
4. Inspect page source for structure changes

**Common Fixes:**
- Update CSS selectors in scraper file
- Adjust throttling (increase `throttleMs`)
- Handle new cookie banners/GDPR prompts
- Update pagination selectors

#### Symptom: Quality score < 0.7
**Investigation:**
1. Visit [/admin/quality](/admin/quality) 
2. Export anomalies CSV for analysis
3. Check for:
   - Price outliers (< 0.05€/L or > 5.00€/L)
   - Unknown brands (typos in extraction)
   - Invalid formats (parsing errors)

### 📊 Data Quality Issues

#### Outlier Prices Detection
**Automatic Monitoring:**
- Prices < 0.05€/L → Likely parsing error
- Prices > 5.00€/L → Likely bulk/wholesale products
- Sudden price jumps > 200% → Promotion extraction error

**Resolution Process:**
1. Identify outlier source via /admin/quality
2. Check raw product data in database
3. Fix normalization logic in `src/lib/normalize.ts`
4. Re-run affected retailer

#### Unknown Brands
**Common Issues:**
- Hépar vs Hepar (accent handling)
- Saint-Amand vs St Amand (abbreviations)
- Quézac vs Quezac (accent variations)

**Fix in `src/lib/normalize.ts`:**
```typescript
// Add brand mapping
const brandMapping = {
  'hepar': 'hépar',
  'st amand': 'saint-amand',
  'quezac': 'quézac'
};
```

### 🔧 Technical Recovery Procedures

#### Database Recovery
```bash
# Check recent runs
supabase db logs

# Reset failed runs  
UPDATE runs SET status = 'failed' WHERE status = 'running' AND started_at < NOW() - INTERVAL '2 hours';

# Clear stuck raw_products
DELETE FROM raw_products WHERE scraped_at < NOW() - INTERVAL '24 hours' AND run_id IN (SELECT id FROM runs WHERE status = 'failed');
```

#### Selector Updates (Emergency)
1. **Identify failing selectors** via headful mode
2. **Update scraper file** with new CSS selectors
3. **Test locally:**
   ```bash
   pnpm scrape --retailers <retailer> --brands evian --formats "1 l" --maxPages 1 --dry-run
   ```
4. **Deploy fix** and test with small run
5. **Resume retailer** if successful

#### CSV Export Recovery
```bash
# Manual CSV generation
node -e "
const { triggerAutoExport } = require('./src/utils/csvAutoExport.ts');
triggerAutoExport('latest').then(console.log).catch(console.error);
"

# Check export directory
ls -la exports/
```

### 📈 Monitoring & Alerts

#### Key Metrics to Monitor
- **Success Rate:** > 70% per retailer
- **Quality Score:** > 0.7 overall
- **Items Saved:** > 0 per successful run  
- **Error Rate:** < 30% per retailer
- **CSV Exports:** Generated after each successful run

#### Alert Thresholds
- **Critical:** 0 items found for > 2 hours
- **Warning:** Error rate > 50% for single retailer
- **Info:** Quality score drop below 0.8

#### Daily Health Check
```bash
# Run validation pipeline
node src/scripts/validation-pipeline.ts

# Check last 24h runs
Visit: /admin/runs?since=24h

# Verify CSV exports  
ls -la exports/prices_*$(date +%Y%m%d)*
```

### 🚀 Recovery Validation

#### After Incident Resolution
1. **Run smoke test** to verify fix
2. **Check quality metrics** in /admin/quality
3. **Verify CSV exports** are generating
4. **Resume paused retailers** if applicable
5. **Update runbook** with lessons learned

#### Post-Incident Steps
```bash
# Full system validation
node src/scripts/validation-pipeline.ts

# Resume normal operations if PASS
node src/scripts/cron-scheduler.ts run

# Monitor for 2 hours to ensure stability
watch -n 300 "tail -20 /var/log/scraping.log"
```

### 📞 Escalation Matrix

#### L1 Response (Self-Service)
- Single retailer failures
- Quality score warnings  
- CSV export delays

#### L2 Response (Technical)
- Multiple retailer failures
- Database connectivity issues
- Infrastructure problems

#### L3 Response (Critical)
- Complete system outage
- Data corruption issues
- Security incidents

### 📚 Reference Links

- **Admin Dashboard:** [/admin/runs](/admin/runs)
- **Quality Monitoring:** [/admin/quality](/admin/quality)  
- **Public Prices:** [/prix-eaux](/prix-eaux)
- **Brand Pages:** [/marque/evian](/marque/evian)
- **Technical Docs:** README_PRICING.md, SELECTORS.md
- **Cron Setup:** docs/CRON_SETUP.md

---
*Last Updated: 2024-12-10 | Next Review: 2024-12-17*