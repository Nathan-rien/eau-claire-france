import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class CoursesScraper extends BaseScraper {
  protected retailerName = 'Courses U';
  protected searchUrl = 'https://www.coursesu.com/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    // TODO: These selectors need to be verified and updated based on actual Courses U website structure
    productContainer: '.product-tile, .product-card, .article',
    productName: '.product-name, .product-title, h3, h4',
    priceTotal: '.price-value, .price, .product-price',
    pricePerL: '.unit-price, .price-per-unit, .price-per-liter',
    addToCartButton: '.add-product, .add-to-cart, [aria-label*="ajouter"]',
    promoLabel: '.promo-flag, .promo-label, .promotion',
    productUrl: '.product-link, a[href]',
    nextPage: '.next, .pagination-next, [aria-label*="suivant"]',
    outOfStockIndicator: '.out-of-stock, .unavailable, [data-availability="out-of-stock"]',
    sku: '[data-sku], [data-product-id]',
    image: 'img'
  };
}