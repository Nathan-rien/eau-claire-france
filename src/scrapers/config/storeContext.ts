import type { StoreContextConfig } from '../helpers/debug';

export const STORE_CONTEXT: Record<string, StoreContextConfig> = {
  // NOTE: Slugs are generic; exact selectors must be verified on real sites.
  carrefour: {
    needsStore: true,
    defaultPostalCode: '75001',
    openWidgetSelector: '[data-testid="store-selector"], [aria-label*="magasin"]', // TODO verify
    postalInputSelector: 'input[type="search" i], input[name*="code" i]', // TODO verify
    submitSelector: 'button:has-text("Valider"), button:has-text("Confirmer")',
    pickFirstStoreSelector: '[data-testid*="store-item"]:nth-of-type(1), .store-item:first-child',
    confirmedSelector: '[data-testid*="selected-store"], [aria-label*="magasin sélectionné"]',
    waitMsAfterConfirm: 1200,
  },
  auchan: {
    needsStore: true,
    defaultPostalCode: '75001',
    openWidgetSelector: '[data-testid="store-selector"], [aria-label*="magasin"]',
    postalInputSelector: 'input[type="search" i], input[name*="code" i]',
    submitSelector: 'button:has-text("Valider"), button:has-text("Confirmer")',
    pickFirstStoreSelector: '.store-item:first-child',
    confirmedSelector: '[data-testid*="selected-store"]',
    waitMsAfterConfirm: 1200,
  },
  leclerc: {
    needsStore: true,
    defaultPostalCode: '75001',
    openWidgetSelector: '[data-testid="store-selector"], [aria-label*="magasin"]',
    postalInputSelector: 'input[type="search" i], input[name*="code" i]',
    submitSelector: 'button:has-text("Valider"), button:has-text("Confirmer")',
    pickFirstStoreSelector: '.store-item:first-child',
    confirmedSelector: '[data-testid*="selected-store"]',
    waitMsAfterConfirm: 1200,
  },
  intermarche: {
    needsStore: true,
    defaultPostalCode: '75001',
  },
  coursesu: {
    needsStore: true,
    defaultPostalCode: '75001',
  },
  monoprix: {
    needsStore: true,
    defaultPostalCode: '75001',
  }
};