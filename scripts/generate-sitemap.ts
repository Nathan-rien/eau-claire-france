/**
 * Generates public/sitemap.xml and public/lettre-de-leau/rss.xml
 * Runs via `predev` / `prebuild` hooks.
 *
 * - Preserves all static routes
 * - Adds /lettre-de-leau and dynamic blog articles fetched from Supabase
 * - Generates RSS feed for the blog
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { FRENCH_CITIES } from "../src/data/frenchCities";

const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const communeSlug = (name: string, postcode: string) =>
  `${stripAccents(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${postcode}`;

const BASE_URL = "https://infoeau.fr";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xblogttmomuogdhmaztf.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibG9ndHRtb211b2dkaG1henRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYwNTgsImV4cCI6MjA2NTk4MjA1OH0._CAQGXwo2ZJYmwvvstGJ2bnC65vT9fHcTyuXwgNalP8";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  imageLoc?: string;
  imageTitle?: string;
}

const today = new Date().toISOString().slice(0, 10);

const staticEntries: SitemapEntry[] = [
  { path: "/", lastmod: today, changefreq: "weekly", priority: "1.0", imageLoc: "/images/og-default.jpg", imageTitle: "InfoEau.fr - Qualité de l'eau potable en France" },
  { path: "/carte", lastmod: today, changefreq: "weekly", priority: "0.9" },
  { path: "/diagnostic", lastmod: today, changefreq: "weekly", priority: "0.9" },
  { path: "/carte-polluants", lastmod: today, changefreq: "weekly", priority: "0.8" },
  { path: "/quelle-eau-boire", lastmod: today, changefreq: "weekly", priority: "0.8" },
  { path: "/polluants", lastmod: today, changefreq: "monthly", priority: "0.8" },
  { path: "/cours-eau", lastmod: today, changefreq: "daily", priority: "0.8" },
  { path: "/parcours-eau", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/parcours-eau-bouteille", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/carte-parcours-eau", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/carte-parcours-robinet", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/prix-eaux", lastmod: today, changefreq: "daily", priority: "0.8" },
  { path: "/comparateur-prix", lastmod: today, changefreq: "daily", priority: "0.8" },
  { path: "/sources-eau", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/marque/evian", lastmod: today, changefreq: "weekly", priority: "0.6" },
  { path: "/marque/cristaline", lastmod: today, changefreq: "weekly", priority: "0.6" },
  { path: "/marque/volvic", lastmod: today, changefreq: "weekly", priority: "0.6" },
  { path: "/marque/vittel", lastmod: today, changefreq: "weekly", priority: "0.6" },
  { path: "/marque/perrier", lastmod: today, changefreq: "weekly", priority: "0.6" },
  { path: "/marque/hepar", lastmod: today, changefreq: "weekly", priority: "0.6" },
  { path: "/marque/badoit", lastmod: today, changefreq: "weekly", priority: "0.6" },
  { path: "/marque/contrex", lastmod: today, changefreq: "weekly", priority: "0.6" },
  { path: "/marque/mont-roucous", lastmod: today, changefreq: "weekly", priority: "0.6" },
  { path: "/marque/saint-amand", lastmod: today, changefreq: "weekly", priority: "0.6" },
  { path: "/classement", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/alertes", lastmod: today, changefreq: "daily", priority: "0.7" },
  // Blog index
  { path: "/lettre-de-leau", lastmod: today, changefreq: "weekly", priority: "0.85" },
  // Goût de l'eau
  { path: "/gout-eau", lastmod: today, changefreq: "weekly", priority: "0.75" },
  // Qualité de l'eau par commune (hub)
  { path: "/qualite-eau", lastmod: today, changefreq: "weekly", priority: "0.85" },
  // Guides thématiques
 { path: "/guide/eaux-riches-magnesium", lastmod: today, changefreq: "monthly", priority: "0.75" },
 { path: "/guide/ma-commune", lastmod: today, changefreq: "monthly", priority: "0.85" },
  // Cluster « traiter l'eau du robinet » (seule la page pilier est indexable)
  { path: "/traiter-eau-robinet", lastmod: today, changefreq: "monthly", priority: "0.85" },
  { path: "/bouteille-ou-filtration", lastmod: today, changefreq: "monthly", priority: "0.8" },
  { path: "/comparatif-carafes", lastmod: today, changefreq: "monthly", priority: "0.8" },
  { path: "/guide/eau-calcaire", lastmod: today, changefreq: "monthly", priority: "0.75" },
  { path: "/guide/gout-chlore", lastmod: today, changefreq: "monthly", priority: "0.75" },
  { path: "/guide/nitrates-eau", lastmod: today, changefreq: "monthly", priority: "0.75" },
  { path: "/guide/plomb-eau", lastmod: today, changefreq: "monthly", priority: "0.75" },
  // Actualités / alertes détaillées
  { path: "/actualites/pollution-manganese-vendee-juillet-2026", lastmod: "2026-07-09", changefreq: "monthly", priority: "0.7" },
  // Europe
  { path: "/carte-europe", lastmod: today, changefreq: "weekly", priority: "0.8" },
  { path: "/carte-polluants-europe", lastmod: today, changefreq: "weekly", priority: "0.8" },
  { path: "/classement-europe", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/polluants-europe", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/diagnostic-europe", lastmod: today, changefreq: "weekly", priority: "0.7" },
  { path: "/alertes-europe", lastmod: today, changefreq: "daily", priority: "0.7" },
  { path: "/prix-eaux-europe", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/composition-europe", lastmod: today, changefreq: "monthly", priority: "0.7" },
  // Informatives
  { path: "/sources", lastmod: today, changefreq: "monthly", priority: "0.6" },
  { path: "/methodologie", lastmod: today, changefreq: "monthly", priority: "0.6" },
  { path: "/api-publique", lastmod: today, changefreq: "monthly", priority: "0.5" },
  { path: "/open-data", lastmod: today, changefreq: "monthly", priority: "0.5" },
  { path: "/a-propos", lastmod: today, changefreq: "monthly", priority: "0.4" },
  { path: "/contact", lastmod: today, changefreq: "monthly", priority: "0.4" },
  // Légales
  { path: "/mentions-legales", lastmod: today, changefreq: "yearly", priority: "0.3" },
  { path: "/rgpd", lastmod: today, changefreq: "yearly", priority: "0.3" },
  { path: "/accessibilite", lastmod: today, changefreq: "yearly", priority: "0.3" },
];

interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  published_at: string;
  category: string;
}

async function fetchBlogArticles(): Promise<BlogArticle[]> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_articles?select=slug,title,excerpt,cover_image_url,published_at,category&status=eq.published&order=published_at.desc&limit=500`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) {
      console.warn(`[sitemap] Could not fetch blog articles (HTTP ${res.status}). Skipping blog entries.`);
      return [];
    }
    return await res.json();
  } catch (e) {
    console.warn("[sitemap] Blog fetch failed:", (e as Error).message);
    return [];
  }
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(entries: SitemapEntry[], articles: BlogArticle[]): string {
  const urls: string[] = [];

  for (const e of entries) {
    const parts = [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      e.imageLoc
        ? `    <image:image>\n      <image:loc>${BASE_URL}${e.imageLoc}</image:loc>\n      <image:title>${xmlEscape(e.imageTitle ?? "")}</image:title>\n    </image:image>`
        : null,
      `  </url>`,
    ].filter(Boolean);
    urls.push(parts.join("\n"));
  }

  for (const a of articles) {
    const lastmod = a.published_at.slice(0, 10);
    const parts = [
      `  <url>`,
      `    <loc>${BASE_URL}/lettre-de-leau/${a.slug}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>monthly</changefreq>`,
      `    <priority>0.75</priority>`,
      a.cover_image_url
        ? `    <image:image>\n      <image:loc>${xmlEscape(a.cover_image_url)}</image:loc>\n      <image:title>${xmlEscape(a.title)}</image:title>\n    </image:image>`
        : null,
      `  </url>`,
    ].filter(Boolean);
    urls.push(parts.join("\n"));
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

function buildRss(articles: BlogArticle[]): string {
  const items = articles.slice(0, 30).map((a) => {
    const link = `${BASE_URL}/lettre-de-leau/${a.slug}`;
    return [
      `    <item>`,
      `      <title>${xmlEscape(a.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>`,
      `      <category>${xmlEscape(a.category)}</category>`,
      `      <description>${xmlEscape(a.excerpt ?? "")}</description>`,
      a.cover_image_url
        ? `      <enclosure url="${xmlEscape(a.cover_image_url)}" type="image/jpeg" />`
        : null,
      `    </item>`,
    ].filter(Boolean).join("\n");
  });

  const lastBuild = new Date().toUTCString();
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    `  <channel>`,
    `    <title>Lettre de l'eau — InfoEau.fr</title>`,
    `    <link>${BASE_URL}/lettre-de-leau</link>`,
    `    <atom:link href="${BASE_URL}/lettre-de-leau/rss.xml" rel="self" type="application/rss+xml" />`,
    `    <description>Actualités, scandales, réglementation et enquêtes sur la qualité de l'eau en France.</description>`,
    `    <language>fr-FR</language>`,
    `    <lastBuildDate>${lastBuild}</lastBuildDate>`,
    ...items,
    `  </channel>`,
    `</rss>`,
    ``,
  ].join("\n");
}

(async () => {
  const articles = await fetchBlogArticles();

  // Commune SEO pages
  const communeEntries: SitemapEntry[] = FRENCH_CITIES.map((c) => ({
    path: `/qualite-eau/${communeSlug(c.name, c.postcode)}`,
    lastmod: today,
    changefreq: "monthly",
    priority: "0.7",
  }));

  const allEntries = [...staticEntries, ...communeEntries];
  const sitemap = buildSitemap(allEntries, articles);
  writeFileSync(resolve("public/sitemap.xml"), sitemap);
  console.log(`[sitemap] ${staticEntries.length} static + ${communeEntries.length} communes + ${articles.length} blog entries`);

  mkdirSync(resolve("public/lettre-de-leau"), { recursive: true });
  writeFileSync(resolve("public/lettre-de-leau/rss.xml"), buildRss(articles));
  console.log(`[rss] ${Math.min(articles.length, 30)} items`);
})();
