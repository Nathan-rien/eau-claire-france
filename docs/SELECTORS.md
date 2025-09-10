# Guide des sélecteurs CSS pour le scraping

## Méthodologie de recherche

### Priorité des sélecteurs

1. **data-testid** et attributs de test (plus stables)
2. **aria-label** et attributs d'accessibilité  
3. **Classes CSS spécifiques** au contenu
4. **Structure HTML** stable (dernier recours)

### Stratégie multi-fallback

Chaque scraper doit définir **2-3 sélecteurs fallback** par élément pour assurer la robustesse :

```typescript
protected selectors: RetailerSelectors = {
  productContainer: [
    '[data-testid="product-card"]',    // Priorité 1: attribut de test
    '.product-item',                   // Priorité 2: classe spécifique
    'article[aria-label*="produit"]'   // Priorité 3: structure + aria
  ].join(', '),
  
  productName: [
    '[data-testid="product-name"]',
    '.product-title h3',
    '.title, .product-name'
  ].join(', '),
  
  priceTotal: [
    '[data-testid="price-total"]',
    '.price-current',
    '.price .value, .current-price'
  ].join(', ')
};
```

## Patterns courants par enseigne

### Carrefour
```typescript
{
  productContainer: '.product-card, [data-testid="product"], .js-product-item',
  productName: '.product-card__title, [data-testid="product-name"], h3.title',
  priceTotal: '.product-card__price .price, [data-testid="price"], .price-current',
  pricePerL: '.product-card__unit-price, [data-testid="unit-price"], .price-per-unit',
  addToCartButton: '[data-testid="add-to-cart"], .add-to-cart-btn, button[aria-label*="ajouter"]',
  nextPage: '[aria-label="Page suivante"], .pagination-next, .load-more-btn'
}
```

### Leclerc
```typescript
{
  productContainer: '.product-item, [data-qa="product"], .product-list-item',
  productName: '.product-item__name, [data-qa="product-name"], .product-title',
  priceTotal: '.product-item__price, [data-qa="price"], .price-value',
  pricePerL: '.product-item__unit-price, [data-qa="unit-price"], .unit-price',
  addToCartButton: '.product-item__add-btn, [data-qa="add-button"], .add-to-basket',
  nextPage: '.pagination__next, [aria-label="Suivant"], .load-more'
}
```

### Auchan
```typescript
{
  productContainer: '.productBlock, [data-test="product"], .product-container',
  productName: '.productBlock__name, [data-test="product-name"], .product-name',
  priceTotal: '.productBlock__price, [data-test="price"], .price-amount',
  pricePerL: '.productBlock__unitPrice, [data-test="unit-price"], .price-per-l',
  addToCartButton: '.productBlock__addBtn, [data-test="add-cart"], .add-to-cart',
  nextPage: '.pagination-item--next, [aria-label="Page suivante"], .next-page'
}
```

## Détection d'éléments spéciaux

### Promotions
```typescript
promoLabel: [
  '[data-testid="promo-badge"]',
  '.promo-label, .discount-badge',
  '.offer-label, .promotion',
  '[class*="promo"], [class*="discount"]'
].join(', ')
```

### Disponibilité
```typescript
outOfStockIndicator: [
  '[data-testid="out-of-stock"]',
  '.out-of-stock, .unavailable',
  '[aria-label*="indisponible"]',
  '.stock-zero, .no-stock'
].join(', ')
```

### Pagination
```typescript
nextPage: [
  '[aria-label="Page suivante"]',
  '.pagination-next, .next',
  'a[rel="next"]',
  '.load-more, .voir-plus'
].join(', ')
```

## Techniques de débogage

### Mode headful pour inspection visuelle

```bash
# Activer le mode visible pour déboguer
pnpm scrape --retailers carrefour --brands evian --formats "1l" --maxPages 1 --headful
```

### Test des sélecteurs en console

```javascript
// Dans la console du navigateur
// Tester la sélection des produits
console.log('Produits trouvés:', document.querySelectorAll('.product-card').length);

// Tester l'extraction du nom
Array.from(document.querySelectorAll('.product-card')).map(p => 
  p.querySelector('.product-title')?.textContent?.trim()
);

// Tester l'extraction du prix
Array.from(document.querySelectorAll('.product-card')).map(p => 
  p.querySelector('.price')?.textContent?.trim()
);
```

### Validation des sélecteurs

```typescript
// Dans le scraper, ajouter des logs de débogage
const products = await page.$$eval(this.selectors.productContainer, (elements) => {
  console.log(`Found ${elements.length} products`);
  return elements.map(el => {
    const name = el.querySelector('[data-testid="product-name"]')?.textContent;
    const price = el.querySelector('[data-testid="price"]')?.textContent;
    console.log(`Product: ${name}, Price: ${price}`);
    return { name, price };
  });
});
```

## Gestion des changements de structure

### Monitoring des échecs de sélection

Le système de qualité détecte automatiquement :
- **Échec d'extraction** : sélecteurs obsolètes
- **Données incohérentes** : structure changée
- **Taux d'erreur élevé** : refonte du site

### Stratégie de mise à jour

1. **Détection** : Alert sur taux d'erreur > 30%
2. **Investigation** : Test headful + inspection manuelle
3. **Correction** : Ajout de nouveaux sélecteurs en priorité 1
4. **Validation** : Test sur 3 pages minimum
5. **Déploiement** : Progressive rollout

### Sélecteurs de secours universels

```typescript
// Fallbacks génériques quand tout échoue
const genericSelectors = {
  productContainer: 'article, .product, [class*="product"], [data-*="product"]',
  productName: 'h1, h2, h3, .title, .name, [class*="title"], [class*="name"]',
  priceTotal: '.price, [class*="price"], [data-*="price"]',
  addToCartButton: 'button, .btn, [class*="add"], [class*="cart"]'
};
```

## Bonnes pratiques

### Éviter les sélecteurs fragiles

❌ **À éviter :**
```css
/* Trop spécifique - casse facilement */
.page-content > div:nth-child(3) > div:first-child > ul > li:nth-child(2)

/* Classes auto-générées */
.css-1a2b3c4

/* Position absolue */
body > div:nth-child(5) > main > section:first-child
```

✅ **Préférer :**
```css
/* Attributs sémantiques */
[data-testid="product-card"]
[aria-label*="produit"]

/* Classes métier stables */
.product-item
.price-display
.add-to-cart

/* Combinaisons logiques */
.product .title
.price-container .current-price
```

### Test de robustesse

```typescript
// Vérifier que les sélecteurs fonctionnent sur plusieurs pages
const testUrls = [
  'https://example.com/search?q=evian',
  'https://example.com/search?q=cristaline',
  'https://example.com/search?q=vittel'
];

for (const url of testUrls) {
  const products = await extractProducts(url);
  console.log(`${url}: ${products.length} produits extraits`);
}
```

### Documentation des changements

```typescript
// Historique des sélecteurs dans les commentaires
const selectors = {
  productContainer: [
    '.product-card',           // 2024-12-10: Actuel
    '.product-item',           // 2024-11-15: Ancien format
    '[data-qa="product"]'      // 2024-10-01: Refonte site
  ].join(', ')
};
```

## Cas particuliers

### Sites avec lazy loading

```typescript
// Attendre le chargement complet
await page.waitForSelector('.product-card', { timeout: 10000 });
await page.evaluate(() => {
  return new Promise((resolve) => {
    let totalHeight = 0;
    const distance = 100;
    const timer = setInterval(() => {
      const scrollHeight = document.body.scrollHeight;
      window.scrollBy(0, distance);
      totalHeight += distance;
      if(totalHeight >= scrollHeight){
        clearInterval(timer);
        resolve();
      }
    }, 100);
  });
});
```

### Sites avec JavaScript obligatoire

```typescript
// Attendre l'hydratation complète
await page.waitForFunction(() => {
  return document.querySelectorAll('.product-card').length > 0;
}, { timeout: 15000 });
```

### Gestion des cookies/RGPD

```typescript
// Accepter automatiquement les cookies si nécessaire
try {
  await page.click('#accept-cookies', { timeout: 3000 });
} catch (e) {
  // Ignorer si pas de bannière cookies
}
```

Cette documentation doit être mise à jour à chaque modification de sélecteurs pour maintenir la traçabilité des changements.