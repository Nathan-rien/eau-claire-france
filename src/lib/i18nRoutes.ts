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
