// SEO data for all pages
export const seoData = {
  home: {
    title: "InfoEau.fr - Qualité de l'eau potable en France",
    description: "Découvrez la qualité de l'eau potable dans votre commune. Analyses officielles, comparaisons d'eaux en bouteille, diagnostic personnalisé et données transparentes.",
    keywords: "qualité eau potable France, analyse eau robinet, diagnostic eau commune, transparence eau potable, ARS données eau",
    ogImage: "/images/og-home.jpg",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "InfoEau.fr",
      "url": "https://infoeau.fr",
      "description": "Plateforme citoyenne de transparence sur la qualité de l'eau potable en France",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://infoeau.fr/diagnostic?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "author": {
        "@type": "Organization",
        "name": "InfoEau.fr"
      }
    }
  },
  
  carte: {
    title: "Carte interactive de la qualité de l'eau en France",
    description: "Explorez la carte interactive de la qualité de l'eau potable en France. Visualisez les données par région et découvrez la qualité de l'eau près de chez vous.",
    keywords: "carte qualité eau France, visualisation données eau potable, régions qualité eau, carte interactive eau robinet",
    ogImage: "/images/og-carte.jpg",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Carte des eaux - Qualité nationale",
      "description": "Carte interactive de la qualité de l'eau potable en France par région",
      "url": "https://infoeau.fr/carte",
      "isPartOf": {
        "@type": "WebSite",
        "url": "https://infoeau.fr"
      }
    }
  },

  diagnostic: {
    title: "Diagnostic qualité eau - Analysez l'eau de votre commune",
    description: "Obtenez un diagnostic personnalisé de la qualité de l'eau potable dans votre commune. Analyses officielles détaillées, polluants détectés et conformité réglementaire.",
    keywords: "diagnostic eau commune, analyse eau potable ville, qualité eau robinet par commune, contrôle sanitaire eau",
    ogImage: "/images/og-diagnostic.jpg",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Diagnostic personnalisé qualité de l'eau",
      "description": "Diagnostic personnalisé de la qualité de l'eau potable par commune",
      "url": "https://infoeau.fr/diagnostic"
    }
  },

  bouteilles: {
    title: "Comparaison eau du robinet vs eaux en bouteille",
    description: "Comparez l'eau du robinet aux eaux en bouteille : qualité, prix, impact environnemental. Découvrez quelle eau choisir pour votre santé et votre budget.",
    keywords: "eau robinet vs bouteille, comparaison eaux minérales, prix eau bouteille vs robinet, impact environnemental eau bouteille",
    ogImage: "/images/og-bouteilles.jpg",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Eau du robinet vs Bouteilles - Comparaison complète",
      "description": "Comparaison détaillée entre eau du robinet et eaux en bouteille",
      "url": "https://infoeau.fr/bouteilles"
    }
  },

  comparatifBouteilles: {
    title: "Comparateur eaux en bouteille - Composition et prix",
    description: "Comparez jusqu'à 3 eaux en bouteille simultanément : composition minérale, prix, origine, impact environnemental. Trouvez l'eau qui vous convient.",
    keywords: "comparateur eaux minérales, composition eaux bouteille, prix eaux minérales, comparaison Evian Contrex Badoit",
    ogImage: "/images/og-comparatif.jpg"
  },

  polluants: {
    title: "Polluants dans l'eau potable - Guide complet",
    description: "Découvrez les différents polluants présents dans l'eau potable : pesticides, métaux lourds, nitrates. Comprenez leurs effets et les seuils réglementaires.",
    keywords: "polluants eau potable, pesticides eau robinet, métaux lourds eau, nitrates eau potable, contamination eau France",
    ogImage: "/images/og-polluants.jpg"
  },

  quelleEauBoire: {
    title: "Quelle eau boire ? Recommandations personnalisées",
    description: "Obtenez des recommandations d'eaux en bouteille adaptées à votre profil : femme enceinte, sportif, problèmes rénaux. Conseils personnalisés et scientifiques.",
    keywords: "quelle eau boire, recommandations eau personnalisées, eau femme enceinte, eau sportif, eau problèmes rénaux",
    ogImage: "/images/og-recommandations.jpg",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Quelle eau boire ? - Guide personnalisé",
      "description": "Outil d'aide au choix d'eau en bouteille selon votre profil et besoins spécifiques",
      "url": "https://infoeau.fr/quelle-eau-boire",
      "isPartOf": {
        "@type": "WebSite",
        "url": "https://infoeau.fr"
      },
      "about": {
        "@type": "Thing",
        "name": "Recommandations d'eau en bouteille"
      }
    }
  }
};

// Generate breadcrumb schema
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Generate FAQ schema
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Generate product schema for bottle water comparison
export const generateWaterProductSchema = (waterData: {
  name: string;
  brand: string;
  price: number;
  composition: Record<string, number>;
  type: string;
  source?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": waterData.name,
  "brand": {
    "@type": "Brand",
    "name": waterData.brand
  },
  "offers": {
    "@type": "Offer",
    "price": waterData.price,
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Type d'eau",
      "value": waterData.type
    },
    ...(waterData.source ? [{
      "@type": "PropertyValue",
      "name": "Source",
      "value": waterData.source
    }] : []),
    ...Object.entries(waterData.composition).map(([mineral, value]) => ({
      "@type": "PropertyValue",
      "name": mineral,
      "value": `${value} mg/L`
    }))
  ]
});