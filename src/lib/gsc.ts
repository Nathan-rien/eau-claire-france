export const GSC_PROPERTY = 'sc-domain:infoeau.fr';

/** Lien direct vers l'inspection d'URL Search Console (depuis laquelle on peut demander l'indexation). */
export const gscInspectUrl = (url: string) =>
  `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(
    GSC_PROPERTY,
  )}&id=${encodeURIComponent(url)}`;

/** Rapport d'indexation des pages. */
export const gscCoverageUrl = () =>
  `https://search.google.com/search-console/index?resource_id=${encodeURIComponent(GSC_PROPERTY)}`;

/** Rapport sitemaps. */
export const gscSitemapsUrl = () =>
  `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(GSC_PROPERTY)}`;
