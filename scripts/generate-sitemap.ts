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
import { INTERNATIONAL_PATHS } from "../src/lib/i18nRoutes";
import { staticEntries, brandEntries, communeEntries, type SitemapEntry } from "./routes";


const BASE_URL = "https://infoeau.fr";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xblogttmomuogdhmaztf.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibG9ndHRtb211b2dkaG1henRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYwNTgsImV4cCI6MjA2NTk4MjA1OH0._CAQGXwo2ZJYmwvvstGJ2bnC65vT9fHcTyuXwgNalP8";




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

  const altLinks = (path: string): string[] => {
    const fr = `${BASE_URL}${path}`;
    const en = `${BASE_URL}/en${path === "/" ? "" : path}`;
    return [
      `    <xhtml:link rel="alternate" hreflang="fr" href="${fr}" />`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${en}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${fr}" />`,
    ];
  };

  const renderUrl = (e: SitemapEntry, loc: string, alternates: string[] | null) => {
    const parts = [
      `  <url>`,
      `    <loc>${loc}</loc>`,
      ...(alternates ?? []),
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      e.imageLoc
        ? `    <image:image>\n      <image:loc>${BASE_URL}${e.imageLoc}</image:loc>\n      <image:title>${xmlEscape(e.imageTitle ?? "")}</image:title>\n    </image:image>`
        : null,
      `  </url>`,
    ].filter(Boolean);
    urls.push(parts.join("\n"));
  };

  for (const e of entries) {
    if (INTERNATIONAL_PATHS.includes(e.path)) {
      const alts = altLinks(e.path);
      renderUrl(e, `${BASE_URL}${e.path}`, alts);
      renderUrl(e, `${BASE_URL}/en${e.path === "/" ? "" : e.path}`, alts);
    } else {
      renderUrl(e, `${BASE_URL}${e.path}`, null);
    }
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
        ? `    <image:image>\n      <image:loc>${xmlEscape(a.cover_image_url.startsWith('http') ? a.cover_image_url : `${BASE_URL}${a.cover_image_url}`)}</image:loc>\n      <image:title>${xmlEscape(a.title)}</image:title>\n    </image:image>`
        : null,
      `  </url>`,
    ].filter(Boolean);
    urls.push(parts.join("\n"));
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
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

  // Commune SEO pages (liste partagée avec le prerender)
  const communes = communeEntries();

  const allEntries = [...staticEntries, ...brandEntries, ...communes];
  const sitemap = buildSitemap(allEntries, articles);
  writeFileSync(resolve("public/sitemap.xml"), sitemap);
  console.log(`[sitemap] ${staticEntries.length} static + ${brandEntries.length} brands + ${communes.length} communes + ${articles.length} blog entries`);


  mkdirSync(resolve("public/lettre-de-leau"), { recursive: true });
  writeFileSync(resolve("public/lettre-de-leau/rss.xml"), buildRss(articles));
  console.log(`[rss] ${Math.min(articles.length, 30)} items`);
})();
