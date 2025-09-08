import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class IntermarcheScraper extends BaseScraper {
  protected retailerName = 'Intermarché';
  protected searchUrl = 'https://www.intermarche.com/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    // TODO: These selectors need to be verified and updated based on actual Intermarché website structure
    productContainer: '.product, .product-card, .article',
    productName: '.product-title, .product-name, h3, h4',
    priceTotal: '.price, .product-price, .current-price',
    pricePerL: '.price-per-liter, .unit-price, .price-per-unit',
    addToCartButton: '.add-to-basket, .add-to-cart, [aria-label*="ajouter"]',
    promoLabel: '.offer-label, .promo-label, .promotion',
    productUrl: '.product-url, a[href]',
    nextPage: '.pagination-next, .next, [aria-label*="suivant"]',
    outOfStockIndicator: '.out-of-stock, .unavailable, [data-availability="out-of-stock"]',
    sku: '[data-sku], [data-product-id]',
    image: 'img'
  };
}