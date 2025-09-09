import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class FranprixScraper extends BaseScraper {
  protected retailerName = 'Franprix';
  protected searchUrl = 'https://www.franprix.fr/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    // TODO: These selectors need to be verified and updated based on actual Franprix website structure
    productContainer: '.product, .product-card, .article',
    productName: '.product-title, .product-name, h3, h4',
    priceTotal: '.price, .product-price, .current-price',
    pricePerL: '.price-per-liter, .unit-price, .price-per-unit',
    addToCartButton: '.add-to-cart, .btn-add-cart, [aria-label*="ajouter"]',
    promoLabel: '.promotion, .promo-label, .badge-offer',
    productUrl: '.product-link, a[href]',
    nextPage: '.pagination-next, .next, [aria-label*="suivant"]',
    outOfStockIndicator: '.out-of-stock, .unavailable, [data-availability="out-of-stock"]',
    sku: '[data-sku], [data-product-id]',
    image: 'img'
  };
}