
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Droplets, ChevronDown } from 'lucide-react';
import RegionSwitcher from '@/components/RegionSwitcher';
import { useRegion } from '@/contexts/RegionContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation = () => {
  const location = useLocation();
  const [mapsMenuOpen, setMapsMenuOpen] = useState(false);
  const { isEurope } = useRegion();
  const { t } = useLanguage();

  const mapsItems = isEurope
    ? [
        { href: '/carte-europe', label: t('nav.maps.europeQuality') },
        { href: '/carte-polluants-europe', label: t('nav.maps.europePollutants') },
      ]
    : [
        { href: '/carte', label: t('nav.maps.tap') },
        { href: '/sources-eau', label: t('nav.maps.bottles') },
        { href: '/carte-polluants', label: t('nav.maps.pollutants') },
        { href: '/carte-parcours-eau', label: t('nav.maps.journey') },
      ];

  const directNavigationItems = isEurope
    ? [
        { href: '/diagnostic-europe', label: t('nav.diagnostic') },
        { href: '/quelle-eau-boire', label: t('nav.which-water') },
        { href: '/prix-eaux-europe', label: t('nav.prices') },
        { href: '/classement-europe', label: t('nav.ranking') },
        { href: '/polluants-europe', label: t('nav.pollutants') },
        { href: '/alertes-europe', label: t('nav.alerts') },
        { href: '/parcours-eau', label: t('nav.journey') },
      ]
    : [
        { href: '/diagnostic', label: t('nav.diagnostic') },
        { href: '/quelle-eau-boire', label: t('nav.which-water') },
        { href: '/prix-eaux', label: t('nav.prices') },
        { href: '/classement', label: t('nav.ranking') },
        { href: '/polluants', label: t('nav.pollutants') },
        { href: '/alertes', label: t('nav.alerts') },
        { href: '/parcours-eau', label: t('nav.journey') },
      ];

  const isActiveMapsSection = mapsItems.some(item => location.pathname === item.href);

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                InfoEau.fr
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <NavigationMenu>
              <NavigationMenuList className="flex-wrap gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-2 py-2 text-xs md:text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                      isActiveMapsSection && "bg-accent text-accent-foreground"
                    )}
                    onMouseEnter={() => setMapsMenuOpen(true)}
                    onMouseLeave={() => setMapsMenuOpen(false)}
                  >
                    <span className="flex items-center gap-1">
                      {t('nav.maps')}
                      <ChevronDown className="h-3 w-3" />
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    className="absolute left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:w-auto z-50 bg-popover border border-border shadow-md rounded-md"
                    onMouseEnter={() => setMapsMenuOpen(true)}
                    onMouseLeave={() => setMapsMenuOpen(false)}
                  >
                    <div className="w-64 p-2">
                      {mapsItems.map((item) => (
                        <NavigationMenuLink
                          key={item.href}
                          asChild
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm",
                            location.pathname === item.href && "bg-accent text-accent-foreground"
                          )}
                        >
                          <Link to={item.href}>
                            {item.label}
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {directNavigationItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-2 py-2 text-xs md:text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        location.pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Link to={item.href}>
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <RegionSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
