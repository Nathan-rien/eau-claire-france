export type AppLanguage = 'fr' | 'en';

export const LANG_PREFIX = '/en';

/**
 * Derive the language from a URL pathname. The URL is the single source of
 * truth: `/en` or `/en/...` → English, everything else → French.
 * No localStorage / navigator sniffing here (crawlers must get the same result).
 */
export const getLanguageFromPath = (pathname: string): AppLanguage =>
  /^\/en(\/|$)/.test(pathname) ? 'en' : 'fr';

/** Remove the `/en` prefix from a pathname, returning the canonical FR path. */
export const stripLangPrefix = (pathname: string): string => {
  const stripped = pathname.replace(/^\/en(?=\/|$)/, '');
  return stripped === '' ? '/' : stripped;
};

/**
 * Prefix an internal path with the language segment.
 * FR keeps the historical (ranking) URLs untouched.
 */
export const localizePath = (path: string, lang: AppLanguage): string => {
  if (typeof path !== 'string' || path === '') return path;
  // Leave absolute URLs, anchors, mailto/tel and query-only links alone.
  if (/^([a-z]+:)?\/\//i.test(path) || /^(mailto:|tel:|#|\?)/i.test(path)) return path;
  if (!path.startsWith('/')) return path; // relative link: router resolves it in-context

  const base = stripLangPrefix(path);
  if (lang === 'fr') return base;
  return base === '/' ? LANG_PREFIX : `${LANG_PREFIX}${base}`;
};

/**
 * Pages with international value, promoted in English (/en).
 * Single source of truth for hreflang (SEOHead) and the bilingual sitemap.
 * Paths are UNPREFIXED (FR canonical form).
 */
export const INTERNATIONAL_PATHS: string[] = [
  '/',
  '/traiter-eau-robinet',
  '/guide/eau-calcaire',
  '/guide/gout-chlore',
  '/guide/nitrates-eau',
  '/guide/plomb-eau',
  '/comparatif-carafes',
  '/comparatif-filtres-eau',
  '/guide/quel-filtre-eau',
  '/bouteille-ou-filtration',
  '/calculateur-hydratation',
  '/carte-europe',
  '/carte-polluants-europe',
  '/classement-europe',
  '/polluants-europe',
  '/diagnostic-europe',
  '/alertes-europe',
  '/prix-eaux',
  '/marques',
  '/prix-eaux-europe',
  '/composition-europe',
  '/parcours-eau',
  '/parcours-eau-bouteille',
];

export const isInternationalPath = (path: string): boolean =>
  INTERNATIONAL_PATHS.includes(stripLangPrefix(path));
