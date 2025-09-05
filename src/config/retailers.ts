// Configuration des enseignes avec URLs et sélecteurs
export const RETAILER_CONFIG = {
  carrefour: {
    name: 'Carrefour',
    domain: 'carrefour.fr',
    searchUrl: 'https://www.carrefour.fr/s?q={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '[data-testid="product-card"]',
      productName: '.product-name',
      priceTotal: '.price',
      pricePerL: '.price-per-unit',
      addToCartButton: '[aria-label*="ajouter"]',
      promoLabel: '.promo-label',
      productUrl: 'a[href]',
      nextPage: '.pagination-next'
    }
  },
  
  auchan: {
    name: 'Auchan',
    domain: 'auchan.fr',
    searchUrl: 'https://www.auchan.fr/recherche?text={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product-item',
      productName: '.product-title',
      priceTotal: '.price-current',
      pricePerL: '.price-unit',
      addToCartButton: '.add-to-cart',
      promoLabel: '.promotion-badge',
      productUrl: 'a.product-link',
      nextPage: '.pagination-next'
    }
  },

  leclerc: {
    name: 'E.Leclerc',
    domain: 'leclerc.com',
    searchUrl: 'https://www.e.leclerc/recherche?keywords={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product-card',
      productName: '.product-name',
      priceTotal: '.current-price',
      pricePerL: '.unit-price',
      addToCartButton: '.btn-add-cart',
      promoLabel: '.badge-promo',
      productUrl: '.product-link',
      nextPage: '.next-page'
    }
  },

  intermarche: {
    name: 'Intermarché',
    domain: 'intermarche.com',
    searchUrl: 'https://www.intermarche.com/recherche?q={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product',
      productName: '.product-title',
      priceTotal: '.price',
      pricePerL: '.price-per-liter',
      addToCartButton: '.add-to-basket',
      promoLabel: '.offer-label',
      productUrl: '.product-url',
      nextPage: '.pagination-next'
    }
  },

  coursesu: {
    name: 'Courses U',
    domain: 'coursesu.com',
    searchUrl: 'https://www.coursesu.com/recherche?q={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product-tile',
      productName: '.product-name',
      priceTotal: '.price-value',
      pricePerL: '.unit-price',
      addToCartButton: '.add-product',
      promoLabel: '.promo-flag',
      productUrl: '.product-link',
      nextPage: '.next'
    }
  },

  casino: {
    name: 'Casino',
    domain: 'casino.fr',
    searchUrl: 'https://www.casino.fr/recherche?q={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product-card',
      productName: '.product-title',
      priceTotal: '.current-price',
      pricePerL: '.price-per-unit',
      addToCartButton: '.add-to-cart-btn',
      promoLabel: '.promotional-badge',
      productUrl: '.product-url',
      nextPage: '.pagination-next'
    }
  },

  monoprix: {
    name: 'Monoprix',
    domain: 'monoprix.fr',
    searchUrl: 'https://www.monoprix.fr/recherche?q={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product-item',
      productName: '.product-name',
      priceTotal: '.price',
      pricePerL: '.unit-price',
      addToCartButton: '.add-to-cart',
      promoLabel: '.promo-badge',
      productUrl: '.product-link',
      nextPage: '.next-page'
    }
  },

  franprix: {
    name: 'Franprix',
    domain: 'franprix.fr',
    searchUrl: 'https://www.franprix.fr/recherche?q={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product',
      productName: '.product-title',
      priceTotal: '.price-current',
      pricePerL: '.price-unit',
      addToCartButton: '.btn-add-to-cart',
      promoLabel: '.badge-offer',
      productUrl: '.product-href',
      nextPage: '.pagination-next'
    }
  },

  cora: {
    name: 'Cora',
    domain: 'cora.fr',
    searchUrl: 'https://www.cora.fr/recherche?q={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product-tile',
      productName: '.title',
      priceTotal: '.price',
      pricePerL: '.unit-price',
      addToCartButton: '.add-to-cart',
      promoLabel: '.promotion',
      productUrl: '.product-url',
      nextPage: '.next'
    }
  },

  match: {
    name: 'Match',
    domain: 'supermarchesmatch.fr',
    searchUrl: 'https://www.supermarchesmatch.fr/recherche?q={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product-card',
      productName: '.product-name',
      priceTotal: '.price',
      pricePerL: '.price-per-liter',
      addToCartButton: '.add-to-basket',
      promoLabel: '.promo-label',
      productUrl: '.product-link',
      nextPage: '.pagination-next'
    }
  },

  chronodrive: {
    name: 'Chronodrive',
    domain: 'chronodrive.fr',
    searchUrl: 'https://www.chronodrive.fr/recherche?q={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product',
      productName: '.product-title',
      priceTotal: '.current-price',
      pricePerL: '.unit-price',
      addToCartButton: '.add-product-btn',
      promoLabel: '.offer-badge',
      productUrl: '.product-href',
      nextPage: '.next-page'
    }
  },

  houra: {
    name: 'Houra',
    domain: 'houra.fr',
    searchUrl: 'https://www.houra.fr/recherche?q={query}',
    selectors: {
      // TODO: À compléter avec les vrais sélecteurs
      productContainer: '.product-item',
      productName: '.product-name',
      priceTotal: '.price-value',
      pricePerL: '.unit-price',
      addToCartButton: '.add-to-cart',
      promoLabel: '.promotional-flag',
      productUrl: '.product-link',
      nextPage: '.pagination-next'
    }
  }
};

export const ACTIVE_RETAILERS = Object.keys(RETAILER_CONFIG);