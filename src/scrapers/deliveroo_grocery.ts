import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class DeliverooGroceryScraper extends BaseScraper {
  protected retailerName = 'Deliveroo Grocery';
  protected searchUrl = 'https://deliveroo.fr/fr/recherche?q={query}';
  
  protected selectors: RetailerSelectors = {
    productContainer: '[data-testid="menu-item"], .menu-item, .product-card, .item-card',
    productName: '[data-testid="menu-item-name"], .item-name, h3, .product-name',
    priceTotal: '[data-testid="menu-item-price"], .price, .item-price, .product-price',
    pricePerL: '.unit-price, .price-per-unit, .secondary-price',
    addToCartButton: '[data-testid="product-card-add-button"], .add-button, .btn-add',
    productUrl: 'a, [href]',
    nextPage: '.load-more, [data-testid="load-more"], .pagination-next',
    outOfStockIndicator: '.out-of-stock, .unavailable',
    image: 'img'
  };
}