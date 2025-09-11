# Pricing Module (Phase 2) - Bottle Water Pricing

Production-ready module for scraping and comparing bottle water prices across French retailers.

## Quick Start

```bash
# Installation
pnpm install

# Smoke test (3 retailers)
pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1

# Extended test (6 retailers)
pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,coursesu,monoprix --brands evian,cristaline,volvic --formats "50 cl,1 l,1,5 l" --maxPages 2

# Help
pnpm scrape --help
```

## CLI - Available Options

```bash
# Main flags (English only)
--retailers    # Retailer slugs (carrefour,auchan,leclerc...)  
--brands       # Brand names (evian,cristaline,volvic...)
--formats      # Volume formats ("50 cl","1 l","1,5 l"...)
--maxPages     # Max pages per query (default: 3)

# Advanced flags
--throttle     # Delay between requests in ms (default: 1000)
--headful      # Run in visible mode (debug)
--dry-run      # Simulate without saving data
--smoke        # Quick smoke test mode
--since        # Date filter (YYYY-MM-DD)
--help, -h     # Show help message
```

## Production Commands

```bash
# Production validation pipeline
node src/scripts/validation-pipeline.ts

# Smoke test (3 retailers) - Quick validation
pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1

# Extended test (6 retailers) - Complete validation  
pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,coursesu,monoprix --brands evian,cristaline,volvic --formats "50 cl,1 l,1,5 l" --maxPages 2

# Debug mode (1 retailer visible)
pnpm scrape --retailers carrefour --brands evian --formats "1 l" --maxPages 1 --headful

# Simulation test (no data saved)
pnpm scrape --retailers carrefour,auchan --brands evian --formats "1,5 l" --maxPages 1 --dry-run
```

## 🏪 Supported Retailers

- Carrefour / Carrefour Market
- Auchan
- E.Leclerc
- Intermarché
- Système U (coursesu)
- Monoprix
- Casino
- Franprix
- Cora
- Supermarchés Match
- Chronodrive
- Houra

## 🏷️ Target Brands

Cristaline, Evian, Volvic, Hépar, Contrex, Vittel, Badoit, Perrier, Saint-Amand, Mont Roucous, Quézac

## 🚀 Development

### Environment Variables

```bash
# .env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TZ=Europe/Paris
```

### Database

Migrations are automatically applied. Tables created:
- `retailers` : Retail stores
- `runs` : Scraping history
- `raw_products` : Raw scraped data
- `prices` : Normalized prices
- `prices_history` : Price history

### Development Server

```bash
npm run dev
```

Available pages:
- `/prix-eaux` : Main price table
- `/marque/:slug` : Brand details
- `/comparateur-prix` : Price comparator
- `/admin/runs` : Admin dashboard
- `/admin/quality` : Quality monitoring

## 📊 API Endpoints

### Public

```bash
GET /api/retailers
GET /api/brands  
GET /api/prices?brand=evian&retailer=carrefour&format=1L&page=1&limit=20
GET /api/brand/evian/timeseries?days=30
```

### Admin (authenticated)

```bash
GET /api/runs
POST /api/scrape?retailer=carrefour
POST /api/retailers/carrefour/pause
POST /api/retailers/carrefour/resume
```

## 🔧 Testing

```bash
# Unit tests
npm test

# E2E tests with fixtures
npm test src/lib/__tests__/e2e.test.ts

# Normalization tests
npm test src/lib/__tests__/normalize.test.ts
```

## 📈 Monitoring & Quality

- Page `/admin/runs` : History and status
- Page `/admin/quality` : Quality monitoring
- Automatic CSV export after each successful run
- Quality scoring: outliers, unknown brands, error rates

## 📋 Production Validation

```bash
# Automated validation pipeline
node src/scripts/validation-pipeline.ts
```

This will:
1. Run smoke test (3 retailers)
2. Run extended test (6 retailers) if smoke passes
3. Analyze quality metrics
4. Verify CSV exports
5. Activate cron jobs if all tests pass
6. Generate VALIDATION_REPORT.md

## ⚖️ Compliance

- Respect robots.txt and Terms of Service
- Throttling 1000-1500ms between requests
- No anti-bot circumvention
- Pause capability on request
- User-Agent rotation for stability

## 🕐 Automated Scheduling

See `docs/CRON_SETUP.md` for configuration.

Cron sequence (Europe/Paris timezone):
```
06:20 carrefour      07:35 coursesu       08:50 match
06:35 carrefour_market  07:50 monoprix    09:05 chronodrive  
06:50 auchan         08:05 casino        09:20 houra
07:05 leclerc        08:20 franprix
07:20 intermarche    08:35 cora
```

## 📁 CSV Exports

Automatic exports after each successful run:
- `exports/prices_latest.csv` : Latest prices
- `exports/prices_history_YYYYMMDD.csv` : Daily archive

Format: UTF-8 with BOM, comma separator, decimal point "."

Headers:
```
retailer,brand,product_name,pack_count,unit_volume_l,total_volume_l,price_total_eur,price_per_l_eur,is_promo,promo_label,availability,sku,url,scraped_at
```