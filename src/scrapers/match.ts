import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class MatchScraper extends BaseScraper {
  protected retailerName = 'Supermarchés Match';
  protected searchUrl = 'https://www.supermarchesmatch.fr/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    // TODO: These selectors need to be verified and updated based on actual Match website structure
    productContainer: '.product, .product-card, .product-tile',
    productName: '.product-title, .product-name, h3, h4',
    priceTotal: '.price, .product-price, .current-price',
    pricePerL: '.price-per-unit, .unit-price, .price-per-liter',
    addToCartButton: '.add-to-cart, .btn-add, [aria-label*="ajouter"]',
    promoLabel: '.promotion, .promo-label, .offer-badge',
    productUrl: 'a.product-link, a[href]',
    nextPage: '.pagination-next, .next, [aria-label*="suivant"]',
    outOfStockIndicator: '.out-of-stock, .unavailable, [data-availability="out-of-stock"]',
    sku: '[data-sku], [data-product-id]',
    image: 'img'
  };
}