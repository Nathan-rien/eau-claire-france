export interface ScrapeOptions {
  queries: string[];
  formats: string[];
  maxPagesPerQuery?: number;
  throttleMs?: number;
  retailerId: string;
  // Debug options
  debug?: boolean;
  headful?: boolean;
  slowMoMs?: number;
  debugDir?: string;
}

export interface ScrapedItem {
  product_name: string;
  price_total_eur: number | null;
  price_per_l_eur: number | null;
  url: string;
  sku?: string | null;
  is_promo?: boolean;
  promo_label?: string | null;
  availability?: "in_stock" | "out_of_stock" | null;
  image_url?: string | null;
}

export interface ScrapeResult {
  retailer: string;
  run_id: string;
  items: ScrapedItem[];
  errors: { step: string; message: string }[];
}

export interface RetailerSelectors {
  productContainer: string;
  productName: string;
  priceTotal: string;
  pricePerL?: string;
  addToCartButton: string;
  promoLabel?: string;
  productUrl: string;
  nextPage?: string;
  outOfStockIndicator?: string;
  sku?: string;
  image?: string;
}