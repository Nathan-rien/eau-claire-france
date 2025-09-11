#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { runScraping } from './run-scrape';

// Server-side Supabase client
const supabase = createClient(
  "https://xblogttmomuogdhmaztf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibG9ndHRtb211b2dkaG1henRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYwNTgsImV4cCI6MjA2NTk4MjA1OH0._CAQGXwo2ZJYmwvvstGJ2bnC65vT9fHcTyuXwgNalP8"
);

interface CronSchedule {
  time: string; // Format: "HH:MM"
  retailer: string;
  brands: string[];
  formats: string[];
  maxPages: number;
}

// Cron schedule for Europe/Paris timezone
const PRODUCTION_SCHEDULE: CronSchedule[] = [
  { time: "06:20", retailer: "carrefour", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 3 },
  { time: "06:35", retailer: "carrefour_market", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 3 },
  { time: "06:50", retailer: "auchan", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 3 },
  { time: "07:05", retailer: "leclerc", brands: ["evian", "cristaline", "volvic"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 3 },
  { time: "07:20", retailer: "intermarche", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 3 },
  { time: "07:35", retailer: "coursesu", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 3 },
  { time: "07:50", retailer: "monoprix", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 2 },
  { time: "08:05", retailer: "casino", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 3 },
  { time: "08:20", retailer: "franprix", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 2 },
  { time: "08:35", retailer: "cora", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 3 },
  { time: "08:50", retailer: "match", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 2 },
  { time: "09:05", retailer: "chronodrive", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 2 },
  { time: "09:20", retailer: "houra", brands: ["evian", "cristaline"], formats: ["50 cl", "1 l", "1,5 l"], maxPages: 2 }
];

class CronScheduler {
  async getActiveRetailers(): Promise<string[]> {
    const { data: retailers, error } = await supabase
      .from('retailers')
      .select('slug, status')
      .eq('status', 'active');

    if (error) {
      console.error('Failed to get active retailers:', error);
      return [];
    }

    return retailers?.map(r => r.slug) || [];
  }

  async runScheduledScraping(): Promise<void> {
    console.log('🕐 Starting cron scheduler (Europe/Paris timezone)');
    
    const activeRetailers = await this.getActiveRetailers();
    console.log(`Active retailers: ${activeRetailers.join(', ')}`);

    for (const schedule of PRODUCTION_SCHEDULE) {
      // Skip retailers that are not active or paused
      if (!activeRetailers.includes(schedule.retailer)) {
        console.log(`⏭️ Skipping ${schedule.retailer} (not active or paused)`);
        continue;
      }

      console.log(`\n🚀 ${schedule.time} - Starting ${schedule.retailer}`);
      
      try {
        await runScraping({
          retailers: [schedule.retailer],
          brands: schedule.brands,
          formats: schedule.formats,
          maxPages: schedule.maxPages,
          throttleMs: 1250 // 1000-1500ms + jitter
        });
        
        console.log(`✅ ${schedule.retailer} completed successfully`);
      } catch (error) {
        console.error(`❌ ${schedule.retailer} failed:`, error);
        
        // Optionally pause retailer after consecutive failures
        // This could be implemented based on failure tracking
      }

      // Wait until next scheduled time
      const nextSchedule = PRODUCTION_SCHEDULE[PRODUCTION_SCHEDULE.indexOf(schedule) + 1];
      if (nextSchedule) {
        const waitTime = this.calculateWaitTime(schedule.time, nextSchedule.time);
        console.log(`⏳ Waiting ${waitTime}ms until ${nextSchedule.time} (${nextSchedule.retailer})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    console.log('\n🏁 Daily cron schedule completed');
  }

  private calculateWaitTime(currentTime: string, nextTime: string): number {
    const [currentHour, currentMin] = currentTime.split(':').map(Number);
    const [nextHour, nextMin] = nextTime.split(':').map(Number);
    
    const currentMinutes = currentHour * 60 + currentMin;
    const nextMinutes = nextHour * 60 + nextMin;
    
    return (nextMinutes - currentMinutes) * 60 * 1000; // Convert to milliseconds
  }

  async pauseRetailer(retailerSlug: string): Promise<void> {
    const { error } = await supabase
      .from('retailers')
      .update({ status: 'paused' })
      .eq('slug', retailerSlug);

    if (error) {
      console.error(`Failed to pause retailer ${retailerSlug}:`, error);
    } else {
      console.log(`✅ Retailer ${retailerSlug} paused`);
    }
  }

  async resumeRetailer(retailerSlug: string): Promise<void> {
    const { error } = await supabase
      .from('retailers')
      .update({ status: 'active' })
      .eq('slug', retailerSlug);

    if (error) {
      console.error(`Failed to resume retailer ${retailerSlug}:`, error);
    } else {
      console.log(`✅ Retailer ${retailerSlug} resumed`);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const retailerSlug = process.argv[3];
  
  const scheduler = new CronScheduler();

  switch (command) {
    case 'run':
      scheduler.runScheduledScraping().catch(error => {
        console.error('Cron execution failed:', error);
        process.exit(1);
      });
      break;
      
    case 'pause':
      if (!retailerSlug) {
        console.error('Usage: node cron-scheduler.ts pause <retailer-slug>');
        process.exit(1);
      }
      scheduler.pauseRetailer(retailerSlug).catch(error => {
        console.error('Pause failed:', error);
        process.exit(1);
      });
      break;
      
    case 'resume':
      if (!retailerSlug) {
        console.error('Usage: node cron-scheduler.ts resume <retailer-slug>');
        process.exit(1);
      }
      scheduler.resumeRetailer(retailerSlug).catch(error => {
        console.error('Resume failed:', error);
        process.exit(1);
      });
      break;
      
    default:
      console.log(`
Usage: node src/scripts/cron-scheduler.ts <command> [options]

Commands:
  run                    Run the daily cron schedule
  pause <retailer-slug>  Pause a specific retailer
  resume <retailer-slug> Resume a specific retailer

Examples:
  node src/scripts/cron-scheduler.ts run
  node src/scripts/cron-scheduler.ts pause carrefour
  node src/scripts/cron-scheduler.ts resume carrefour
      `);
      break;
  }
}

export { CronScheduler };