/**
 * Category URLs for water sections by retailer
 * Used as fallback when search queries return 0 results
 */

export interface CategoryConfig {
  url: string;
  name: string;
  paginationStrategy: 'link' | 'scroll';
}

export const WATER_CATEGORIES: Record<string, CategoryConfig> = {
  carrefour: {
    url: 'https://www.carrefour.fr/s?q=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  },
  carrefour_drive: {
    url: 'https://courses.carrefour.fr/s?q=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  },
  carrefour_market: {
    url: 'https://market.carrefour.fr/recherche?query=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  },
  auchan: {
    url: 'https://www.auchan.fr/recherche?text=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'scroll'
  },
  auchan_super: {
    url: 'https://www.auchan.fr/recherche?text=eau%20min%C3%A9rale',
    name: 'Eaux minérales', 
    paginationStrategy: 'scroll'
  },
  leclerc: {
    url: 'https://www.leclerc.com/recherche?search=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  },
  intermarche: {
    url: 'https://www.intermarche.com/recherche?search=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  },
  u_drive: {
    url: 'https://courses.u-express.fr/recherche?search=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  },
  u_express: {
    url: 'https://www.magasins-u.com/recherche?query=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  },
  monoprix: {
    url: 'https://www.monoprix.fr/recherche?text=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'scroll'
  },
  franprix: {
    url: 'https://www.franprix.fr/recherche?q=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  },
  cora: {
    url: 'https://www.cora.fr/recherche?q=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  },
  match: {
    url: 'https://www.supermarchesmatch.fr/recherche?q=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  },
  chronodrive: {
    url: 'https://www.chronodrive.com/recherche?q=eau%20min%C3%A9rale',
    name: 'Eaux minérales',
    paginationStrategy: 'link'
  }
};

// Legacy export for compatibility
export const CATEGORY_FALLBACK: Record<string, string> = Object.fromEntries(
  Object.entries(WATER_CATEGORIES).map(([key, config]) => [key, config.url])
);