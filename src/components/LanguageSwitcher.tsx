import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath, stripLangPrefix, isInternationalPath } from '@/lib/i18nRoutes';

interface LanguageSwitcherProps {
  /** Compact pill (header) or inline text links (footer). */
  variant?: 'pill' | 'inline';
  className?: string;
}

/**
 * Crawlable language switcher: renders real <a> elements (react-router Link) to
 * the FR/EN equivalent of the current URL, with hrefLang so Google can follow
 * them. Previously a JS <Select>, which gave Google zero links to /en.
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'pill', className = '' }) => {
  const { language } = useLanguage();
  const location = useLocation();

  const basePath = stripLangPrefix(location.pathname);
  // Only offer EN where an English version is actually promoted.
  const hasEnglish = isInternationalPath(basePath);
  const frHref = `${localizePath(basePath, 'fr')}${location.search}`;
  const enHref = `${localizePath(basePath, 'en')}${location.search}`;

  if (!hasEnglish && language === 'fr') return null;

  if (variant === 'inline') {
    const target = language === 'fr' ? enHref : frHref;
    return (
      <Link
        to={target}
        hrefLang={language === 'fr' ? 'en' : 'fr'}
        className={`hover:text-white transition-colors ${className}`}
      >
        {language === 'fr' ? 'English version' : 'Version française'}
      </Link>
    );
  }

  const linkClass = (active: boolean) =>
    `px-2 py-1 text-sm font-medium rounded-md transition-colors ${
      active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label="Language">
      <Link
        to={frHref}
        hrefLang="fr"
        lang="fr"
        aria-current={language === 'fr' ? 'true' : undefined}
        className={linkClass(language === 'fr')}
      >
        FR
      </Link>
      <span className="text-muted-foreground/40" aria-hidden="true">
        |
      </span>
      <Link
        to={enHref}
        hrefLang="en"
        lang="en"
        aria-current={language === 'en' ? 'true' : undefined}
        className={linkClass(language === 'en')}
      >
        EN
      </Link>
    </div>
  );
};

export default LanguageSwitcher;
