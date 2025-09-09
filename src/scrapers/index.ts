import { CarrefourScraper } from './carrefour';
import { CarrefourMarketScraper } from './carrefour_market';
import { AuchanScraper } from './auchan';
import { LeclercScraper } from './leclerc';
import { IntermarcheScraper } from './intermarche';
import { CoursesScraper } from './coursesu';
import { MonoprixScraper } from './monoprix';
import { CasinoScraper } from './casino';
import { FranprixScraper } from './franprix';
import { CoraScraper } from './cora';
import { MatchScraper } from './match';
import { ChronodriveScraper } from './chronodrive';
import { HouraScraper } from './houra';
import { BaseScraper } from './base';

export const SCRAPERS: Record<string, new () => BaseScraper> = {
  carrefour: CarrefourScraper,
  carrefour_market: CarrefourMarketScraper,
  auchan: AuchanScraper,
  leclerc: LeclercScraper,
  intermarche: IntermarcheScraper,
  coursesu: CoursesScraper,
  monoprix: MonoprixScraper,
  casino: CasinoScraper,
  franprix: FranprixScraper,
  cora: CoraScraper,
  match: MatchScraper,
  chronodrive: ChronodriveScraper,
  houra: HouraScraper
};

export function createScraper(retailerSlug: string): BaseScraper | null {
  const ScraperClass = SCRAPERS[retailerSlug];
  return ScraperClass ? new ScraperClass() : null;
}

export * from './types';
export * from './base';