import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'fr' | 'en';
  toggleLanguage: () => void;
  setLanguage: (lang: 'fr' | 'en') => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.map': 'Carte des eaux',
    'nav.pollutants-map': 'Carte polluants',
    'nav.diagnostic': 'Diagnostic',
    'nav.which-water': 'Quelle eau boire ?',
    'nav.bottles': 'Robinet vs Bouteilles',
    'nav.comparison': 'Comparatif',
    'nav.ranking': 'Classement',
    'nav.pollutants': 'Polluants',
    'nav.alerts': 'Alertes',
    'language.french': 'Français',
    'language.english': 'English',
    
    // Home page
    'home.title': 'Connaissez-vous vraiment la qualité de',
    'home.titleHighlight': 'votre eau',
    'home.subtitle': 'Découvrez la composition réelle de l\'eau potable distribuée dans votre commune, suivez les polluants présents et comparez avec les eaux en bouteille.',
    'home.searchResult': 'Recherche pour : {city}',
    'home.seeFullDiagnostic': 'Voir le diagnostic complet →',
    'home.quickAccess.map': 'Carte',
    'home.quickAccess.mapSub': 'Nationale',
    'home.quickAccess.diagnostic': 'Diagnostic',
    'home.quickAccess.diagnosticSub': 'Personnalisé',
    'home.quickAccess.bottles': 'vs Bouteilles',
    'home.quickAccess.bottlesSub': 'Comparaison',
    'home.quickAccess.pollutants': 'Polluants',
    'home.quickAccess.pollutantsSub': 'Index',
    'home.stats.communes': 'Communes analysées',
    'home.stats.pollutants': 'Polluants surveillés',
    'home.stats.compliance': 'Eau conforme',
    'home.stats.update': 'Mise à jour',
    'home.features.title': 'Transparence totale sur votre eau',
    'home.features.subtitle': 'Basé sur les données officielles des ARS, agences de l\'eau et réseaux publics',
    'home.features.trust.title': 'Score de confiance',
    'home.features.trust.description': 'Score global de A à E basé sur la microbiologie, physico-chimie et stabilité historique de votre eau.',
    'home.features.environment.title': 'Impact environnemental',
    'home.features.environment.description': 'Comparez l\'empreinte carbone et le coût de l\'eau du robinet vs les eaux en bouteille.',
    'home.features.citizen.title': 'Plateforme citoyenne',
    'home.features.citizen.description': 'Alertes en cas de pollution, données ouvertes et accessibles à tous les citoyens français.',
    
    // Bottles page
    'bottles.title': 'Eau du robinet vs Bouteilles',
    'bottles.subtitle': 'Comparez la qualité, le coût et l\'impact environnemental de l\'eau du robinet avec les eaux en bouteille.',
    'bottles.advanced.title': 'Comparatif avancé',
    'bottles.advanced.description': 'Comparez jusqu\'à 3 bouteilles simultanément avec des critères détaillés',
    'bottles.advanced.button': 'Comparateur multi-bouteilles',
    
    // Diagnostic page
    'diagnostic.title': 'Diagnostic personnalisé',
    'diagnostic.subtitle': 'Découvrez la qualité de l\'eau potable distribuée dans votre commune avec un diagnostic détaillé.',
    'diagnostic.searchTitle': 'Recherchez votre commune',
    'diagnostic.searchPlaceholder': 'Entrez votre adresse ou commune...',
    'diagnostic.searchResult': 'Résultats pour : {city}',
    
    // Map page
    'map.title': 'Carte des eaux - Qualité nationale',
    'map.subtitle': 'Explorez la qualité de l\'eau potable dans toute la France. Cliquez sur votre région pour découvrir les données locales.',
    
    // Comparison page
    'comparison.title': 'Comparatif des eaux en bouteille',
    'comparison.subtitle': 'Comparez jusqu\'à 3 eaux en bouteille selon leurs caractéristiques : prix, composition minérale, impact environnemental et plus encore.',
    'comparison.tabs.comparison': 'Comparaison',
    'comparison.tabs.favorites': 'Favoris',
    'comparison.limit.title': 'Limite atteinte',
    'comparison.limit.description': 'Vous ne pouvez comparer que 3 bouteilles maximum.',
    
    // Breadcrumbs
    'breadcrumb.map': 'Carte interactive',
    'breadcrumb.bottles': 'Comparaison bouteilles',
    'breadcrumb.diagnostic': 'Diagnostic personnalisé',
    
    // Water recommendation
    'water-recommendation.title': 'Quelle eau boire ?',
    'water-recommendation.subtitle': 'Trouvez l\'eau adaptée à vos besoins',
    'water-recommendation.step1.title': 'Étape 1 : Choisissez vos profils',
    'water-recommendation.step1.description': 'Sélectionnez un ou plusieurs profils qui vous correspondent',
    'water-recommendation.step2.title': 'Étape 2 : Avez-vous des intolérances ?',
    'water-recommendation.step2.description': 'Sélectionnez les substances que vous souhaitez éviter',
    'water-recommendation.step3.title': 'Étape 3 : Vos préférences',
    'water-recommendation.step3.description': 'Affinez vos critères selon vos goûts',
    'water-recommendation.see-recommendations': 'Voir mes recommandations',
    'water-recommendation.results.title': 'Vos recommandations personnalisées',
    'water-recommendation.results.subtitle': 'Eaux recommandées selon vos critères',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.map': 'Water Map',
    'nav.pollutants-map': 'Pollutants Map',
    'nav.diagnostic': 'Diagnostic',
    'nav.which-water': 'Which water to drink?',
    'nav.bottles': 'Tap vs Bottles',
    'nav.comparison': 'Comparison',
    'nav.ranking': 'Ranking',
    'nav.pollutants': 'Pollutants',
    'nav.alerts': 'Alerts',
    'language.french': 'Français',
    'language.english': 'English',
    
    // Home page
    'home.title': 'Do you really know the quality of',
    'home.titleHighlight': 'your water',
    'home.subtitle': 'Discover the real composition of drinking water distributed in your municipality, track pollutants present and compare with bottled waters.',
    'home.searchResult': 'Search for: {city}',
    'home.seeFullDiagnostic': 'See full diagnostic →',
    'home.quickAccess.map': 'Map',
    'home.quickAccess.mapSub': 'National',
    'home.quickAccess.diagnostic': 'Diagnostic',
    'home.quickAccess.diagnosticSub': 'Personalized',
    'home.quickAccess.bottles': 'vs Bottles',
    'home.quickAccess.bottlesSub': 'Comparison',
    'home.quickAccess.pollutants': 'Pollutants',
    'home.quickAccess.pollutantsSub': 'Index',
    'home.stats.communes': 'Municipalities analyzed',
    'home.stats.pollutants': 'Pollutants monitored',
    'home.stats.compliance': 'Compliant water',
    'home.stats.update': 'Update',
    'home.features.title': 'Total transparency on your water',
    'home.features.subtitle': 'Based on official data from ARS, water agencies and public networks',
    'home.features.trust.title': 'Trust score',
    'home.features.trust.description': 'Overall score from A to E based on microbiology, physico-chemistry and historical stability of your water.',
    'home.features.environment.title': 'Environmental impact',
    'home.features.environment.description': 'Compare the carbon footprint and cost of tap water vs bottled waters.',
    'home.features.citizen.title': 'Citizen platform',
    'home.features.citizen.description': 'Pollution alerts, open data accessible to all French citizens.',
    
    // Bottles page
    'bottles.title': 'Tap water vs Bottles',
    'bottles.subtitle': 'Compare the quality, cost and environmental impact of tap water with bottled waters.',
    'bottles.advanced.title': 'Advanced comparison',
    'bottles.advanced.description': 'Compare up to 3 bottles simultaneously with detailed criteria',
    'bottles.advanced.button': 'Multi-bottle comparator',
    
    // Diagnostic page
    'diagnostic.title': 'Personalized diagnostic',
    'diagnostic.subtitle': 'Discover the quality of drinking water distributed in your municipality with a detailed diagnostic.',
    'diagnostic.searchTitle': 'Search your municipality',
    'diagnostic.searchPlaceholder': 'Enter your address or municipality...',
    'diagnostic.searchResult': 'Results for: {city}',
    
    // Map page
    'map.title': 'Water Map - National Quality',
    'map.subtitle': 'Explore the quality of drinking water throughout France. Click on your region to discover local data.',
    
    // Comparison page
    'comparison.title': 'Bottled water comparison',
    'comparison.subtitle': 'Compare up to 3 bottled waters according to their characteristics: price, mineral composition, environmental impact and more.',
    'comparison.tabs.comparison': 'Comparison',
    'comparison.tabs.favorites': 'Favorites',
    'comparison.limit.title': 'Limit reached',
    'comparison.limit.description': 'You can only compare 3 bottles maximum.',
    
    // Breadcrumbs
    'breadcrumb.map': 'Interactive map',
    'breadcrumb.bottles': 'Bottles comparison',
    'breadcrumb.diagnostic': 'Personalized diagnostic',
    
    // Water recommendation
    'water-recommendation.title': 'Which water to drink?',
    'water-recommendation.subtitle': 'Find the water adapted to your needs',
    'water-recommendation.step1.title': 'Step 1: Choose your profiles',
    'water-recommendation.step1.description': 'Select one or more profiles that match you',
    'water-recommendation.step2.title': 'Step 2: Do you have intolerances?',
    'water-recommendation.step2.description': 'Select substances you want to avoid',
    'water-recommendation.step3.title': 'Step 3: Your preferences',
    'water-recommendation.step3.description': 'Refine your criteria according to your taste',
    'water-recommendation.see-recommendations': 'See my recommendations',
    'water-recommendation.results.title': 'Your personalized recommendations',
    'water-recommendation.results.subtitle': 'Waters recommended according to your criteria',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fr' ? 'en' : 'fr');
  };

  const t = (key: string, variables?: Record<string, string>): string => {
    let translation = translations[language][key as keyof typeof translations.fr] || key;
    
    // Handle variable interpolation
    if (variables) {
      Object.entries(variables).forEach(([varKey, value]) => {
        translation = translation.replace(`{${varKey}}`, value);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};