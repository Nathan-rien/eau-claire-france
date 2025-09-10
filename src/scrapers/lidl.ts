import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class LidlScraper extends BaseScraper {
  protected retailerName = 'Lidl';
  protected searchUrl = 'https://www.lidl.fr/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    productContainer: '.product-grid-box, .product-list-item, [data-qa="product-card"], .product-item',
    productName: '.product-grid-box__title, .product-name, [data-qa="product-title"], h3, .product-title',
    priceTotal: '.price-pill__price, .current-price, [data-qa="current-price"], .price__value, .price',
    pricePerL: '.price-pill__base-price, .unit-price, [data-qa="unit-price"], .price__unit, .price-per-unit',
    addToCartButton: '.btn--add-to-cart, .add-to-cart, [data-qa="add-to-cart"], .add-button',
    productUrl: 'a, [href]',
    nextPage: '.pagination__next, .load-more-btn, [data-testid="next-page"], .pagination-next',
    outOfStockIndicator: '.out-of-stock, .unavailable, [data-qa="out-of-stock"]',
    promoLabel: '.promo-badge, .discount-badge, [data-qa="promotion"]',
    image: 'img'
  };
}