import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class CoraScraper extends BaseScraper {
  protected retailerName = 'Cora';
  protected searchUrl = 'https://www.cora.fr/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    // TODO: These selectors need to be verified and updated based on actual Cora website structure
    productContainer: '.product-item, .product-card, .article',
    productName: '.product-title, .product-name, h3, h4',
    priceTotal: '.price, .product-price, .current-price',
    pricePerL: '.unit-price, .price-per-unit, .price-per-liter',
    addToCartButton: '.add-to-cart, .btn-add-cart, [aria-label*="ajouter"]',
    promoLabel: '.promo-label, .promotion, .badge-promo',
    productUrl: 'a.product-link, a[href]',
    nextPage: '.pagination-next, .next, [aria-label*="suivant"]',
    outOfStockIndicator: '.out-of-stock, .unavailable, [data-availability="out-of-stock"]',
    sku: '[data-sku], [data-product-id]',
    image: 'img'
  };
}