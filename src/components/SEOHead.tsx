import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  schemaData?: object | object[];
  hreflang?: { [key: string]: string };
  // Article-specific OG tags
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
  articleAuthor?: string;
  rssUrl?: string;
  noindex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = "qualité eau potable France, analyse eau robinet, eaux bouteilles comparaison, polluants eau",
  canonical,
  ogImage = "/images/og-default.jpg",
  ogType = "website",
  schemaData,
  hreflang = {},
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags,
  articleAuthor,
  rssUrl,
  noindex = false,
}) => {
  const siteUrl = "https://infoeau.fr";
  const fullTitle = title.includes('InfoEau') ? title : `${title} | InfoEau.fr - Qualité de l'eau potable en France`;
  // Canonical must always point to the production domain infoeau.fr — never to
  // preview/lovable.app hosts. When no explicit canonical prop is given, we
  // build it from the current pathname but force the infoeau.fr origin.
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : `${siteUrl}${currentPath}`;
  const ogImageUrl = ogImage?.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const schemas = schemaData ? (Array.isArray(schemaData) ? schemaData : [schemaData]) : [];

  // Force noindex on non-production hosts (lovable.app previews) to avoid
  // duplicate content between infoeau.fr and *.lovable.app in Google index.
  const isNonProdHost = typeof window !== 'undefined' &&
    /(^|\.)lovable\.app$/.test(window.location.hostname);
  const effectiveNoindex = noindex || isNonProdHost;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={effectiveNoindex ? "noindex, follow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      <meta name="author" content={articleAuthor || "InfoEau.fr"} />
      <meta name="language" content="fr" />

      <link rel="canonical" href={canonicalUrl} />

      {rssUrl && (
        <link rel="alternate" type="application/rss+xml" title="Lettre de l'eau — InfoEau.fr" href={`${siteUrl}${rssUrl}`} />
      )}

      {Object.entries(hreflang).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content="InfoEau.fr" />
      <meta property="og:locale" content="fr_FR" />

      {ogType === 'article' && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {ogType === 'article' && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {ogType === 'article' && articleSection && (
        <meta property="article:section" content={articleSection} />
      )}
      {ogType === 'article' && articleAuthor && (
        <meta property="article:author" content={articleAuthor} />
      )}
      {ogType === 'article' && articleTags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
