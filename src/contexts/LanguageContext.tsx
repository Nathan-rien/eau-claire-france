import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, TranslationKey } from '@/i18n/translations';

interface LanguageContextType {
  language: 'fr' | 'en';
  toggleLanguage: () => void;
  setLanguage: (lang: 'fr' | 'en') => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'infoeau_lang';

const detectInitialLanguage = (): 'fr' | 'en' => {
  if (typeof window === 'undefined') return 'fr';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {
    /* noop */
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'fr';
  return nav.toLowerCase().startsWith('en') ? 'en' : 'fr';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'fr' | 'en'>(detectInitialLanguage);

  const setLanguage = (lang: 'fr' | 'en') => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* noop */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const t = (key: string, variables?: Record<string, string>): string => {
    let translation = translations[language][key as TranslationKey] || key;
    
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
