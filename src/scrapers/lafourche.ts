import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class LafourcheScraper extends BaseScraper {
  protected retailerName = 'La Fourche';
  protected searchUrl = 'https://www.lafourche.fr/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    productContainer: '.product-card, .product-item, [data-testid="product"], .product',
    productName: '.product-title, .name, h3, .title',
    priceTotal: '.price-current, .price, [data-testid="price"], .price-value',
    pricePerL: '.price-unit, .unit-price, .price-per-unit',
    addToCartButton: '.add-to-cart, .btn-cart, .add-button',
    productUrl: 'a, [href]',
    nextPage: '.pagination-next, .load-more, .pagination__next',
    outOfStockIndicator: '.out-of-stock, .unavailable',
    image: 'img'
  };
}