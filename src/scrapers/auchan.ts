import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class AuchanScraper extends BaseScraper {
  protected retailerName = 'Auchan';
  protected searchUrl = 'https://www.auchan.fr/recherche?text={query}';
  
  protected selectors: RetailerSelectors = {
    productContainer: '.product-item, .product-card, article.ProductCard, .auchan-product-tile',
    productName: '.product-name, .product-title, .ProductCard-title, .auchan-product-title, h3.title',
    priceTotal: '.price-value, .current-price, .ProductCard-price, .auchan-price-current, .price-display',
    pricePerL: '.unit-price, .price-per-liter, .ProductCard-unit-price, .auchan-unit-price, .price-unit',
    addToCartButton: '.add-to-cart, .btn-basket, .ProductCard-button, button[aria-label*="ajouter"], .auchan-add-cart',
    promoLabel: '.promo-badge, .discount-label, .ProductCard-promo, .auchan-promotion, .offer-badge',
    productUrl: 'a.product-link, .ProductCard-link, .auchan-product-link, a[href*="/product/"]',
    nextPage: '.pagination-next, .next-page, button[aria-label*="suivant"], .auchan-pagination-next',
    outOfStockIndicator: '.out-of-stock, .unavailable, .ProductCard--unavailable, .auchan-unavailable',
    sku: '[data-sku], [data-product-id], .ProductCard[data-ean], [data-ean]',
    image: 'img.product-image, .ProductCard-image img, .auchan-product-image, img[alt*="produit"]'
  };
}