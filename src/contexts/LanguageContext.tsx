import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'fr' | 'en';
  toggleLanguage: () => void;
  setLanguage: (lang: 'fr' | 'en') => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
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

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
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