import { CarrefourScraper } from './carrefour';
import { AuchanScraper } from './auchan';
import { LeclercScraper } from './leclerc';
import { IntermarcheScraper } from './intermarche';
import { CoursesScraper } from './coursesu';
import { CasinoScraper } from './casino';
import { BaseScraper } from './base';

export const SCRAPERS: Record<string, new () => BaseScraper> = {
  carrefour: CarrefourScraper,
  auchan: AuchanScraper,
  leclerc: LeclercScraper,
  intermarche: IntermarcheScraper,
  coursesu: CoursesScraper,
  casino: CasinoScraper
};

export function createScraper(retailerSlug: string): BaseScraper | null {
  const ScraperClass = SCRAPERS[retailerSlug];
  return ScraperClass ? new ScraperClass() : null;
}

export * from './types';
export * from './base';