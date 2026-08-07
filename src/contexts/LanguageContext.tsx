import React, { createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from '@/components/LocalizedLink';
import { translations, TranslationKey } from '@/i18n/translations';
import { getLanguageFromPath, localizePath, type AppLanguage } from '@/lib/i18nRoutes';

interface LanguageContextType {
  language: AppLanguage;
  toggleLanguage: () => void;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'infoeau_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // The URL is the ONLY source of truth, from the very first render.
  const language: AppLanguage = getLanguageFromPath(location.pathname);

  // localStorage is only a memory of the last explicit choice (used for UI
  // affordances). It never triggers a redirect nor overrides the URL.
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* noop */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Switching language = navigating to the localized URL.
  const setLanguage = (lang: AppLanguage) => {
    if (lang === language) return;
    const target = localizePath(location.pathname, lang);
    navigate(`${target}${location.search}${location.hash}`);
  };

  const toggleLanguage = () => setLanguage(language === 'fr' ? 'en' : 'fr');

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
