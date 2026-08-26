/**
 * Shared route inventory used by BOTH scripts/generate-sitemap.ts and
 * scripts/prerender.ts. Single source of truth — do not duplicate route lists.
 */
import { FRENCH_CITIES } from "../src/data/frenchCities";
import { PRICED_BRAND_SLUGS } from "../src/config/pricedBrands";

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  imageLoc?: string;
  imageTitle?: string;
}

const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export const communeSlug = (name: string, postcode: string) =>
  `${stripAccents(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${postcode}`;

export const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", imageLoc: "/images/og-image.png", imageTitle: "InfoEau.fr - Qualité de l'eau potable en France" },
  { path: "/carte", changefreq: "weekly", priority: "0.9" },
  { path: "/diagnostic", changefreq: "weekly", priority: "0.9" },
  { path: "/carte-polluants", changefreq: "weekly", priority: "0.8" },
  { path: "/quelle-eau-boire", changefreq: "weekly", priority: "0.8" },
  { path: "/polluants", changefreq: "monthly", priority: "0.8" },
  { path: "/cours-eau", changefreq: "daily", priority: "0.8" },
  { path: "/parcours-eau", changefreq: "monthly", priority: "0.7" },
  { path: "/parcours-eau-bouteille", changefreq: "monthly", priority: "0.7" },
  { path: "/carte-parcours-eau", changefreq: "monthly", priority: "0.7" },
  { path: "/carte-parcours-robinet", changefreq: "monthly", priority: "0.7" },
  { path: "/prix-eaux", changefreq: "daily", priority: "0.8" },
  // /comparateur-prix n'existe pas comme route : retiré (soft 404 / doublon de /prix-eaux).
  // /comparatif-bouteilles et /bouteilles redirigent vers /classement : hors sitemap.
  { path: "/sources-eau", changefreq: "monthly", priority: "0.7" },
  // Les pages /marque/* sont générées depuis PRICED_BRAND_SLUGS (voir brandEntries).
  { path: "/classement", changefreq: "monthly", priority: "0.7" },
  { path: "/alertes", changefreq: "daily", priority: "0.7" },
  // Blog index
  { path: "/lettre-de-leau", changefreq: "weekly", priority: "0.85" },
  // Goût de l'eau
  { path: "/gout-eau", changefreq: "weekly", priority: "0.75" },
  // Qualité de l'eau par commune (hub)
  { path: "/qualite-eau", changefreq: "weekly", priority: "0.85" },
  // Guides thématiques
  { path: "/guide/eaux-riches-magnesium", changefreq: "monthly", priority: "0.75" },
  { path: "/guide/ma-commune", changefreq: "monthly", priority: "0.85" },
  // Cluster « traiter l'eau du robinet » (seule la page pilier est indexable)
  { path: "/traiter-eau-robinet", changefreq: "monthly", priority: "0.85" },
  { path: "/bouteille-ou-filtration", changefreq: "monthly", priority: "0.8" },
  { path: "/comparatif-carafes", changefreq: "monthly", priority: "0.8" },
  { path: "/comparatif-filtres-eau", changefreq: "monthly", priority: "0.85" },
  { path: "/durete-eau-france", changefreq: "monthly", priority: "0.7" },
  // Eaux minérales par région d'origine (contenu franco-français, hors /en)
  { path: "/eaux-minerales-alpes", changefreq: "monthly", priority: "0.6" },
  { path: "/eaux-minerales-vosges", changefreq: "monthly", priority: "0.6" },
  { path: "/eaux-minerales-auvergne", changefreq: "monthly", priority: "0.6" },
  { path: "/eaux-minerales-pyrenees", changefreq: "monthly", priority: "0.6" },
  { path: "/eaux-minerales-mediterranee", changefreq: "monthly", priority: "0.6" },
  { path: "/guide/eau-calcaire", changefreq: "monthly", priority: "0.75" },
  { path: "/guide/gout-chlore", changefreq: "monthly", priority: "0.75" },
  { path: "/guide/nitrates-eau", changefreq: "monthly", priority: "0.75" },
  { path: "/guide/plomb-eau", changefreq: "monthly", priority: "0.75" },
  { path: "/guide/quel-filtre-eau", changefreq: "monthly", priority: "0.8" },
  { path: "/calculateur-hydratation", changefreq: "monthly", priority: "0.7" },
  // Actualités / alertes détaillées
  { path: "/actualites/pollution-manganese-vendee-juillet-2026", lastmod: "2026-07-09", changefreq: "monthly", priority: "0.7" },
  // Europe
  { path: "/carte-europe", changefreq: "weekly", priority: "0.8" },
  { path: "/carte-polluants-europe", changefreq: "weekly", priority: "0.8" },
  { path: "/classement-europe", changefreq: "monthly", priority: "0.7" },
  { path: "/polluants-europe", changefreq: "monthly", priority: "0.7" },
  { path: "/diagnostic-europe", changefreq: "weekly", priority: "0.7" },
  { path: "/alertes-europe", changefreq: "daily", priority: "0.7" },
  { path: "/prix-eaux-europe", changefreq: "monthly", priority: "0.7" },
  { path: "/composition-europe", changefreq: "monthly", priority: "0.7" },
  // Informatives
  { path: "/sources", changefreq: "monthly", priority: "0.6" },
  { path: "/methodologie", changefreq: "monthly", priority: "0.6" },
  { path: "/api-publique", changefreq: "monthly", priority: "0.5" },
  { path: "/open-data", changefreq: "monthly", priority: "0.5" },
  { path: "/a-propos", changefreq: "monthly", priority: "0.4" },
  { path: "/contact", changefreq: "monthly", priority: "0.4" },
  // Légales
  { path: "/mentions-legales", changefreq: "yearly", priority: "0.3" },
  { path: "/rgpd", changefreq: "yearly", priority: "0.3" },
  { path: "/accessibilite", changefreq: "yearly", priority: "0.3" },
];

/** Pages marque : exactement les marques ayant des prix (même liste que le noindex). */
export const brandEntries: SitemapEntry[] = PRICED_BRAND_SLUGS.map((slug) => ({
  path: `/marque/${slug}`,
  changefreq: "weekly",
  priority: "0.6",
}));

/** Pages commune indexables. `limit` permet de plafonner (prerender). */
export const communeEntries = (limit?: number): SitemapEntry[] => {
  const all = FRENCH_CITIES.filter((c) => c.indexable !== false).map((c) => ({
    path: `/qualite-eau/${communeSlug(c.name, c.postcode)}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  }));
  return typeof limit === "number" ? all.slice(0, limit) : all;
};
