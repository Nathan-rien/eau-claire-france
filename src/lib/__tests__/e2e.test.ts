import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

test.describe('E2E Scraping with Fixtures', () => {
  test('should extract products from Carrefour fixture', async ({ page }) => {
    const fixturePath = join(process.cwd(), 'fixtures/carrefour/search_eau_1_5l.html');
    const fixtureContent = readFileSync(fixturePath, 'utf-8');
    
    await page.setContent(fixtureContent);
    
    // Extract products using same selectors as scraper
    const products = await page.$$eval('[data-testid="product"]', (elements) => {
      return elements.map(el => {
        const nameEl = el.querySelector('[data-testid="product-name"]');
        const priceEl = el.querySelector('[data-testid="price"]');
        const unitPriceEl = el.querySelector('[data-testid="unit-price"]');
        const addToCartEl = el.querySelector('[data-testid="add-to-cart"]');
        const urlEl = el.querySelector('[data-testid="product-link"]');
        const skuEl = el.querySelector('[data-sku]');
        const promoEl = el.querySelector('[data-testid="promotion"]');
        
        return {
          product_name: nameEl?.textContent?.trim() || '',
          price_text: priceEl?.textContent?.trim() || '',
          unit_price_text: unitPriceEl?.textContent?.trim() || '',
          has_add_to_cart: !!addToCartEl,
          url: urlEl?.getAttribute('href') || '',
          sku: skuEl?.getAttribute('data-sku') || '',
          is_promo: !!promoEl,
          promo_label: promoEl?.textContent?.trim() || null
        };
      });
    });
    
    expect(products).toHaveLength(3);
    expect(products[0].product_name).toBe('Evian Eau minérale naturelle 1,5L');
    expect(products[0].price_text).toBe('0,89 €');
    expect(products[0].unit_price_text).toBe('0,59 €/L');
    expect(products[1].is_promo).toBe(true);
    expect(products[1].promo_label).toBe('PROMO -20%');
  });

  test('should extract products from Auchan fixture', async ({ page }) => {
    const fixturePath = join(process.cwd(), 'fixtures/auchan/search_eau_1_5l.html');
    const fixtureContent = readFileSync(fixturePath, 'utf-8');
    
    await page.setContent(fixtureContent);
    
    const products = await page.$$eval('.auchan-product-tile', (elements) => {
      return elements.map(el => {
        const nameEl = el.querySelector('.auchan-product-title');
        const priceEl = el.querySelector('.auchan-price-current');
        const unitPriceEl = el.querySelector('.auchan-unit-price');
        const addToCartEl = el.querySelector('.auchan-add-cart');
        const urlEl = el.querySelector('.auchan-product-link');
        const eanEl = el.querySelector('[data-ean]');
        const unavailableEl = el.querySelector('.auchan-unavailable');
        const promoEl = el.querySelector('.auchan-promotion');
        
        return {
          product_name: nameEl?.textContent?.trim() || '',
          price_text: priceEl?.textContent?.trim() || '',
          unit_price_text: unitPriceEl?.textContent?.trim() || '',
          has_add_to_cart: !!addToCartEl,
          url: urlEl?.getAttribute('href') || '',
          sku: eanEl?.getAttribute('data-ean') || '',
          is_unavailable: !!unavailableEl,
          is_promo: !!promoEl,
          promo_label: promoEl?.textContent?.trim() || null
        };
      });
    });
    
    expect(products).toHaveLength(3);
    expect(products[0].product_name).toBe('Evian Eau minérale naturelle 1,5L');
    expect(products[2].is_unavailable).toBe(true);
    expect(products[1].is_promo).toBe(true);
  });

  test('should extract products from Leclerc fixture', async ({ page }) => {
    const fixturePath = join(process.cwd(), 'fixtures/leclerc/search_eau_1_5l.html');
    const fixtureContent = readFileSync(fixturePath, 'utf-8');
    
    await page.setContent(fixtureContent);
    
    const products = await page.$$eval('.fd-product-card', (elements) => {
      return elements.map(el => {
        const nameEl = el.querySelector('.fd-product-card__title');
        const priceEl = el.querySelector('.fd-price-current');
        const unitPriceEl = el.querySelector('.fd-unit-price');
        const addToCartEl = el.querySelector('.fd-add-cart');
        const urlEl = el.querySelector('.fd-product-link');
        const eanEl = el.querySelector('[data-ean]');
        const unavailableEl = el.querySelector('.fd-unavailable');
        const promoEl = el.querySelector('.fd-promo-label');
        
        return {
          product_name: nameEl?.textContent?.trim() || '',
          price_text: priceEl?.textContent?.trim() || '',
          unit_price_text: unitPriceEl?.textContent?.trim() || '',
          has_add_to_cart: !!addToCartEl,
          url: urlEl?.getAttribute('href') || '',
          sku: eanEl?.getAttribute('data-ean') || '',
          is_unavailable: !!unavailableEl,
          is_promo: !!promoEl,
          promo_label: promoEl?.textContent?.trim() || null
        };
      });
    });
    
    expect(products).toHaveLength(3);
    expect(products[0].product_name).toBe('Evian Eau minérale naturelle 1,5L');
    expect(products[2].is_unavailable).toBe(true);
    expect(products[1].is_promo).toBe(true);
    expect(products[1].promo_label).toBe('Promotion -15%');
  });
});