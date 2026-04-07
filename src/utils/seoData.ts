// SEO data for all pages - France & Europe
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
      "author": { "@type": "Organization", "name": "InfoEau.fr" }
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
      "isPartOf": { "@type": "WebSite", "url": "https://infoeau.fr" }
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
    ogImage: "/images/og-comparatif.jpg",
    canonical: "/comparatif-bouteilles",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Comparateur d'eaux en bouteille",
      "description": "Comparez composition minérale, prix et origine de plus de 50 eaux en bouteille",
      "url": "https://infoeau.fr/comparatif-bouteilles",
      "isPartOf": { "@type": "WebSite", "url": "https://infoeau.fr" }
    }
  },

  polluants: {
    title: "Polluants dans l'eau potable - Guide complet",
    description: "Découvrez les différents polluants présents dans l'eau potable : pesticides, métaux lourds, nitrates. Comprenez leurs effets et les seuils réglementaires.",
    keywords: "polluants eau potable, pesticides eau robinet, métaux lourds eau, nitrates eau potable, contamination eau France",
    ogImage: "/images/og-polluants.jpg",
    canonical: "/polluants",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Guide des polluants dans l'eau potable",
      "description": "Guide complet sur les polluants dans l'eau potable en France : pesticides, nitrates, métaux lourds",
      "url": "https://infoeau.fr/polluants",
      "isPartOf": { "@type": "WebSite", "url": "https://infoeau.fr" }
    }
  },

  parcoursEau: {
    title: "Parcours de l'eau : du captage au robinet en France",
    description: "Infographie interactive : découvrez comment l'eau potable est captée, traitée, stockée et distribuée en France. Sources, traitement, réseau de distribution.",
    keywords: "parcours eau potable France, traitement eau, captage nappe phréatique, distribution eau robinet, infographie eau",
    ogImage: "/images/og-default.jpg",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Le parcours de l'eau en France - Du captage au robinet",
      "description": "Infographie interactive sur le cycle de l'eau potable en France",
      "url": "https://infoeau.fr/parcours-eau"
    }
  },

  parcoursEauV2: {
    title: "Parcours de l'eau V2 : voyage immersif du captage au robinet",
    description: "Version visuelle et interactive : découvrez comment l'eau potable est captée, traitée, stockée et distribuée en France avec animations et infographies.",
    keywords: "parcours eau potable France, infographie interactive eau, traitement eau immersif, scrollytelling eau",
    ogImage: "/images/og-default.jpg",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Le parcours de l'eau en France - Version immersive",
      "description": "Infographie immersive sur le cycle de l'eau potable en France",
      "url": "https://infoeau.fr/parcours-eau-v2"
    }
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
      "isPartOf": { "@type": "WebSite", "url": "https://infoeau.fr" },
      "about": { "@type": "Thing", "name": "Recommandations d'eau en bouteille" }
    }
  },

  // === Pages institutionnelles ===

  aPropos: {
    title: "À propos d'InfoEau.fr - Notre mission",
    description: "Découvrez l'équipe et la mission d'InfoEau.fr : rendre transparentes et accessibles les données sur la qualité de l'eau potable en France et en Europe.",
    keywords: "InfoEau équipe, mission qualité eau, transparence données eau potable, plateforme citoyenne eau",
    canonical: "/a-propos",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "À propos d'InfoEau.fr",
      "description": "Mission et valeurs de la plateforme InfoEau.fr",
      "url": "https://infoeau.fr/a-propos",
      "isPartOf": { "@type": "WebSite", "url": "https://infoeau.fr" }
    }
  },

  contact: {
    title: "Contactez InfoEau.fr - Questions et suggestions",
    description: "Contactez l'équipe InfoEau.fr pour vos questions sur la qualité de l'eau, signaler un problème, proposer une amélioration ou demander des données.",
    keywords: "contact InfoEau, signaler problème eau, question qualité eau, support InfoEau",
    canonical: "/contact",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact - InfoEau.fr",
      "description": "Formulaire de contact pour questions et suggestions",
      "url": "https://infoeau.fr/contact"
    }
  },

  mentionsLegales: {
    title: "Mentions légales - InfoEau.fr",
    description: "Mentions légales du site InfoEau.fr : éditeur, hébergeur, conditions d'utilisation, propriété intellectuelle et responsabilité.",
    keywords: "mentions légales InfoEau, conditions utilisation, propriété intellectuelle, CGU eau potable",
    canonical: "/mentions-legales",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Mentions légales - InfoEau.fr",
      "url": "https://infoeau.fr/mentions-legales"
    }
  },

  rgpd: {
    title: "Protection des données (RGPD) - InfoEau.fr",
    description: "Politique de protection des données personnelles d'InfoEau.fr conforme au RGPD. Collecte, traitement, droits des utilisateurs et cookies.",
    keywords: "RGPD InfoEau, protection données personnelles, politique confidentialité eau, cookies InfoEau",
    canonical: "/rgpd",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Protection des données (RGPD) - InfoEau.fr",
      "url": "https://infoeau.fr/rgpd"
    }
  },

  accessibilite: {
    title: "Accessibilité numérique - InfoEau.fr",
    description: "Déclaration d'accessibilité numérique d'InfoEau.fr. Conformité RGAA, fonctionnalités d'accessibilité et contact pour signaler un problème.",
    keywords: "accessibilité numérique InfoEau, RGAA conformité, handicap accès eau données, accessibilité web",
    canonical: "/accessibilite",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Accessibilité numérique - InfoEau.fr",
      "url": "https://infoeau.fr/accessibilite"
    }
  },

  // === Pages data ===

  openData: {
    title: "Open Data eau potable - Données ouvertes France & Europe",
    description: "Téléchargez les données ouvertes sur la qualité de l'eau potable en France et en Europe. Formats CSV, JSON, XML. API REST gratuite pour développeurs.",
    keywords: "open data eau potable, données ouvertes qualité eau, télécharger données eau France, API eau potable gratuite",
    canonical: "/open-data",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "DataCatalog",
      "name": "Open Data - Qualité de l'eau potable",
      "description": "Catalogue de données ouvertes sur la qualité de l'eau potable en France et en Europe",
      "url": "https://infoeau.fr/open-data",
      "provider": { "@type": "Organization", "name": "InfoEau.fr" }
    }
  },

  sources: {
    title: "Sources de données - Qualité de l'eau potable",
    description: "Découvrez toutes les sources officielles utilisées par InfoEau.fr : ARS, EauFrance, SISE-Eaux, EEA, Eurostat. Données vérifiées et transparentes.",
    keywords: "sources données eau potable, ARS qualité eau, SISE-Eaux données, EauFrance portail, EEA eau Europe",
    canonical: "/sources",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Sources de données - InfoEau.fr",
      "description": "Sources officielles des données de qualité de l'eau potable",
      "url": "https://infoeau.fr/sources"
    }
  },

  methodologie: {
    title: "Méthodologie - Analyse qualité de l'eau potable",
    description: "Notre méthodologie scientifique pour collecter, analyser et présenter les données de qualité de l'eau potable. Indicateurs, calculs et transparence.",
    keywords: "méthodologie analyse eau, indicateurs qualité eau potable, calcul conformité eau, transparence données eau",
    canonical: "/methodologie",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Méthodologie - InfoEau.fr",
      "description": "Méthodologie scientifique d'analyse de la qualité de l'eau potable",
      "url": "https://infoeau.fr/methodologie"
    }
  },

  apiPublique: {
    title: "API publique qualité eau - Documentation développeurs",
    description: "Documentation de l'API REST gratuite InfoEau.fr. Accédez aux données de qualité de l'eau potable en France et en Europe pour vos applications.",
    keywords: "API eau potable, REST API qualité eau, documentation API eau France, données eau développeurs",
    canonical: "/api-publique",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebAPI",
      "name": "API Publique InfoEau.fr",
      "description": "API REST gratuite pour accéder aux données de qualité de l'eau potable",
      "url": "https://infoeau.fr/api-publique",
      "provider": { "@type": "Organization", "name": "InfoEau.fr" },
      "documentation": "https://infoeau.fr/api-publique"
    }
  },

  // === Pages carte & polluants France ===

  cartePolluants: {
    title: "Carte des polluants dans l'eau potable en France",
    description: "Visualisez la répartition géographique des polluants dans l'eau potable française : pesticides, nitrates, métaux lourds. Identifiez les zones à risque.",
    keywords: "carte polluants eau France, pesticides eau potable carte, nitrates eau carte, zones risque eau potable",
    canonical: "/carte-polluants",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Carte des polluants dans l'eau potable en France",
      "description": "Carte interactive de la répartition des polluants dans l'eau potable française",
      "url": "https://infoeau.fr/carte-polluants"
    }
  },

  // === Pages prix ===

  prixEaux: {
    title: "Prix des eaux en bouteille - Comparateur par enseigne",
    description: "Comparez les prix des eaux en bouteille dans toutes les enseignes françaises. Trouvez les meilleures offres pour Evian, Cristaline, Volvic et plus.",
    keywords: "prix eau bouteille, comparateur prix eau minérale, eau moins chère enseigne, prix Evian Cristaline Volvic",
    canonical: "/prix-eaux",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Prix des eaux en bouteille en France",
      "description": "Comparateur de prix des eaux en bouteille par enseigne",
      "url": "https://infoeau.fr/prix-eaux"
    }
  },

  comparateurPrix: {
    title: "Comparateur de prix - Eaux en bouteille par marque et enseigne",
    description: "Comparez les prix des eaux en bouteille entre marques ou enseignes. Trouvez les meilleures offres et économisez sur vos achats d'eau minérale.",
    keywords: "comparateur prix eau, comparer marques eau bouteille, meilleur prix eau minérale, économiser eau bouteille",
    canonical: "/comparateur-prix",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Comparateur de prix des eaux en bouteille",
      "description": "Outil de comparaison des prix d'eaux en bouteille entre marques et enseignes",
      "url": "https://infoeau.fr/comparateur-prix"
    }
  },

  coursEau: {
    title: "Cours de l'eau - Évolution des prix eau bouteille & robinet",
    description: "Suivez l'évolution historique des prix de l'eau en bouteille et du robinet en France depuis 2010. Graphiques interactifs, facteurs explicatifs et statistiques clés.",
    keywords: "cours eau prix évolution, prix eau bouteille historique, prix eau robinet France, inflation eau potable, tendance prix eau",
    canonical: "/cours-eau",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Cours de l'eau - Évolution des prix en France",
      "description": "Évolution historique des prix de l'eau en bouteille et du robinet en France",
      "url": "https://infoeau.fr/cours-eau",
      "isPartOf": { "@type": "WebSite", "url": "https://infoeau.fr" }
    }
  },

  // === Pages Europe ===

  carteEurope: {
    title: "Carte qualité de l'eau en Europe - 27 pays UE",
    description: "Explorez la qualité de l'eau potable dans les 27 pays de l'Union européenne. Données de conformité basées sur la Directive Eau Potable (DWD) de l'EEA.",
    keywords: "carte eau Europe, qualité eau potable UE, directive eau potable Europe, EEA données eau 27 pays",
    canonical: "/carte-europe",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Carte de la qualité de l'eau en Europe",
      "description": "Carte interactive de la qualité de l'eau potable dans les 27 pays de l'UE",
      "url": "https://infoeau.fr/carte-europe",
      "isPartOf": { "@type": "WebSite", "url": "https://infoeau.fr" }
    }
  },

  cartePolluantsEurope: {
    title: "Carte des polluants eau potable en Europe - 27 pays UE",
    description: "Visualisez la répartition des polluants dans l'eau potable des 27 pays de l'UE : nitrates, pesticides, PFAS, métaux lourds. Données EEA 2023.",
    keywords: "polluants eau Europe carte, PFAS eau potable Europe, pesticides eau UE, nitrates eau européenne",
    canonical: "/carte-polluants-europe",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Carte des polluants dans l'eau potable en Europe",
      "description": "Répartition des polluants dans l'eau potable des 27 pays de l'UE",
      "url": "https://infoeau.fr/carte-polluants-europe"
    }
  },

  classementEurope: {
    title: "Classement qualité eau potable Europe - 27 pays UE",
    description: "Classement des 27 pays de l'Union européenne par qualité de l'eau potable. Conformité réglementaire, nitrates, polluants et score global.",
    keywords: "classement eau Europe, meilleure eau potable Europe, conformité eau UE, ranking eau pays européens",
    canonical: "/classement-europe",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Classement qualité de l'eau en Europe",
      "description": "Classement des 27 pays de l'UE par qualité de l'eau potable",
      "url": "https://infoeau.fr/classement-europe"
    }
  },

  polluantsEurope: {
    title: "Polluants eau potable en Europe - Données par pays UE",
    description: "Analyse des polluants présents dans l'eau potable des 27 pays de l'UE : nitrates, pesticides, PFAS, métaux lourds. Dépassements de seuils par pays.",
    keywords: "polluants eau Europe, dépassements seuils eau UE, PFAS eau Europe, pesticides eau potable européenne",
    canonical: "/polluants-europe",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Polluants dans l'eau potable en Europe",
      "description": "Analyse des polluants dans l'eau potable des 27 pays de l'UE",
      "url": "https://infoeau.fr/polluants-europe"
    }
  },

  diagnosticEurope: {
    title: "Diagnostic qualité eau par pays européen - UE 27",
    description: "Sélectionnez un pays européen pour consulter ses indicateurs de qualité de l'eau potable : conformité, nitrates, polluants détectés et score global.",
    keywords: "diagnostic eau Europe, qualité eau par pays, indicateurs eau potable UE, conformité eau européenne",
    canonical: "/diagnostic-europe",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Diagnostic qualité de l'eau en Europe",
      "description": "Diagnostic de la qualité de l'eau potable par pays européen",
      "url": "https://infoeau.fr/diagnostic-europe"
    }
  },

  alertesEurope: {
    title: "Alertes qualité eau en Europe - Pays à risque UE",
    description: "Pays et polluants les plus préoccupants en Europe : violations réglementaires, faible conformité, dépassements de seuils dans l'eau potable de l'UE.",
    keywords: "alertes eau Europe, pays risque eau potable UE, violations eau européenne, dépassements polluants eau",
    canonical: "/alertes-europe",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Alertes qualité de l'eau en Europe",
      "description": "Pays à risque et polluants préoccupants dans l'eau potable européenne",
      "url": "https://infoeau.fr/alertes-europe"
    }
  },

  compositionEurope: {
    title: "Composition physico-chimique de l'eau en Europe - 27 pays UE",
    description: "Tableau comparatif interactif des paramètres physico-chimiques (pH, dureté, nitrates, calcium, magnésium…) de l'eau potable dans les 27 pays de l'UE. Données DISCODATA / AEE.",
    keywords: "composition eau Europe, paramètres physico-chimiques eau UE, dureté eau pays européens, pH eau potable Europe, minéraux eau robinet",
    canonical: "/composition-europe",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": "Composition physico-chimique de l'eau potable en Europe",
      "description": "Paramètres physico-chimiques de l'eau potable dans les 27 pays de l'UE",
      "url": "https://infoeau.fr/composition-europe",
      "creator": { "@type": "Organization", "name": "Agence européenne de l'environnement" }
    }
  },

  prixEauxEurope: {
    title: "Prix de l'eau du robinet en Europe - Comparaison 27 pays",
    description: "Comparaison des prix de l'eau potable dans les 27 pays de l'Union européenne (€/m³). Données EurEau et OCDE. Tendances et évolutions.",
    keywords: "prix eau robinet Europe, coût eau potable UE, tarif eau par pays, comparaison prix eau européenne",
    canonical: "/prix-eaux-europe",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Prix de l'eau du robinet en Europe",
      "description": "Comparaison des prix de l'eau potable dans les 27 pays de l'UE",
      "url": "https://infoeau.fr/prix-eaux-europe"
    }
  },

  // === Pages classement, parcours carte, diagnostic prix ===

  classement: {
    title: "Classement des eaux en bouteille - Meilleures eaux France",
    description: "Classement interactif des eaux en bouteille selon votre profil : sportif, femme enceinte, quotidien. Score multi-critères basé sur la composition minérale.",
    keywords: "classement eaux bouteille, meilleure eau minérale, top eau en bouteille France, score eau santé",
    canonical: "/classement",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Classement des eaux en bouteille en France",
      "description": "Classement interactif des eaux en bouteille selon votre profil et besoins",
      "url": "https://infoeau.fr/classement",
      "isPartOf": { "@type": "WebSite", "url": "https://infoeau.fr" }
    }
  },

  diagnosticPrix: {
    title: "Diagnostic des prix - Audit et vérifications | InfoEau.fr",
    description: "Page de diagnostic technique des prix de l'eau : sources de données, méthodes de calcul, garde-fous et validations appliquées.",
    keywords: "diagnostic prix eau, audit prix eau bouteille, vérification prix eau robinet",
    canonical: "/diagnostic-prix"
  },

  parcoursEauBouteille: {
    title: "Parcours de l'eau en bouteille — Du captage au magasin",
    description: "Découvrez le parcours de l'eau en bouteille en 6 étapes : du captage à la source jusqu'à l'achat en magasin. Infographie interactive.",
    keywords: "eau en bouteille, parcours, embouteillage, eau minérale, transport eau, prix eau bouteille",
    canonical: "/parcours-eau-bouteille",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Le parcours de l'eau en bouteille",
      "description": "Infographie interactive du parcours de l'eau en bouteille en 6 étapes",
      "url": "https://infoeau.fr/parcours-eau-bouteille"
    }
  },

  carteParcoursEau: {
    title: "Carte du parcours de l'eau en bouteille : source → magasin",
    description: "Visualisez le trajet de l'eau en bouteille depuis sa source de captage jusqu'aux magasins distributeurs (Carrefour, Leclerc, etc.).",
    keywords: "parcours eau bouteille, source, distributeur, MDD, carte, animation",
    canonical: "/carte-parcours-eau",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Carte du parcours de l'eau en bouteille",
      "description": "Carte interactive du trajet de l'eau en bouteille : source → distributeur → magasin",
      "url": "https://infoeau.fr/carte-parcours-eau"
    }
  },

  carteParcoursRobinet: {
    title: "Parcours de l'eau du robinet : captage → traitement → robinet",
    description: "Visualisez le trajet de l'eau potable en France : du captage (nappe, rivière) à la station de traitement jusqu'au robinet de votre commune.",
    keywords: "parcours eau robinet, captage, traitement, eau potable, carte, animation, France",
    canonical: "/carte-parcours-robinet",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Parcours de l'eau du robinet en France",
      "description": "Carte interactive du parcours de l'eau potable : captage → traitement → distribution → robinet",
      "url": "https://infoeau.fr/carte-parcours-robinet"
    }
  },

  sourcesEau: {
    title: "Sources des eaux en bouteille en France - Carte interactive",
    description: "Carte interactive des sources d'eau minérale et de source en France. Géolocalisation, composition et informations détaillées pour chaque source.",
    keywords: "sources eau bouteilles, carte sources eau, bouteilles eau France, géolocalisation sources, Evian, Volvic, Vittel",
    canonical: "/sources-eau",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Les sources des eaux en bouteille en France",
      "description": "Carte interactive des principales sources d'eau minérale et de source en France",
      "url": "https://infoeau.fr/sources-eau"
    }
  },

  // === Page 404 ===

  notFound: {
    title: "Page non trouvée - InfoEau.fr",
    description: "La page que vous recherchez n'existe pas. Retrouvez toutes les informations sur la qualité de l'eau potable sur InfoEau.fr.",
    noindex: true
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
  "brand": { "@type": "Brand", "name": waterData.brand },
  "offers": {
    "@type": "Offer",
    "price": waterData.price,
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Type d'eau", "value": waterData.type },
    ...(waterData.source ? [{ "@type": "PropertyValue", "name": "Source", "value": waterData.source }] : []),
    ...Object.entries(waterData.composition).map(([mineral, value]) => ({
      "@type": "PropertyValue",
      "name": mineral,
      "value": `${value} mg/L`
    }))
  ]
});
