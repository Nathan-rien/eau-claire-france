import fs from 'node:fs/promises';
import path from 'node:path';
import type { Page } from 'playwright';

export interface DebugOptions {
  debug?: boolean;
  headful?: boolean;
  slowMoMs?: number;
  debugDir?: string;
}

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true }).catch(() => {});
}

export async function capture(page: Page, retailerName: string, opts: DebugOptions, label: string) {
  if (!opts.debug) return;
  const dir = opts.debugDir || './debug';
  const slug = slugify(retailerName);
  await ensureDir(dir);
  const safe = label.replace(/[^a-z0-9-_]/gi, '_');
  const pngPath = path.join(dir, `${slug}_${safe}.png`);
  const htmlPath = path.join(dir, `${slug}_${safe}.html`);
  try {
    await page.screenshot({ path: pngPath, fullPage: true });
  } catch {}
  try {
    const html = await page.content();
    await fs.writeFile(htmlPath, html, 'utf8');
  } catch {}
}

export async function logMetric(retailerName: string, opts: DebugOptions, metric: Record<string, any>) {
  if (!opts.debug) return;
  const dir = opts.debugDir || './debug';
  const slug = slugify(retailerName);
  await ensureDir(dir);
  const file = path.join(dir, `${slug}_metrics.json`);
  try {
    let arr: any[] = [];
    try {
      const existing = await fs.readFile(file, 'utf8');
      arr = JSON.parse(existing);
    } catch {}
    arr.push({ ts: new Date().toISOString(), ...metric });
    await fs.writeFile(file, JSON.stringify(arr, null, 2), 'utf8');
  } catch {}
}

export async function acceptCookies(page: Page, retailerName: string, opts: DebugOptions) {
  try {
    const selectors = [
      'button:has-text("Tout accepter")',
      'button:has-text("Accepter")',
      '[aria-label*="Accepter" i]',
      '[id*="didomi" i] button:has-text("Accepter")',
      '[id*="tarteaucitron" i] .acceptAll',
      '[data-testid*="consent" i] button:has-text("Accepter")'
    ];
    for (const sel of selectors) {
      const btn = page.locator(sel);
      if (await btn.first().count()) {
        await btn.first().click({ timeout: 2000 }).catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        await capture(page, retailerName, opts, 'cookies-accepted');
        break;
      }
    }
  } catch {}
}

export type StoreContextConfig = {
  needsStore?: boolean;
  defaultPostalCode?: string;
  openWidgetSelector?: string;
  postalInputSelector?: string;
  submitSelector?: string;
  pickFirstStoreSelector?: string;
  confirmedSelector?: string;
  waitMsAfterConfirm?: number;
};

import { STORE_CONTEXT } from '../config/storeContext';

export async function ensureStoreSelected(page: Page, retailerName: string, opts: DebugOptions) {
  const cfg = STORE_CONTEXT[slugify(retailerName)];
  if (!cfg || !cfg.needsStore) return;
  try {
    if (cfg.openWidgetSelector) await page.click(cfg.openWidgetSelector, { timeout: 4000 }).catch(() => {});
    if (cfg.postalInputSelector && cfg.defaultPostalCode) {
      await page.fill(cfg.postalInputSelector, cfg.defaultPostalCode).catch(() => {});
    }
    if (cfg.submitSelector) await page.click(cfg.submitSelector, { timeout: 4000 }).catch(() => {});
    if (cfg.pickFirstStoreSelector) await page.click(cfg.pickFirstStoreSelector, { timeout: 4000 }).catch(() => {});
    if (cfg.waitMsAfterConfirm) await page.waitForTimeout(cfg.waitMsAfterConfirm);
    if (cfg.confirmedSelector) await page.waitForSelector(cfg.confirmedSelector, { timeout: 8000 }).catch(() => {});
    await capture(page, retailerName, opts, 'store-selected');
  } catch {}
}