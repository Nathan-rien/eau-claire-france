import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class GreenweezScraper extends BaseScraper {
  protected retailerName = 'Greenweez';
  protected searchUrl = 'https://www.greenweez.com/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    productContainer: '.product-item, .product-card, [data-testid="product"], .product',
    productName: '.product-name, .title, h3, .product-title, .name',
    priceTotal: '.price, .current-price, [data-testid="price"], .price-value',
    pricePerL: '.unit-price, .price-unit, [data-testid="unit-price"], .price-per-unit',
    addToCartButton: '.add-to-cart, .btn-add-cart, .add-button',
    productUrl: 'a, [href]',
    nextPage: '.pagination-next, .next-page, .pagination__next',
    outOfStockIndicator: '.out-of-stock, .unavailable',
    image: 'img'
  };
}