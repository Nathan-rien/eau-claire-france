import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion } from '@/contexts/RegionContext';
import RegionSwitcher from '@/components/RegionSwitcher';

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isEurope } = useRegion();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'fr' | 'en');
  };

  const mapsItems = isEurope
    ? [
        { href: '/carte-europe', label: t('nav.maps.europeQuality') },
        { href: '/carte-polluants-europe', label: t('nav.maps.europePollutants') },
      ]
    : [
        { href: '/carte', label: t('nav.maps.tap') },
        { href: '/sources-eau', label: t('nav.maps.bottles') },
        { href: '/carte-polluants', label: t('nav.maps.pollutants') },
        { href: '/carte-parcours-eau', label: t('nav.maps.bottleJourney') },
        { href: '/carte-parcours-robinet', label: t('nav.maps.tapJourney') },
      ];

  const navigationItems = isEurope
    ? [
        { href: '/diagnostic-europe', label: t('nav.diagnostic') },
        { href: '/quelle-eau-boire', label: t('nav.which-water') },
        { href: '/prix-eaux-europe', label: t('nav.prices') },
        { href: '/classement-europe', label: t('nav.ranking') },
        { href: '/polluants-europe', label: t('nav.pollutants') },
        { href: '/alertes-europe', label: t('nav.alerts') },
      ]
    : [
        { href: '/diagnostic', label: t('nav.diagnostic') },
        { href: '/quelle-eau-boire', label: t('nav.which-water') },
        { href: '/parcours-eau', label: t('nav.journey') },
        { href: '/parcours-eau-bouteille', label: t('nav.journeyBottle') },
        { href: '/prix-eaux', label: t('nav.prices') },
        { href: '/classement', label: t('nav.ranking') },
        { href: '/polluants', label: t('nav.pollutants') },
        { href: '/alertes', label: t('nav.alerts') },
      ];

  const isActive = (path: string) => location.pathname === path;
  const isActiveMapsSection = mapsItems.some(item => location.pathname === item.href);

  const [mapsMenuOpen, setMapsMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMapsMenuOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setMapsMenuOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <header className="sticky-header sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0 min-h-[44px]" aria-label={t('nav.backHome')}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center" aria-hidden="true">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              InfoEau.fr
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1 flex-1 justify-center max-w-4xl" role="navigation" aria-label={t('nav.navigation')}>
            {/* Cartes dropdown */}
            <div
              className="relative group"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`h-9 px-3 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap inline-flex items-center gap-1 ${
                  isActiveMapsSection ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('nav.maps')}
                <ChevronDown className="h-3 w-3" />
              </button>
              {mapsMenuOpen && (
                <div
                  className="absolute left-0 top-full w-64 bg-background border border-border shadow-lg rounded-md z-50 mt-0"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {mapsItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`block px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                        isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation items */}
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`h-9 px-3 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap inline-flex items-center ${
                  isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side - Region, Language & Mobile Menu */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block">
              <RegionSwitcher />
            </div>

            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-auto border-none bg-transparent px-2 py-1 h-auto">
                <SelectValue>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                    <span className="hidden sm:inline text-sm font-medium">{language === 'fr' ? 'FR' : 'EN'}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="fr">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🇫🇷</span>
                    <span>Français</span>
                  </div>
                </SelectItem>
                <SelectItem value="en">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🇬🇧</span>
                    <span>English</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Navigation */}
            <div className="xl:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="xl:hidden min-h-[44px] min-w-[44px] p-2 flex items-center space-x-2" aria-label={t('nav.openMenu')}>
                    <Menu className="h-5 w-5" />
                    <span className="hidden md:inline text-sm font-medium">{t('nav.menu')}</span>
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 sm:w-80 overflow-y-auto">
                  <div className="flex flex-col space-y-1 mt-6 pb-8">
                    <div className="flex items-center space-x-2 mb-4 pb-4 border-b">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                        InfoEau.fr
                      </span>
                    </div>

                    <div className="px-3 pb-4">
                      <RegionSwitcher />
                    </div>

                    {/* Section cartes */}
                    <div className="mb-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground px-3 py-2 font-semibold">
                        {t('nav.maps')}
                      </div>
                      {mapsItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-3 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ml-3 ${
                            isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="text-xs uppercase tracking-wide text-muted-foreground px-3 py-2 font-semibold">
                      {t('nav.navigation')}
                    </div>
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-3 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
