#!/usr/bin/env node

/**
 * Coverage report script - tests scraping across multiple retailers
 * Generates detailed metrics and identifies bottlenecks
 */

import fs from 'fs';
import path from 'path';
import { SCRAPERS } from '../scrapers';
import { createServiceClient } from '../integrations/supabase/serviceClient';
import { filterProduct, generateWaterQueries } from '../lib/productFilters';

interface RetailerMetrics {
  retailer: string;
  pages_visited: number;
  queries_tried: string[];
  productCard_counts_per_page: number[];
  items_found: number;
  items_saved: number;
  error_rate: number;
  consent_clicked: boolean;
  store_selected: boolean;
  category_fallback_used: boolean;
  first_5_titles: string[];
  duration_ms: number;
  errors: string[];
}

interface CoverageReport {
  timestamp: string;
  total_retailers: number;
  successful_retailers: number;
  total_items_found: number;
  total_items_saved: number;
  overall_error_rate: number;
  metrics: RetailerMetrics[];
  summary: {
    retailers_with_results: string[];
    retailers_failed: string[];
    top_performers: string[];
    recommendations: string[];
  };
}

const TARGET_RETAILERS = [
  'carrefour',
  'carrefour_drive', 
  'auchan',
  'auchan_super',
  'leclerc',
  'intermarche',
  'u_drive',
  'monoprix'
];

const TEST_CONFIG = {
  maxPages: 2,
  formats: ['50 cl', '1 l', '1,5 l'],
  brands: ['evian', 'cristaline', 'volvic', 'hepar', 'contrex', 'vittel', 'perrier', 'badoit', 'mont roucous', 'saint-amand', 'quezac'],
  slowMo: 100,
  debug: true
};

class CoverageReporter {
  private debugDir: string;
  private supabase: any;

  constructor() {
    this.debugDir = path.join(process.cwd(), 'debug');
    this.supabase = createServiceClient();
    
    // Ensure debug directory exists
    if (!fs.existsSync(this.debugDir)) {
      fs.mkdirSync(this.debugDir, { recursive: true });
    }
  }

  async runCoverageTest(): Promise<CoverageReport> {
    console.log('🔍 Starting coverage test across retailers...\n');
    
    const report: CoverageReport = {
      timestamp: new Date().toISOString(),
      total_retailers: TARGET_RETAILERS.length,
      successful_retailers: 0,
      total_items_found: 0,
      total_items_saved: 0,
      overall_error_rate: 0,
      metrics: [],
      summary: {
        retailers_with_results: [],
        retailers_failed: [],
        top_performers: [],
        recommendations: []
      }
    };

    // Test each retailer
    for (const retailerSlug of TARGET_RETAILERS) {
      console.log(`\n📊 Testing ${retailerSlug}...`);
      
      const metrics = await this.testRetailer(retailerSlug);
      report.metrics.push(metrics);
      
      // Update totals
      report.total_items_found += metrics.items_found;
      report.total_items_saved += metrics.items_saved;
      
      if (metrics.items_saved > 0) {
        report.successful_retailers++;
        report.summary.retailers_with_results.push(retailerSlug);
      } else {
        report.summary.retailers_failed.push(retailerSlug);
      }
      
      // Log progress
      console.log(`  ✅ Found: ${metrics.items_found}, Saved: ${metrics.items_saved}, Pages: ${metrics.pages_visited}`);
    }

    // Calculate overall error rate
    const totalErrors = report.metrics.reduce((sum, m) => sum + (m.error_rate || 0), 0);
    report.overall_error_rate = totalErrors / report.metrics.length;

    // Generate recommendations
    this.generateRecommendations(report);

    // Save reports
    await this.saveReports(report);

    // Display summary table
    this.displaySummaryTable(report);

    return report;
  }

  private async testRetailer(retailerSlug: string): Promise<RetailerMetrics> {
    const startTime = Date.now();
    const metrics: RetailerMetrics = {
      retailer: retailerSlug,
      pages_visited: 0,
      queries_tried: [],
      productCard_counts_per_page: [],
      items_found: 0,
      items_saved: 0,
      error_rate: 0,
      consent_clicked: false,
      store_selected: false,
      category_fallback_used: false,
      first_5_titles: [],
      duration_ms: 0,
      errors: []
    };

    try {
      const ScraperClass = SCRAPERS[retailerSlug];
      if (!ScraperClass) {
        metrics.errors.push(`No scraper found for ${retailerSlug}`);
        return metrics;
      }

      // Get retailer info from DB
      const { data: retailer } = await this.supabase
        .from('retailers')
        .select('*')
        .eq('slug', retailerSlug)
        .single();

      if (!retailer) {
        metrics.errors.push(`Retailer ${retailerSlug} not found in database`);
        return metrics;
      }

      // Initialize scraper with debug config
      const config = {
        ...TEST_CONFIG,
        debug: true,
        debugDir: this.debugDir,
        headless: true
      };

      const scraper = new ScraperClass();

      // Generate test queries (limited for speed)
      const allQueries = generateWaterQueries();
      const testQueries = allQueries.slice(0, 10); // Limit for coverage test
      metrics.queries_tried = testQueries;

      // Run scraping with proper options
      const scrapeOptions = {
        queries: testQueries,
        formats: TEST_CONFIG.formats,
        maxPagesPerQuery: config.maxPages,
        retailerId: retailer.id,
        debug: config.debug,
        debugDir: config.debugDir,
        headless: config.headless,
        throttleMs: 1000
      };

      const results = await scraper.scrape(scrapeOptions);
      
      // Handle results properly based on the scraper's return type
      let itemsArray: any[] = [];
      if (results && typeof results === 'object' && 'items' in results) {
        itemsArray = (results as any).items || [];
      } else {
        console.warn(`Unexpected results format for ${retailerSlug}:`, typeof results);
        itemsArray = [];
      }

      // Filter results and capture titles
      const filteredResults = itemsArray.filter(item => {
        if (!item || typeof item !== 'object') return false;
        const filterResult = filterProduct(item.product_name || item.productName || '');
        return filterResult.include;
      });

      metrics.items_found = itemsArray.length;
      metrics.items_saved = filteredResults.length;
      metrics.first_5_titles = itemsArray.slice(0, 5).map(r => 
        r?.product_name || r?.productName || 'Unknown'
      );
      metrics.error_rate = itemsArray.length > 0 ? 0 : 1;

    } catch (error) {
      metrics.errors.push(error instanceof Error ? error.message : 'Unknown error');
      metrics.error_rate = 1;
    }

    metrics.duration_ms = Date.now() - startTime;
    return metrics;
  }

  private generateRecommendations(report: CoverageReport): void {
    const recommendations: string[] = [];

    // Performance recommendations
    if (report.successful_retailers < 5) {
      recommendations.push('❌ Less than 5/8 retailers working - check selectors and RLS policies');
    }

    if (report.total_items_saved < 80) {
      recommendations.push('❌ Less than 80 items saved - increase query variety and fix pagination');
    }

    // Specific retailer recommendations
    report.metrics.forEach(m => {
      if (m.items_saved === 0) {
        if (!m.consent_clicked) {
          recommendations.push(`🍪 ${m.retailer}: Check cookie consent selectors`);
        }
        if (!m.store_selected) {
          recommendations.push(`🏪 ${m.retailer}: Check store selection process`);
        }
        if (m.pages_visited === 0) {
          recommendations.push(`🚫 ${m.retailer}: Navigation failed - check base URL and search selectors`);
        }
        if (!m.category_fallback_used) {
          recommendations.push(`📂 ${m.retailer}: Enable category fallback for better coverage`);
        }
      }
    });

    // Top performers
    const topPerformers = report.metrics
      .filter(m => m.items_saved > 10)
      .sort((a, b) => b.items_saved - a.items_saved)
      .slice(0, 3)
      .map(m => m.retailer);

    report.summary.top_performers = topPerformers;
    report.summary.recommendations = recommendations;
  }

  private async saveReports(report: CoverageReport): Promise<void> {
    // Save JSON report
    const jsonPath = path.join(this.debugDir, 'coverage.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Save Markdown report
    const mdPath = path.join(this.debugDir, 'COVERAGE_REPORT.md');
    const markdown = this.generateMarkdownReport(report);
    fs.writeFileSync(mdPath, markdown);

    console.log(`\n📄 Reports saved:`);
    console.log(`  📊 JSON: ${jsonPath}`);
    console.log(`  📝 Markdown: ${mdPath}`);
  }

  private generateMarkdownReport(report: CoverageReport): string {
    let md = `# Coverage Report\n\n`;
    md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
    
    md += `## Summary\n\n`;
    md += `- **Total Retailers Tested:** ${report.total_retailers}\n`;
    md += `- **Successful Retailers:** ${report.successful_retailers}/${report.total_retailers}\n`;
    md += `- **Total Items Found:** ${report.total_items_found}\n`;
    md += `- **Total Items Saved:** ${report.total_items_saved}\n`;
    md += `- **Overall Error Rate:** ${(report.overall_error_rate * 100).toFixed(1)}%\n\n`;

    md += `## Top Performers\n\n`;
    if (report.summary.top_performers.length > 0) {
      report.summary.top_performers.forEach(retailer => {
        const metrics = report.metrics.find(m => m.retailer === retailer);
        md += `- **${retailer}**: ${metrics?.items_saved} items saved\n`;
      });
    } else {
      md += `No retailers with significant results.\n`;
    }
    md += `\n`;

    md += `## Failed Retailers\n\n`;
    if (report.summary.retailers_failed.length > 0) {
      report.summary.retailers_failed.forEach(retailer => {
        const metrics = report.metrics.find(m => m.retailer === retailer);
        md += `- **${retailer}**: ${metrics?.errors.join(', ') || 'No specific errors'}\n`;
      });
    } else {
      md += `All retailers returned some results.\n`;
    }
    md += `\n`;

    md += `## Detailed Metrics\n\n`;
    md += `| Retailer | Items Found | Items Saved | Pages | Consent | Store | Category Fallback |\n`;
    md += `|----------|-------------|-------------|-------|---------|-------|-------------------|\n`;
    
    report.metrics.forEach(m => {
      md += `| ${m.retailer} | ${m.items_found} | ${m.items_saved} | ${m.pages_visited} | ${m.consent_clicked ? '✅' : '❌'} | ${m.store_selected ? '✅' : '❌'} | ${m.category_fallback_used ? '✅' : '❌'} |\n`;
    });
    md += `\n`;

    md += `## Sample Titles by Retailer\n\n`;
    report.metrics.forEach(m => {
      if (m.first_5_titles.length > 0) {
        md += `### ${m.retailer}\n\n`;
        m.first_5_titles.forEach((title, i) => {
          md += `${i + 1}. ${title}\n`;
        });
        md += `\n`;
      }
    });

    md += `## Recommendations\n\n`;
    if (report.summary.recommendations.length > 0) {
      report.summary.recommendations.forEach(rec => {
        md += `- ${rec}\n`;
      });
    } else {
      md += `✅ All systems operating well!\n`;
    }

    return md;
  }

  private displaySummaryTable(report: CoverageReport): void {
    console.log('\n📊 COVERAGE SUMMARY TABLE\n');
    console.log('┌─────────────────┬──────────┬──────────┬─────────┬──────────────────┐');
    console.log('│ Retailer        │ Found    │ Saved    │ Pages   │ Category Fallback│');
    console.log('├─────────────────┼──────────┼──────────┼─────────┼──────────────────┤');
    
    report.metrics.forEach(m => {
      const retailer = m.retailer.padEnd(15);
      const found = m.items_found.toString().padStart(8);
      const saved = m.items_saved.toString().padStart(8);
      const pages = m.pages_visited.toString().padStart(7);
      const fallback = (m.category_fallback_used ? '✅' : '❌').padStart(16);
      
      console.log(`│ ${retailer} │ ${found} │ ${saved} │ ${pages} │ ${fallback} │`);
    });
    
    console.log('└─────────────────┴──────────┴──────────┴─────────┴──────────────────┘');
    
    // Success criteria check
    console.log('\n🎯 SUCCESS CRITERIA:');
    console.log(`   ✅ Retailers with results: ${report.successful_retailers}/8 ${report.successful_retailers >= 5 ? '(PASS)' : '(FAIL - need 5+)'}`);
    console.log(`   ✅ Total items saved: ${report.total_items_saved} ${report.total_items_saved >= 80 ? '(PASS)' : '(FAIL - need 80+)'}`);
    
    if (report.summary.recommendations.length > 0) {
      console.log('\n💡 NEXT STEPS:');
      report.summary.recommendations.slice(0, 3).forEach(rec => {
        console.log(`   ${rec}`);
      });
    }
  }
}

// Run coverage test if called directly
if (require.main === module) {
  const reporter = new CoverageReporter();
  reporter.runCoverageTest()
    .then(() => {
      console.log('\n✅ Coverage test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Coverage test failed:', error);
      process.exit(1);
    });
}

export { CoverageReporter };