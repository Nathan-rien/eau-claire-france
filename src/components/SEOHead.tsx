import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  schemaData?: object;
  hreflang?: { [key: string]: string };
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = "qualité eau potable France, analyse eau robinet, eaux bouteilles comparaison, polluants eau",
  canonical,
  ogImage = "/images/og-default.jpg",
  ogType = "website",
  schemaData,
  hreflang = { 'fr': window.location.href, 'en': window.location.href.replace('infoeau.fr', 'infoeau.fr/en') }
}) => {
  const siteUrl = "https://infoeau.fr";
  const fullTitle = title.includes('InfoEau') ? title : `${title} | InfoEau.fr - Qualité de l'eau potable en France`;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="InfoEau.fr" />
      <meta name="language" content="fr" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang for multilingual */}
      {Object.entries(hreflang).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="InfoEau.fr" />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Schema.org structured data */}
      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;