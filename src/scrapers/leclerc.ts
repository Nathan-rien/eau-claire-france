import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class LeclercScraper extends BaseScraper {
  protected retailerName = 'E.Leclerc';
  protected searchUrl = 'https://www.e.leclerc/recherche?keywords={query}';
  
  protected selectors: RetailerSelectors = {
    // TODO: These selectors need to be verified and updated based on actual E.Leclerc website structure
    productContainer: '.product-card, .product-item, .article',
    productName: '.product-name, .product-title, h3, h4',
    priceTotal: '.current-price, .price, .product-price',
    pricePerL: '.unit-price, .price-per-unit, .price-per-liter',
    addToCartButton: '.btn-add-cart, .add-to-cart, [aria-label*="ajouter"]',
    promoLabel: '.badge-promo, .promo-label, .promotion',
    productUrl: '.product-link, a[href]',
    nextPage: '.next-page, .pagination-next, [aria-label*="suivant"]',
    outOfStockIndicator: '.out-of-stock, .unavailable, [data-availability="out-of-stock"]',
    sku: '[data-sku], [data-product-id]',
    image: 'img'
  };
}