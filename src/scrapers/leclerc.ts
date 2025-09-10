import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class LeclercScraper extends BaseScraper {
  protected retailerName = 'E.Leclerc';
  protected searchUrl = 'https://www.e.leclerc/recherche?keywords={query}';
  
  protected selectors: RetailerSelectors = {
    productContainer: '.product-item, .product-card, .fd-product-card, .leclerc-product-tile, article.product',
    productName: '.product-name, .product-title, .fd-product-card__title, .leclerc-product-name, h3.name',
    priceTotal: '.price-current, .current-price, .fd-price-current, .leclerc-price-value, .price-value',
    pricePerL: '.unit-price, .price-per-unit, .fd-unit-price, .leclerc-unit-price, .price-per-liter',
    addToCartButton: '.add-to-cart, .btn-add-cart, .fd-add-cart, button[aria-label*="ajouter"], .leclerc-add-button',
    promoLabel: '.promo-badge, .discount-badge, .fd-promo-label, .leclerc-promotion, .offer-label',
    productUrl: 'a.product-link, .fd-product-link, .leclerc-product-link, a[href*="/produit/"]',
    nextPage: '.pagination-next, .next-page, .fd-pagination-next, button[aria-label*="suivant"]',
    outOfStockIndicator: '.out-of-stock, .unavailable, .fd-unavailable, .leclerc-unavailable, .stock-out',
    sku: '[data-sku], [data-product-id], .fd-product[data-ean], [data-ean]',
    image: 'img.product-image, .fd-product-image img, .leclerc-product-image, img[alt*="produit"]'
  };
}