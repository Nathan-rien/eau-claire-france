import { createClient } from '@supabase/supabase-js';
import { normalizeScrapedItem } from "@/lib/normalize";
import { analyzeQuality } from "@/lib/quality";
import { triggerAutoExport } from "@/utils/csvAutoExport";
import { BRAND_CONFIG } from "@/config/brands";
import { ScrapeOptions } from "@/scrapers/types";
import type { Price } from "@/types/pricing";

// Server-side Supabase client (service role)
import { createServiceClient } from '@/integrations/supabase/serviceClient';
import fs from 'node:fs';
import path from 'node:path';

const supabase = (() => {
  try {
    return createServiceClient();
  } catch (e) {
    console.error('[FATAL] Missing SUPABASE_SERVICE_ROLE_KEY. Aborting scraping.');
    console.error('Hint: set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL in your environment.');
    process.exit(2);
  }
})();

// Dynamic scraper imports (server-side only)
async function createScraper(retailerSlug: string) {
  try {
    switch (retailerSlug) {
      case 'carrefour':
        const { CarrefourScraper } = await import('@/scrapers/carrefour');
        return new CarrefourScraper();
      case 'carrefour_market':
        const { CarrefourMarketScraper } = await import('@/scrapers/carrefour_market');
        return new CarrefourMarketScraper();
      case 'auchan':
        const { AuchanScraper } = await import('@/scrapers/auchan');
        return new AuchanScraper();
      case 'leclerc':
        const { LeclercScraper } = await import('@/scrapers/leclerc');
        return new LeclercScraper();
      case 'intermarche':
        const { IntermarcheScraper } = await import('@/scrapers/intermarche');
        return new IntermarcheScraper();
      case 'coursesu':
        const { CoursesScraper } = await import('@/scrapers/coursesu');
        return new CoursesScraper();
      case 'monoprix':
        const { MonoprixScraper } = await import('@/scrapers/monoprix');
        return new MonoprixScraper();
      case 'casino':
        const { CasinoScraper } = await import('@/scrapers/casino');
        return new CasinoScraper();
      case 'franprix':
        const { FranprixScraper } = await import('@/scrapers/franprix');
        return new FranprixScraper();
      case 'cora':
        const { CoraScraper } = await import('@/scrapers/cora');
        return new CoraScraper();
      case 'match':
        const { MatchScraper } = await import('@/scrapers/match');
        return new MatchScraper();
      case 'chronodrive':
        const { ChronodriveScraper } = await import('@/scrapers/chronodrive');
        return new ChronodriveScraper();
      case 'houra':
        const { HouraScraper } = await import('@/scrapers/houra');
        return new HouraScraper();
      default:
        throw new Error(`Unknown retailer: ${retailerSlug}`);
    }
  } catch (error) {
    console.error(`Failed to load scraper for ${retailerSlug}:`, error);
    return null;
  }
}

interface ScrapingConfig {
  retailers: string[];
  brands: string[];
  formats: string[];
  maxPages: number;
  throttleMs: number;
  headful?: boolean;
  dryRun?: boolean;
  smoke?: boolean;
  since?: string;
  debug?: boolean;
  slowMoMs?: number;
  debugDir?: string;
}

export async function runScraping(config: ScrapingConfig) {
  const { retailers, brands, formats, maxPages, throttleMs } = config;

  console.log(`Starting scraping for ${retailers.length} retailers...`);
  console.log(`Targets: ${retailers.join(', ')}`);
  let totalItemsSaved = 0;

  for (const retailerSlug of retailers) {
    console.log(`\n=== Starting scraping for ${retailerSlug} ===`);

    try {
      // Get retailer info
      const { data: retailer, error: retailerError } = await supabase
        .from('retailers')
        .select('*')
        .eq('slug', retailerSlug)
        .single();

      if (retailerError || !retailer) {
        console.error(`Retailer ${retailerSlug} not found:`, retailerError);
        continue;
      }

      // Ignore retailers that are paused or in beta (only process active)
      if (retailer.status !== 'active') {
        console.log(`Skipping retailer ${retailerSlug} due to status='${retailer.status}'`);
        continue;
      }

      // Create a new run
      const { data: run, error: runError } = await supabase
        .from('runs')
        .insert({
          retailer_id: retailer.id,
          status: 'running',
          started_at: new Date().toISOString(),
          items_found: 0,
          items_saved: 0,
          error_rate: 0
        })
        .select()
        .single();

      if (runError || !run) {
        console.error(`Failed to create run for ${retailerSlug}:`, runError);
        continue;
      }

      console.log(`Created run ${run.id} for ${retailerSlug}`);

      try {
        // Create scraper instance
        const scraper = await createScraper(retailerSlug);
        if (!scraper) {
          throw new Error(`No scraper found for ${retailerSlug}`);
        }

        // Prepare scraping options
        const options: ScrapeOptions = {
          queries: brands,
          formats,
          maxPagesPerQuery: maxPages,
           throttleMs,
           retailerId: retailer.id,
           debug: config.debug,
           headful: config.headful,
           slowMoMs: config.slowMoMs,
           debugDir: config.debugDir,
         };

        // Run scraping
        console.log(`Starting scrape with options:`, options);
        const result = await scraper.scrape(options);

        console.log(`Scraping completed. Found ${result.items.length} items, ${result.errors.length} errors`);

        // Store raw products
        const rawProducts = result.items.map(item => ({
          retailer_id: retailer.id,
          run_id: run.id,
          url: item.url,
          payload_json: item as any,
          scraped_at: new Date().toISOString()
        }));

        if (rawProducts.length > 0) {
          const { error: rawError } = await supabase
            .from('raw_products')
            .insert(rawProducts);

          if (rawError) {
            console.error(`Failed to store raw products for ${retailerSlug}:`, rawError);
          } else {
            console.log(`Stored ${rawProducts.length} raw products`);
          }
        }

        // Normalize and store prices
        const normalizedPrices = result.items
          .map(item => {
            try {
              return normalizeScrapedItem(item, retailerSlug, new Date().toISOString());
            } catch (error) {
              console.error(`Failed to normalize item:`, error, item);
              return null;
            }
          })
          .filter(Boolean)
          .map(price => {
            const p: any = { ...price };
            if ((p.price_per_l_eur === null || p.price_per_l_eur === undefined) && p.price_total_eur != null && p.total_volume_l != null && Number(p.total_volume_l) > 0) {
              p.price_per_l_eur = Math.round((Number(p.price_total_eur) / Number(p.total_volume_l)) * 10000) / 10000;
            }
            return {
              ...p,
              retailer_id: retailer.id,
              run_id: run.id
            };
          });

        let itemsSaved = 0;
        if (normalizedPrices.length > 0) {
          const { error: pricesError } = await supabase
            .from('prices')
            .upsert(normalizedPrices, {
              onConflict: 'retailer_id,unique_hash',
              ignoreDuplicates: false
            });

          if (pricesError) {
            console.error(`Failed to store prices for ${retailerSlug}:`, pricesError);
          } else {
            itemsSaved = normalizedPrices.length;
            console.log(`Stored ${itemsSaved} normalized prices`);
          }
        }
        totalItemsSaved += itemsSaved;

        // Calculate error rate
        const errorRate = result.items.length > 0 ? result.errors.length / result.items.length : 0;
        
        // Analyze quality on stored prices with proper Price objects
        let qualityReport = { quality_score: 1.0, outliers_count: 0, unknown_brands_count: 0 };
        if (itemsSaved > 0) {
          // Get full Price objects from database for quality analysis
          const { data: storedPrices } = await supabase
            .from('prices')
            .select('*')
            .eq('run_id', run.id);
          
          if (storedPrices && storedPrices.length > 0) {
            qualityReport = analyzeQuality(storedPrices as Price[]);
          }
        }
        
        // Determine final status
        const finalStatus = errorRate > 0.5 ? 'failed' : errorRate > 0.2 ? 'partial' : 'success';

        // Update run status with quality metrics
        const { error: updateError } = await supabase
          .from('runs')
          .update({
            status: finalStatus,
            finished_at: new Date().toISOString(),
            items_found: result.items.length,
            items_saved: itemsSaved,
            error_rate: errorRate,
            quality_score: qualityReport.quality_score,
            outliers_count: qualityReport.outliers_count,
            unknown_brands_count: qualityReport.unknown_brands_count,
            notes: result.errors.length > 0 ? JSON.stringify(result.errors) : null
          })
          .eq('id', run.id);

        if (updateError) {
          console.error(`Failed to update run for ${retailerSlug}:`, updateError);
        }

        console.log(`Completed scraping for ${retailerSlug}: ${itemsSaved}/${result.items.length} items saved`);
        
        // Auto-export si le run est success
        if (finalStatus === 'success' && itemsSaved > 0) {
          try {
            await triggerAutoExport(run.id);
          } catch (exportError) {
            console.error('Erreur lors de l\'export automatique:', exportError);
          }
        }

      } catch (scrapingError) {
        console.error(`Scraping failed for ${retailerSlug}:`, scrapingError);

        // Update run status to failed
        const { error: updateError } = await supabase
          .from('runs')
          .update({
            status: 'failed',
            finished_at: new Date().toISOString(),
            error_rate: 1,
            notes: scrapingError instanceof Error ? scrapingError.message : 'Unknown error'
          })
          .eq('id', run.id);

        if (updateError) {
          console.error(`Failed to update failed run for ${retailerSlug}:`, updateError);
        }
      }

    } catch (error) {
      console.error(`Fatal error for retailer ${retailerSlug}:`, error);
    }

    // Wait between retailers to be respectful
    if (throttleMs > 0) {
      console.log(`Waiting ${throttleMs}ms before next retailer...`);
      await new Promise(resolve => setTimeout(resolve, throttleMs));
    }
  }

  console.log('\n=== Scraping completed for all retailers ===');
  const smokeResult = {
    status: totalItemsSaved > 0 ? 'PASS' : 'FAIL',
    items_saved: totalItemsSaved,
    timestamp: new Date().toISOString()
  };
  try {
    fs.mkdirSync('exports', { recursive: true });
    fs.writeFileSync(path.join('exports', 'SMOKE_RESULT.json'), JSON.stringify(smokeResult, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write exports/SMOKE_RESULT.json:', e);
  }
  if (totalItemsSaved === 0) {
    console.error('SMOKE FAILED: 0 items saved. Check SERVICE_ROLE key, RLS policies, or selectors.');
    try {
      if ((defaultConfig.debug || (config.debug ?? false))) {
        fs.mkdirSync('debug', { recursive: true });
        fs.writeFileSync(path.join('debug', 'SMOKE_FAIL.txt'), `Retailers: ${finalConfig.retailers.join(', ')}\nBrands: ${finalConfig.brands.join(', ')}\nFormats: ${finalConfig.formats.join(', ')}\nSelectors: see scrapers config\n`, 'utf8');
        console.log('Debug artifacts written to ./debug');
      }
    } catch {}
    process.exit(2);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const config: Partial<ScrapingConfig> = {};

  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: pnpm scrape [options]

Options:
  --retailers <list>    Comma-separated retailer slugs (carrefour,auchan,leclerc...)
  --brands <list>       Comma-separated brand names (evian,cristaline,volvic...)
  --formats <list>      Comma-separated formats ("50 cl","1 l","1,5 l"...)
  --maxPages <number>   Maximum pages per query (default: 3)
  --throttle <ms>       Delay between requests in ms (default: 1000)
  --headful             Run in headful mode (default: false)
  --dry-run             Simulate run without saving data (default: false)
  --smoke               Quick smoke test mode (default: false)
  --since <date>        Only process items since date (YYYY-MM-DD)
  --help, -h            Show this help message

Examples:
  # Smoke test (3 retailers)
  pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1
  
  # Extended test (6 retailers)
  pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,coursesu,monoprix --brands evian,cristaline,volvic --formats "50 cl,1 l,1,5 l" --maxPages 2
  
  # Debug mode
  pnpm scrape --retailers carrefour --brands evian --formats "1 l" --maxPages 1 --headful
`);
    process.exit(0);
  }

  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--retailers':
        config.retailers = value.split(',');
        break;
      case '--brands':
        config.brands = value.split(',');
        break;
      case '--formats':
        config.formats = value.split(',');
        break;
      case '--maxPages':
        config.maxPages = parseInt(value);
        break;
      case '--throttle':
        config.throttleMs = parseInt(value);
        break;
      case '--headful':
        config.headful = true;
        i -= 1; // flag without value
        break;
      case '--dry-run':
        config.dryRun = true;
        i -= 1;
        break;
      case '--smoke':
        config.smoke = true;
        i -= 1;
        break;
      case '--since':
        config.since = value;
        break;
      case '--debug':
        config.debug = true;
        i -= 1;
        break;
      case '--slowMo':
        config.slowMoMs = parseInt(value);
        break;
      case '--debugDir':
        config.debugDir = value;
        break;
      case '--help':
      case '-h':
        // Already handled above
        break;
      default:
        console.error(`Unknown flag: ${flag}`);
        process.exit(1);
    }
  }

   const defaultConfig: ScrapingConfig = {
     retailers: ['carrefour', 'carrefour_market', 'auchan', 'leclerc', 'intermarche', 'coursesu', 'monoprix', 'casino', 'franprix', 'cora', 'match', 'chronodrive', 'houra'],
     brands: BRAND_CONFIG.defaultQueries,
     formats: BRAND_CONFIG.defaultFormats,
     maxPages: 3,
     throttleMs: 1000,
     debug: false,
     headful: false,
     slowMoMs: 0,
     debugDir: './debug'
   };

  const finalConfig = { ...defaultConfig, ...config };

  runScraping(finalConfig).catch(error => {
    console.error('Scraping failed:', error);
    process.exit(1);
  });
}