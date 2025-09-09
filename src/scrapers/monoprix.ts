import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class MonoprixScraper extends BaseScraper {
  protected retailerName = 'Monoprix';
  protected searchUrl = 'https://www.monoprix.fr/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    // TODO: These selectors need to be verified and updated based on actual Monoprix website structure
    productContainer: '.product-tile, .product-card, .product-item',
    productName: '.product-title, .product-name, h3, h4',
    priceTotal: '.price, .current-price, .product-price',
    pricePerL: '.price-per-unit, .unit-price, .price-per-liter',
    addToCartButton: '.add-to-cart, .btn-add, [aria-label*="ajouter"]',
    promoLabel: '.promo-badge, .promotion, .offer-label',
    productUrl: 'a.product-link, a[href]',
    nextPage: '.pagination-next, .next, [aria-label*="suivant"]',
    outOfStockIndicator: '.out-of-stock, .unavailable, [data-availability="out-of-stock"]',
    sku: '[data-sku], [data-product-id]',
    image: 'img'
  };
}