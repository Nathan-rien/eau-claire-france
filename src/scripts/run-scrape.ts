import { createClient } from '@supabase/supabase-js';
import { normalizeScrapedItem } from "@/lib/normalize";
import { BRAND_CONFIG } from "@/config/brands";
import { ScrapeOptions } from "@/scrapers/types";

// Server-side Supabase client
const supabase = createClient(
  "https://xblogttmomuogdhmaztf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibG9ndHRtb211b2dkaG1henRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYwNTgsImV4cCI6MjA2NTk4MjA1OH0._CAQGXwo2ZJYmwvvstGJ2bnC65vT9fHcTyuXwgNalP8"
);

// Dynamic scraper imports (server-side only)
async function createScraper(retailerSlug: string) {
  try {
    switch (retailerSlug) {
      case 'carrefour':
        const { CarrefourScraper } = await import('@/scrapers/carrefour');
        return new CarrefourScraper();
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
      case 'casino':
        const { CasinoScraper } = await import('@/scrapers/casino');
        return new CasinoScraper();
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
}

export async function runScraping(config: ScrapingConfig) {
  const { retailers, brands, formats, maxPages, throttleMs } = config;

  console.log(`Starting scraping for ${retailers.length} retailers...`);

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
          retailerId: retailer.id
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
          .map(price => ({
            ...price,
            retailer_id: retailer.id,
            run_id: run.id
          }));

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

        // Calculate error rate
        const errorRate = result.items.length > 0 ? result.errors.length / result.items.length : 0;

        // Update run status
        const { error: updateError } = await supabase
          .from('runs')
          .update({
            status: errorRate > 0.5 ? 'failed' : errorRate > 0.2 ? 'partial' : 'success',
            finished_at: new Date().toISOString(),
            items_found: result.items.length,
            items_saved: itemsSaved,
            error_rate: errorRate,
            notes: result.errors.length > 0 ? JSON.stringify(result.errors) : null
          })
          .eq('id', run.id);

        if (updateError) {
          console.error(`Failed to update run for ${retailerSlug}:`, updateError);
        }

        console.log(`Completed scraping for ${retailerSlug}: ${itemsSaved}/${result.items.length} items saved`);

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
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const config: Partial<ScrapingConfig> = {};

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
    }
  }

  const defaultConfig: ScrapingConfig = {
    retailers: ['carrefour', 'auchan', 'leclerc', 'intermarche', 'coursesu', 'casino'],
    brands: BRAND_CONFIG.defaultQueries,
    formats: BRAND_CONFIG.defaultFormats,
    maxPages: 3,
    throttleMs: 1000
  };

  const finalConfig = { ...defaultConfig, ...config };

  runScraping(finalConfig).catch(error => {
    console.error('Scraping failed:', error);
    process.exit(1);
  });
}