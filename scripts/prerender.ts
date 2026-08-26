/**
 * Static prerendering post-build.
 *
 * Serves dist/ locally, opens every route with headless Chromium, waits for the
 * React app to be mounted (and for JSON-LD to be injected by react-helmet-async),
 * then writes the fully rendered HTML to dist/<route>/index.html.
 *
 * The client bundle and hydration are untouched: the emitted HTML is the same
 * document, just with the rendered DOM + head already present for crawlers.
 *
 * Usage:  tsx scripts/prerender.ts [--limit=N] [--only=/a,/b]
 * Never fatal: any failure logs a warning and exits 0 so the build survives.
 */
import { createServer, type Server } from "http";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, statSync } from "fs";
import { extname, join, resolve } from "path";
import { chromium, type Browser, type Page } from "playwright";
import { staticEntries, brandEntries, communeEntries } from "./routes";
import { INTERNATIONAL_PATHS } from "../src/lib/i18nRoutes";

const DIST = resolve("dist");
const PORT = Number(process.env.PRERENDER_PORT || 4183);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const NAV_TIMEOUT = 20_000;
const RENDER_TIMEOUT = 10_000;
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY || 3);
const SITE_URL = "https://infoeau.fr";
const FALLBACK_TITLE = "InfoEau — Qualité de l'eau du robinet et prix des eaux en bouteille en France";

// Caps for dynamic route families (first pass stays small on purpose).
const MAX_COMMUNES = Number(process.env.PRERENDER_MAX_COMMUNES || 50);
const MAX_BLOG = Number(process.env.PRERENDER_MAX_BLOG || 30);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xblogttmomuogdhmaztf.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibG9ndHRtb211b2dkaG1henRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYwNTgsImV4cCI6MjA2NTk4MjA1OH0._CAQGXwo2ZJYmwvvstGJ2bnC65vT9fHcTyuXwgNalP8";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

/** Minimal static file server with SPA fallback to index.html. */
function startServer(): Promise<Server> {
  const indexHtml = readFileSync(join(DIST, "index.html"));
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const filePath = join(DIST, urlPath);
    try {
      if (existsSync(filePath) && statSync(filePath).isFile()) {
        res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
        res.end(readFileSync(filePath));
        return;
      }
    } catch {
      /* fall through to SPA fallback */
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(indexHtml);
  });
  return new Promise((ok, fail) => {
    server.once("error", fail);
    server.listen(PORT, "127.0.0.1", () => ok(server));
  });
}

async function fetchBlogSlugs(limit: number): Promise<string[]> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_articles?select=slug&status=eq.published&order=published_at.desc&limit=${limit}`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return [];
    return (await res.json() as { slug: string }[]).map((a) => a.slug);
  } catch {
    return [];
  }
}

function buildRouteList(): string[] {
  const fr = [
    ...staticEntries.map((e) => e.path),
    ...brandEntries.map((e) => e.path),
    ...communeEntries(MAX_COMMUNES).map((e) => e.path),
  ];
  const en = INTERNATIONAL_PATHS.map((p) => (p === "/" ? "/en" : `/en${p}`));
  return Array.from(new Set([...fr, ...en]));
}

/** dist output path for a route. */
function outFile(route: string): string {
  const clean = route.replace(/^\/+|\/+$/g, "");
  return clean === "" ? join(DIST, "index.html") : join(DIST, clean, "index.html");
}

function canonicalForRoute(route: string): string {
  const path = route.split("#")[0].split("?")[0].toLowerCase().replace(/\/+$/g, "") || "/";
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

async function normalizeHead(page: Page) {
  await page.evaluate(() => {
    const keepLastByAttribute = (selector: string, attribute: string) => {
      const seen = new Set<string>();
      const nodes = Array.from(document.head.querySelectorAll(selector)).reverse();
      for (const node of nodes) {
        const key = node.getAttribute(attribute);
        if (!key) continue;
        if (seen.has(key)) node.remove();
        else seen.add(key);
      }
    };

    keepLastByAttribute(
      'meta[name="description"],meta[name="keywords"],meta[name="robots"],meta[name="author"],meta[name="language"],meta[name="twitter:card"],meta[name="twitter:url"],meta[name="twitter:title"],meta[name="twitter:description"],meta[name="twitter:image"]',
      "name",
    );
    keepLastByAttribute(
      'meta[property="og:type"],meta[property="og:url"],meta[property="og:title"],meta[property="og:description"],meta[property="og:image"],meta[property="og:site_name"],meta[property="og:locale"]',
      "property",
    );
    keepLastByAttribute('link[rel="canonical"]', "rel");
  });
}

async function renderRoute(browser: Browser, route: string): Promise<{ route: string; jsonLd: boolean; headReady: boolean; bytes: number }> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
  try {
    page.setDefaultTimeout(RENDER_TIMEOUT);
    await page.goto(`${ORIGIN}${route}`, { waitUntil: "networkidle", timeout: NAV_TIMEOUT }).catch(async () => {
      // networkidle can never settle (polling/maps): fall back to DOM ready.
      await page.goto(`${ORIGIN}${route}`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    });

    // Main content mounted and non-empty (i.e. the Suspense PageLoader is gone).
    await page.waitForFunction(
      () => {
        const main = document.querySelector("#main-content");
        return !!main && (main.textContent || "").trim().length > 200;
      },
      undefined,
      { timeout: RENDER_TIMEOUT },
    ).catch(() => { /* keep whatever rendered */ });

    // Helmet updates the head after React has mounted. Waiting only for body
    // content can capture the generic SPA fallback title/meta on deep routes.
    const expectedCanonical = canonicalForRoute(route);
    const headReady = await page
      .waitForFunction(
        ({ canonical, fallbackTitle }) => {
          const canonicalOk = !!document.head.querySelector(`link[rel="canonical"][href="${canonical}"]`);
          const title = (document.title || "").trim();
          return canonicalOk && (canonical === "https://infoeau.fr/" || title !== fallbackTitle);
        },
        { canonical: expectedCanonical, fallbackTitle: FALLBACK_TITLE },
        { timeout: RENDER_TIMEOUT },
      )
      .then(() => true)
      .catch(() => false);

    // JSON-LD injected by react-helmet-async (best effort).
    const jsonLd = await page
      .waitForSelector('head script[type="application/ld+json"]', { state: "attached", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    await normalizeHead(page);

    const html = await page.content();
    const file = outFile(route);
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, html);
    return { route, jsonLd, headReady, bytes: html.length };
  } finally {
    await page.close().catch(() => {});
  }
}
/**
 * Resolve a Chromium binary. Playwright's own download is used by default; when
 * the installed browser revision doesn't match the npm package (common in CI
 * images shipping a pre-baked browsers dir), fall back to any chromium found in
 * PLAYWRIGHT_BROWSERS_PATH. Override explicitly with PRERENDER_CHROMIUM_PATH.
 */
function resolveChromiumPath(): string | undefined {
  const explicit = process.env.PRERENDER_CHROMIUM_PATH;
  if (explicit && existsSync(explicit)) return explicit;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !existsSync(base)) return undefined;
  try {
    const dirs = readdirSync(base).filter((d) => d.startsWith("chromium"));
    for (const d of dirs.sort().reverse()) {
      for (const bin of ["chrome-linux/chrome", "chrome-linux/headless_shell"]) {
        const p = join(base, d, bin);
        if (existsSync(p)) return p;
      }
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch({ headless: true });
  } catch (e) {
    const executablePath = resolveChromiumPath();
    if (executablePath) {
      console.log(`[prerender] using fallback chromium at ${executablePath}`);
      return await chromium.launch({ headless: true, executablePath });
    }
    // No browser in the image (typical CI/prod build): install on the fly once.
    console.log("[prerender] no chromium found — running `playwright install chromium`…");
    const { execSync } = await import("child_process");
    try {
      execSync("npx --yes playwright install --with-deps chromium", { stdio: "inherit", timeout: 10 * 60_000 });
    } catch {
      execSync("npx --yes playwright install chromium", { stdio: "inherit", timeout: 10 * 60_000 });
    }
    return await chromium.launch({ headless: true });
  }
}



async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    console.warn("[prerender] dist/index.html missing — run `vite build` first. Skipping (non-fatal).");
    return;
  }

  const args = process.argv.slice(2);
  const onlyArg = args.find((a) => a.startsWith("--only="))?.slice("--only=".length);
  const limitArg = args.find((a) => a.startsWith("--limit="))?.slice("--limit=".length);

  let routes: string[];
  if (onlyArg) {
    routes = onlyArg.split(",").map((r) => r.trim()).filter(Boolean);
  } else {
    const blogSlugs = await fetchBlogSlugs(MAX_BLOG);
    routes = [...buildRouteList(), ...blogSlugs.map((s) => `/lettre-de-leau/${s}`)];
    if (limitArg) routes = routes.slice(0, Number(limitArg));
  }

  let server: Server | undefined;
  let browser: Browser | undefined;
  const failures: { route: string; error: string }[] = [];
  let ok = 0;
  let withJsonLd = 0;

  try {
    server = await startServer();
    browser = await launchBrowser();
    console.log(`[prerender] serving dist on ${ORIGIN} — ${routes.length} routes, concurrency ${CONCURRENCY}`);

    const queue = [...routes];
    const worker = async () => {
      for (;;) {
        const route = queue.shift();
        if (!route) return;
        try {
          const r = await renderRoute(browser!, route);
          ok += 1;
          if (r.jsonLd) withJsonLd += 1;
          console.log(
            `[prerender] ok   ${route}  (${Math.round(r.bytes / 1024)} kB${r.jsonLd ? ", JSON-LD" : ", no JSON-LD"}${r.headReady ? ", head" : ", head fallback"})`,
          );
        } catch (e) {
          const error = (e as Error).message.split("\n")[0];
          failures.push({ route, error });
          console.warn(`[prerender] FAIL ${route} — ${error}`);
        }
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker));
  } catch (e) {
    console.warn("[prerender] aborted (non-fatal):", (e as Error).message);
  } finally {
    await browser?.close().catch(() => {});
    await new Promise<void>((done) => (server ? server.close(() => done()) : done()));
  }

  console.log(
    `[prerender] done — ${ok}/${routes.length} routes rendered, ${withJsonLd} with JSON-LD, ${failures.length} failed`,
  );
  if (failures.length) {
    console.warn("[prerender] failures:");
    for (const f of failures) console.warn(`  - ${f.route}: ${f.error}`);
  }
}

main().catch((e) => {
  console.warn("[prerender] unexpected error (non-fatal):", e);
});
