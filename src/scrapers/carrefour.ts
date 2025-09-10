import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class CarrefourScraper extends BaseScraper {
  protected retailerName = 'Carrefour';
  protected searchUrl = 'https://www.carrefour.fr/s?q={query}';
  
  protected selectors: RetailerSelectors = {
    productContainer: '[data-testid="product"], .product-item, article[data-testid="product-card"], .ds-product-card',
    productName: '[data-testid="product-name"], .product-card-title, .ds-product-card__title, h3[data-testid="product-title"]',
    priceTotal: '[data-testid="price"], .product-card-price__price, .ds-price__value, .price-current',
    pricePerL: '[data-testid="unit-price"], .product-card-price__per, .ds-price__unit, .price-per-unit',
    addToCartButton: '[data-testid="add-to-cart"], button[aria-label*="Ajouter"], .add-to-cart-btn, [data-testid="product-add-button"]',
    promoLabel: '[data-testid="promotion"], .ds-badge--promotion, .product-card-badge, .promo-badge',
    productUrl: 'a[data-testid="product-link"], .product-card__link, .ds-product-card__link',
    nextPage: '[data-testid="pagination-next"], .pagination__next, .ds-pagination__next, button[aria-label*="suivant"]',
    outOfStockIndicator: '[data-testid="out-of-stock"], .unavailable, .product-unavailable, .ds-product-card--unavailable',
    sku: '[data-sku], [data-product-id], [data-testid="product-id"]',
    image: 'img[data-testid="product-image"], .product-card__image img, .ds-product-card__image img'
  };
}