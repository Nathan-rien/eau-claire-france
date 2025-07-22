import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'fr' | 'en');
  };

  const navigationItems = [
    { href: '/carte', label: t('nav.map') },
    { href: '/carte-polluants', label: t('nav.pollutants-map') },
    { href: '/diagnostic', label: t('nav.diagnostic') },
    { href: '/quelle-eau-boire', label: t('nav.which-water') },
    { href: '/bouteilles', label: t('nav.bottles') },
    { href: '/comparatif-bouteilles', label: t('nav.comparison') },
    { href: '/classement', label: t('nav.ranking') },
    { href: '/polluants', label: t('nav.pollutants') },
    { href: '/alertes', label: t('nav.alerts') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              InfoEau.fr
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap ${
                  isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side - Language & Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Language Selector - Always visible */}
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-auto border-none bg-transparent px-2 py-1 h-auto">
                <SelectValue>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">🇬🇧</span>
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
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden p-2 flex items-center space-x-2">
                    <Menu className="h-4 w-4" />
                    <span className="hidden md:inline text-sm font-medium">Menu</span>
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 sm:w-80">
                  <div className="flex flex-col space-y-1 mt-6">
                    <div className="flex items-center space-x-2 mb-6 pb-4 border-b">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                        InfoEau.fr
                      </span>
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