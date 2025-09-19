import { Page, Browser } from 'playwright';
import { ScrapeOptions, ScrapeResult, ScrapedItem, RetailerSelectors } from './types';
import { parsePrice } from '@/lib/normalize';
// Debug helpers are dynamically imported where needed to keep browser bundle light

export abstract class BaseScraper {
  protected abstract selectors: RetailerSelectors;
  protected abstract searchUrl: string;
  protected abstract retailerName: string;

  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    const { queries, formats, maxPagesPerQuery = 3, throttleMs = 1000 } = options;
    const items: ScrapedItem[] = [];
    const errors: { step: string; message: string }[] = [];

    try {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch({ headless: !(options.headful), slowMo: options.slowMoMs || 0 });
      
      try {
        for (const query of queries) {
          for (const format of formats) {
            const searchQuery = `${query} ${format}`;
            console.log(`[${this.retailerName}] Searching for: ${searchQuery}`);

            try {
              const pageItems = await this.scrapeQuery(browser, searchQuery, maxPagesPerQuery, throttleMs);
              items.push(...pageItems);
            } catch (error) {
              console.error(`[${this.retailerName}] Error scraping ${searchQuery}:`, error);
              errors.push({
                step: `search_${searchQuery}`,
                message: error instanceof Error ? error.message : 'Unknown error'
              });
            }

            // Throttle between queries
            if (throttleMs > 0) {
              await new Promise(resolve => setTimeout(resolve, throttleMs));
            }
          }
        }
        // Category fallback if nothing found after all queries or very few results
        if (items.length < 5) {
          try {
            const added = await this.scrapeCategoryFallback(browser, options);
            items.push(...added);
            console.log(`[${this.retailerName}] Category fallback added ${added.length} items`);
          } catch (e) {
            console.error(`[${this.retailerName}] Category fallback failed`, e);
          }
        }
       } finally {
         await browser.close();
       }
    } catch (error) {
      console.error(`[${this.retailerName}] Browser setup error:`, error);
      errors.push({
        step: 'browser_setup',
        message: error instanceof Error ? error.message : 'Browser setup failed'
      });
    }

    return {
      retailer: this.retailerName,
      run_id: options.retailerId,
      items,
      errors
    };
  }

  protected async scrapeQuery(
    browser: Browser,
    query: string,
    maxPages: number,
    throttleMs: number
  ): Promise<ScrapedItem[]> {
    const page = await browser.newPage();
    const items: ScrapedItem[] = [];

    try {
      // Navigate to search page
      const searchUrl = this.searchUrl.replace('{query}', encodeURIComponent(query));
      await page.goto(searchUrl, { waitUntil: 'networkidle' });

      // Consent cookies and store selection (best-effort)
      try {
        const { acceptCookies, ensureStoreSelected, capture } = await import('./helpers/debug');
        // @ts-ignore options extended at runtime
        await acceptCookies(page as any, this.retailerName, options as any);
        // @ts-ignore options extended at runtime
        await ensureStoreSelected(page as any, this.retailerName, options as any);
        // @ts-ignore options extended at runtime
        if ((options as any).debug) await capture(page as any, this.retailerName, options as any, `search-${query}-p1`);
      } catch {}

      let currentPage = 1;
      let totalItems = 0;
      
      while (currentPage <= maxPages && totalItems < 100) { // Max 100 items per query
        console.log(`[${this.retailerName}] Scraping page ${currentPage} for query: ${query}`);

        try {
          // Wait for products to load
          await page.waitForSelector(this.selectors.productContainer, { timeout: 10000 });

          // Extract products from current page
          const pageItems = await this.extractProducts(page);
          items.push(...pageItems);
          totalItems += pageItems.length;

          console.log(`[${this.retailerName}] Found ${pageItems.length} items on page ${currentPage} (total: ${totalItems})`);

          try {
            const { logMetric, capture } = await import('./helpers/debug');
            // @ts-ignore options extended at runtime
            await logMetric(this.retailerName, options as any, { step: `query-${query}-p${currentPage}`, foundCount: pageItems.length, url: page.url() });
            // @ts-ignore options extended at runtime
            if ((options as any).debug) await capture(page as any, this.retailerName, options as any, `search-${query}-p${currentPage}`);
          } catch {}

          // If no items found, try pagination strategies
          if (pageItems.length === 0) {
            // Try scroll-based pagination
            await this.paginateByScroll(page, { iterations: 3, waitMs: 2000 });
            const scrollItems = await this.extractProducts(page);
            items.push(...scrollItems);
            totalItems += scrollItems.length;
            console.log(`[${this.retailerName}] Scroll pagination found ${scrollItems.length} additional items`);
          }

          // Try to go to next page
          if (currentPage < maxPages && this.selectors.nextPage && pageItems.length > 0) {
            const nextButton = await page.$(this.selectors.nextPage);
            if (nextButton) {
              await nextButton.click();
              await page.waitForTimeout(throttleMs);
              await page.waitForLoadState('networkidle');
              currentPage++;
            } else {
              console.log(`[${this.retailerName}] No more pages found`);
              break;
            }
          } else {
            break;
          }
        } catch (error) {
          console.error(`[${this.retailerName}] Error on page ${currentPage}:`, error);
          break;
        }
      }
    } finally {
      await page.close();
    }

    return items;
  }

  /**
   * Paginate by clicking next links
   */
  protected async paginateByLink(
    page: Page,
    nextSelectors: string[],
    maxPages: number = 5
  ): Promise<void> {
    let currentPage = 1;
    
    while (currentPage < maxPages) {
      // Try each next selector
      let nextClicked = false;
      
      for (const selector of nextSelectors) {
        try {
          const nextButton = await page.$(selector);
          if (nextButton) {
            const isDisabled = await nextButton.evaluate(el => 
              el.hasAttribute('disabled') || 
              el.classList.contains('disabled') ||
              el.getAttribute('aria-disabled') === 'true'
            );
            
            if (!isDisabled) {
              await nextButton.click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(1000); // Simple delay
              nextClicked = true;
              break;
            }
          }
        } catch (error) {
          // Try next selector
          continue;
        }
      }
      
      if (!nextClicked) {
        console.log('No more pages available');
        break;
      }
      
      currentPage++;
      // Debug capture would go here if needed
    }
  }

  /**
   * Paginate by infinite scroll
   */
  protected async paginateByScroll(
    page: Page,
    options: {
      iterations?: number;
      waitMs?: number;
      sentinel?: string;
    } = {}
  ): Promise<void> {
    const { iterations = 8, waitMs = 1200, sentinel } = options;
    
    for (let i = 0; i < iterations; i++) {
      const previousHeight = await page.evaluate(() => document.body.scrollHeight);
      
      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // Wait for content to load
      await page.waitForTimeout(waitMs);
      
      // Check if new content loaded
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      
      // If sentinel exists, check for it
      if (sentinel) {
        const sentinelExists = await page.$(sentinel);
        if (!sentinelExists) {
          console.log('Sentinel not found, stopping scroll');
          break;
        }
      }
      
      // If height didn't change, no more content
      if (newHeight === previousHeight) {
        console.log('No more content to load');
        break;
      }
      
      // Debug capture would go here if needed
    }
  }

  protected async extractProducts(page: Page): Promise<ScrapedItem[]> {
    const products = await page.$$(this.selectors.productContainer);
    const items: ScrapedItem[] = [];

    for (const product of products) {
      try {
        const item = await this.extractProduct(product, page);
        if (item) {
          items.push(item);
        }
      } catch (error) {
        console.error(`[${this.retailerName}] Error extracting product:`, error);
      }
    }

    return items;
  }

  protected async extractProduct(productElement: any, page: Page): Promise<ScrapedItem | null> {
    try {
      // Extract product name
      const nameElement = await productElement.$(this.selectors.productName);
      const productName = nameElement ? await nameElement.textContent() : null;
      if (!productName?.trim()) return null;

      // Extract price
      const priceElement = await productElement.$(this.selectors.priceTotal);
      const priceText = priceElement ? await priceElement.textContent() : null;
      const price = priceText ? parsePrice(priceText) : null;

      // Extract price per liter if available
      let pricePerL: number | null = null;
      if (this.selectors.pricePerL) {
        const pricePerLElement = await productElement.$(this.selectors.pricePerL);
        const pricePerLText = pricePerLElement ? await pricePerLElement.textContent() : null;
        pricePerL = pricePerLText ? parsePrice(pricePerLText) : null;
      }

      // Extract URL
      const urlElement = await productElement.$(this.selectors.productUrl);
      let url = '';
      if (urlElement) {
        const href = await urlElement.getAttribute('href');
        url = href ? (href.startsWith('http') ? href : new URL(href, page.url()).href) : '';
      }

      // Extract SKU if available
      let sku: string | null = null;
      if (this.selectors.sku) {
        const skuElement = await productElement.$(this.selectors.sku);
        sku = skuElement ? await skuElement.getAttribute('data-sku') || await skuElement.textContent() : null;
      }

      // Check for promotions
      let isPromo = false;
      let promoLabel: string | null = null;
      if (this.selectors.promoLabel) {
        const promoElement = await productElement.$(this.selectors.promoLabel);
        if (promoElement) {
          isPromo = true;
          promoLabel = await promoElement.textContent();
        }
      }

      // Check availability
      const addToCartButton = await productElement.$(this.selectors.addToCartButton);
      let availability: "in_stock" | "out_of_stock" | null = null;
      
      if (this.selectors.outOfStockIndicator) {
        const outOfStockElement = await productElement.$(this.selectors.outOfStockIndicator);
        availability = outOfStockElement ? "out_of_stock" : "in_stock";
      } else {
        availability = addToCartButton ? "in_stock" : "out_of_stock";
      }

      // Extract image if available
      let imageUrl: string | null = null;
      if (this.selectors.image) {
        const imageElement = await productElement.$(this.selectors.image);
        if (imageElement) {
          const src = await imageElement.getAttribute('src') || await imageElement.getAttribute('data-src');
          imageUrl = src ? (src.startsWith('http') ? src : new URL(src, page.url()).href) : null;
        }
      }

      return {
        product_name: productName.trim(),
        price_total_eur: price,
        price_per_l_eur: pricePerL,
        url,
        sku: sku?.trim() || null,
        is_promo: isPromo,
        promo_label: promoLabel?.trim() || null,
        availability,
        image_url: imageUrl
      };
    } catch (error) {
      console.error(`[${this.retailerName}] Error extracting product details:`, error);
      return null;
    }
  }

  protected async scrapeCategoryFallback(browser: Browser, options: any) {
    const items: ScrapedItem[] = [];
    try {
      const page = await browser.newPage();
      try {
        const { WATER_CATEGORIES } = await import('./config/categories');
        const retailerSlug = this.retailerName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const categoryConfig = WATER_CATEGORIES[retailerSlug];
        if (!categoryConfig) return items;
        
        console.log(`[${this.retailerName}] Using category fallback: ${categoryConfig.url}`);
        await page.goto(categoryConfig.url, { waitUntil: 'networkidle' });
        
        try {
          const { capture, logMetric } = await import('./helpers/debug');
          // @ts-ignore
          if (options?.debug) await capture(page as any, this.retailerName, options as any, 'category-fallback');
          await logMetric(this.retailerName, options as any, { step: 'category-opened', url: page.url() });
        } catch {}
        
        await page.waitForSelector(this.selectors.productContainer, { timeout: 10000 }).catch(() => {});
        
        // Apply pagination strategy based on config
        if (categoryConfig.paginationStrategy === 'scroll') {
          await this.paginateByScroll(page, { iterations: 5, waitMs: 2000 });
        } else if (categoryConfig.paginationStrategy === 'link' && this.selectors.nextPage) {
          await this.paginateByLink(page, [this.selectors.nextPage], 3);
        }
        
        const pageItems = await this.extractProducts(page);
        items.push(...pageItems);
        console.log(`[${this.retailerName}] Category fallback found ${pageItems.length} items`);
      } finally {
        await page.close();
      }
    } catch (error) {
      console.error(`[${this.retailerName}] Category fallback error:`, error);
    }
    
    // If still nothing, write NO_RESULTS report
    try {
      if (items.length === 0 && options?.debug) {
        const { logMetric } = await import('./helpers/debug');
        await logMetric(this.retailerName, options as any, { step: 'no-results' });
      }
    } catch {}
    return items;
  }
 }