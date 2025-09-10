import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class AldiScraper extends BaseScraper {
  protected retailerName = 'Aldi';
  protected searchUrl = 'https://www.aldi.fr/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    productContainer: '.mod-article-tile, .product-tile, [data-qa="product"], .product-item',
    productName: '.mod-article-tile__title, .product-title, h3, .title, .product-name',
    priceTotal: '.mod-article-tile__price, .price, [data-qa="price"], .price-value, .current-price',
    pricePerL: '.mod-article-tile__basic-price, .unit-price, [data-qa="unit-price"], .price-per-unit',
    addToCartButton: '.btn--basket, .add-to-cart, .add-button',
    productUrl: 'a, [href]',
    nextPage: '.pagination-next, .load-more, [aria-label="Page suivante"], .pagination__next',
    outOfStockIndicator: '.out-of-stock, .unavailable',
    promoLabel: '.promo-badge, .discount, [data-qa="promotion"]',
    image: 'img'
  };
}