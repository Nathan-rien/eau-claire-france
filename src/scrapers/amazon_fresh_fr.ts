import { BaseScraper } from './base';
import { RetailerSelectors } from './types';

export class AmazonFreshFrScraper extends BaseScraper {
  protected retailerName = 'Amazon Fresh FR';
  protected searchUrl = 'https://www.amazon.fr/s?k={query}&rh=n%3A590748031';
  
  protected selectors: RetailerSelectors = {
    productContainer: '[data-component-type="s-search-result"], .s-result-item, [data-asin]',
    productName: '[data-cy="title-recipe-link"], .a-text-normal, h3 a span, .s-title-instructions-style span',
    priceTotal: '.a-price-whole, .a-offscreen, [data-cy="price"], .a-price .a-offscreen',
    pricePerL: '.a-size-base, .a-color-secondary, .a-price-unit',
    addToCartButton: '[name="submit.add-to-cart"], .a-button-input, [data-testid="add-to-cart"]',
    productUrl: 'h3 a, .s-title-instructions-style a, [data-cy="title-recipe-link"]',
    nextPage: '.s-pagination-next, [aria-label="Suivant"]',
    outOfStockIndicator: '.a-color-secondary, .a-text-bold',
    sku: '[data-asin]',
    image: '.s-image, img'
  };
}