import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from '@/components/LocalizedLink';
import {
  Droplets, Menu, ChevronDown, Search,
  Droplet, GlassWater, AlertTriangle, Truck, Route as RouteIcon,
  CloudRain, Wine, ShoppingCart, TrendingUp, Stethoscope,
  HelpCircle, Trophy, Bell, Map as MapIcon, MapPinned, type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion } from '@/contexts/RegionContext';
import RegionSwitcher from '@/components/RegionSwitcher';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { isEurope } = useRegion();

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

  const pricesItems = isEurope
    ? [
        { href: '/prix-eaux-europe', label: t('nav.prices') },
      ]
    : [
        { href: '/prix-eaux', label: 'Comparateur de prix' },
        { href: '/cours-eau', label: "Cours de l'eau" },
      ];

  const navigationItems = isEurope
    ? [
        { href: '/diagnostic-europe', label: t('nav.diagnostic') },
        { href: '/quelle-eau-boire', label: t('nav.which-water') },
        { href: '/classement-europe', label: t('nav.ranking') },
        { href: '/polluants-europe', label: t('nav.pollutants') },
        { href: '/alertes-europe', label: t('nav.alerts') },
      ]
    : [
        { href: '/diagnostic', label: t('nav.diagnostic') },
        { href: '/quelle-eau-boire', label: t('nav.which-water') },
        { href: '/gout-eau', label: "Goût de l'eau" },
        { href: '/classement', label: t('nav.ranking') },
        { href: '/polluants', label: t('nav.pollutants') },
        { href: '/alertes', label: t('nav.alerts') },
      ];

  const journeyItems = [
    { href: '/parcours-eau', label: t('nav.journey') },
    { href: '/parcours-eau-bouteille', label: t('nav.journeyBottle') },
  ];

  // Contribution communautaire — volontairement séparée du comparateur
  const communityItems = isEurope
    ? []
    : [{ href: '/zone-eau', label: "Zone d'Eau" }];

  const isActive = (path: string) => location.pathname === path;
  const isActiveMapsSection = mapsItems.some(item => location.pathname === item.href);
  const isActiveJourneySection = journeyItems.some(item => location.pathname === item.href);
  const isActivePricesSection = pricesItems.some(item => location.pathname === item.href);

  // Icon mapping by route — used for the mobile grid
  const iconByHref: Record<string, LucideIcon> = {
    '/carte': Droplet,
    '/sources-eau': GlassWater,
    '/carte-polluants': AlertTriangle,
    '/carte-parcours-eau': Truck,
    '/carte-parcours-robinet': RouteIcon,
    '/carte-europe': MapIcon,
    '/carte-polluants-europe': AlertTriangle,
    '/parcours-eau': CloudRain,
    '/parcours-eau-bouteille': Wine,
    '/prix-eaux': ShoppingCart,
    '/cours-eau': TrendingUp,
    '/prix-eaux-europe': ShoppingCart,
    '/diagnostic': Stethoscope,
    '/diagnostic-europe': Stethoscope,
    '/quelle-eau-boire': HelpCircle,
    '/gout-eau': GlassWater,
    '/classement': Trophy,
    '/classement-europe': Trophy,
    '/polluants': AlertTriangle,
    '/polluants-europe': AlertTriangle,
    '/alertes': Bell,
    '/alertes-europe': Bell,
  };

  const mobileSections = [
    { id: 'maps', label: t('nav.maps'), items: mapsItems },
    { id: 'journey', label: t('nav.journeyTab'), items: journeyItems },
    { id: 'prices', label: t('nav.prices'), items: pricesItems },
    { id: 'tools', label: t('nav.navigation'), items: navigationItems },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const allItems = mobileSections.flatMap(s => s.items);
  const filteredItems = searchQuery.trim()
    ? allItems.filter(i => normalize(i.label).includes(normalize(searchQuery)))
    : [];


  const [mapsMenuOpen, setMapsMenuOpen] = useState(false);
  const [journeyMenuOpen, setJourneyMenuOpen] = useState(false);
  const [pricesMenuOpen, setPricesMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const journeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pricesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMapsMenuOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setMapsMenuOpen(false), 150);
  };
  const handleJourneyMouseEnter = () => {
    if (journeyTimeoutRef.current) clearTimeout(journeyTimeoutRef.current);
    setJourneyMenuOpen(true);
  };
  const handleJourneyMouseLeave = () => {
    journeyTimeoutRef.current = setTimeout(() => setJourneyMenuOpen(false), 150);
  };
  const handlePricesMouseEnter = () => {
    if (pricesTimeoutRef.current) clearTimeout(pricesTimeoutRef.current);
    setPricesMenuOpen(true);
  };
  const handlePricesMouseLeave = () => {
    pricesTimeoutRef.current = setTimeout(() => setPricesMenuOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (journeyTimeoutRef.current) clearTimeout(journeyTimeoutRef.current);
      if (pricesTimeoutRef.current) clearTimeout(pricesTimeoutRef.current);
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

            {/* Parcours dropdown */}
            <div
              className="relative group"
              onMouseEnter={handleJourneyMouseEnter}
              onMouseLeave={handleJourneyMouseLeave}
            >
              <button
                className={`h-9 px-3 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap inline-flex items-center gap-1 ${
                  isActiveJourneySection ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('nav.journeyTab')}
                <ChevronDown className="h-3 w-3" />
              </button>
              {journeyMenuOpen && (
                <div
                  className="absolute left-0 top-full w-64 bg-background border border-border shadow-lg rounded-md z-50 mt-0"
                  onMouseEnter={handleJourneyMouseEnter}
                  onMouseLeave={handleJourneyMouseLeave}
                >
                  {journeyItems.map((item) => (
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

            {/* Prix des eaux dropdown */}
            <div
              className="relative group"
              onMouseEnter={handlePricesMouseEnter}
              onMouseLeave={handlePricesMouseLeave}
            >
              <button
                className={`h-9 px-3 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap inline-flex items-center gap-1 ${
                  isActivePricesSection ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('nav.prices')}
                <ChevronDown className="h-3 w-3" />
              </button>
              {pricesMenuOpen && (
                <div
                  className="absolute left-0 top-full w-64 bg-background border border-border shadow-lg rounded-md z-50 mt-0"
                  onMouseEnter={handlePricesMouseEnter}
                  onMouseLeave={handlePricesMouseLeave}
                >
                  {pricesItems.map((item) => (
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

            {/* Communauté — fonctionnalité distincte du comparateur */}
            {!isEurope && (
              <>
                <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                {communityItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`h-9 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                      isActive(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-blue-600 hover:text-blue-700 hover:bg-accent'
                    }`}
                  >
                    <MapPinned className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Right Side - Region, Language & Mobile Menu */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block">
              <RegionSwitcher />
            </div>

            <LanguageSwitcher />

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
                <SheetContent side="right" className="w-[88vw] max-w-sm p-0 flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                        InfoEau.fr
                      </span>
                    </div>
                  </div>

                  {/* Region */}
                  <div className="px-4 pt-3 pb-2">
                    <RegionSwitcher />
                  </div>

                  {/* Search */}
                  <div className="px-4 pb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('nav.searchPlaceholder') || 'Rechercher…'}
                        className="pl-9 h-10"
                        aria-label="Rechercher dans le menu"
                      />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto px-4 pb-6">
                    {searchQuery.trim() ? (
                      <div className="flex flex-col gap-1">
                        {filteredItems.length === 0 && (
                          <p className="text-sm text-muted-foreground py-6 text-center">
                            Aucun résultat
                          </p>
                        )}
                        {filteredItems.map((item) => {
                          const Icon = iconByHref[item.href] ?? Droplet;
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => { setIsOpen(false); setSearchQuery(''); }}
                              aria-current={active ? 'page' : undefined}
                              className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                                active
                                  ? 'bg-accent text-accent-foreground'
                                  : 'text-foreground hover:bg-accent/60'
                              }`}
                            >
                              <Icon className="h-4 w-4 text-primary shrink-0" />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {mobileSections.map((section) => (
                          <div key={section.id}>
                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
                              {section.label}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {section.items.map((item) => {
                                const Icon = iconByHref[item.href] ?? Droplet;
                                const active = isActive(item.href);
                                const isDiagnostic = item.href === '/diagnostic' || item.href === '/diagnostic-europe';
                                return (
                                  <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    aria-current={active ? 'page' : undefined}
                                    className={`group relative flex flex-col items-start justify-between min-h-[72px] rounded-xl border p-3 transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                      active
                                        ? 'border-primary bg-accent text-accent-foreground ring-1 ring-primary/40'
                                        : isDiagnostic
                                          ? 'border-transparent bg-gradient-to-br from-blue-500/10 to-green-500/10 hover:from-blue-500/15 hover:to-green-500/15 text-foreground'
                                          : 'border-border bg-card hover:bg-accent/50 text-foreground'
                                    }`}
                                  >
                                    <Icon className={`h-5 w-5 ${active ? 'text-primary' : isDiagnostic ? 'text-blue-600' : 'text-muted-foreground group-hover:text-primary'} transition-colors`} />
                                    <span className="text-[13px] font-medium leading-tight mt-2 line-clamp-2">
                                      {item.label}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
