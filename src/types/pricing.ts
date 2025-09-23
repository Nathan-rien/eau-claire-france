export interface Retailer {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: 'active' | 'paused' | 'beta';
  search_url_template?: string;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  retailer_id: string;
  started_at: string;
  finished_at?: string;
  status: 'running' | 'success' | 'partial' | 'failed';
  notes?: string;
  items_found: number;
  items_saved: number;
  error_rate: number;
  outliers_count: number;
  unknown_brands_count: number;
  quality_score: number;
  created_at: string;
}

export interface RawProduct {
  id: string;
  retailer_id: string;
  run_id: string;
  url: string;
  payload_json: Record<string, any>;
  scraped_at: string;
  created_at: string;
}

export interface Price {
  id: string;
  retailer_id: string;
  run_id: string;
  brand: string;
  product_name: string;
  pack_count?: number;
  unit_volume_l?: number;
  total_volume_l?: number;
  price_total_eur?: number;
  price_per_l_eur?: number;
  is_promo: boolean;
  promo_label?: string;
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
  sku?: string;
  url: string;
  image_url?: string;
  unique_hash: string;
  scraped_at: string;
  created_at: string;
}

export interface ScrapeOptions {
  queries: string[];
  formats: string[];
  maxPagesPerQuery?: number;
  throttleMs?: number;
  retailerId: string;
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

export interface PriceFilters {
  brand?: string;
  retailer?: string;
  format?: string;
  pack?: string;
  search?: string;
  is_promo?: boolean;
  availability?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BrandPriceStats {
  brand: string;
  retailer_prices: Array<{
    retailer: string;
    retailer_name: string;
    min_price_per_l: number;
    max_price_per_l: number;
    avg_price_per_l: number;
    last_scraped: string;
    product_count: number;
  }>;
  overall_stats: {
    min_price_per_l: number;
    max_price_per_l: number;
    avg_price_per_l: number;
    median_price_per_l: number;
    retailer_count: number;
    total_products: number;
  };
}

export interface MedianPriceStats {
  brand: string;
  period_days: number;
  retailer_medians: Array<{
    retailer: string;
    retailer_name: string;
    median_price_per_l: number;
    sample_size: number;
  }>;
}