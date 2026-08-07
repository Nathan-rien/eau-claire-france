import React from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { useLocation } from 'react-router-dom';
import { useNavigate } from '@/components/LocalizedLink';
import { cn } from '@/lib/utils';

const ROUTE_MAP_FR_TO_EU: Record<string, string> = {
  '/carte': '/carte-europe',
  '/classement': '/classement-europe',
  '/polluants': '/polluants-europe',
  '/diagnostic': '/diagnostic-europe',
  '/alertes': '/alertes-europe',
  '/prix-eaux': '/prix-eaux-europe',
};

const ROUTE_MAP_EU_TO_FR: Record<string, string> = Object.fromEntries(
  Object.entries(ROUTE_MAP_FR_TO_EU).map(([fr, eu]) => [eu, fr])
);

const RegionSwitcher: React.FC = () => {
  const { region, setRegion } = useRegion();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSwitch = (target: 'fr' | 'eu') => {
    if (target === region) return;
    setRegion(target);

    const currentPath = location.pathname;
    if (target === 'eu') {
      const euRoute = ROUTE_MAP_FR_TO_EU[currentPath];
      if (euRoute) navigate(euRoute);
    } else {
      const frRoute = ROUTE_MAP_EU_TO_FR[currentPath];
      if (frRoute) navigate(frRoute);
    }
  };

  return (
    <div className="flex items-center rounded-full border border-border bg-muted p-0.5 text-xs font-medium">
      <button
        onClick={() => handleSwitch('fr')}
        className={cn(
          "px-3 py-1 rounded-full transition-all",
          region === 'fr'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇫🇷 France
      </button>
      <button
        onClick={() => handleSwitch('eu')}
        className={cn(
          "px-3 py-1 rounded-full transition-all",
          region === 'eu'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇪🇺 Europe
      </button>
    </div>
  );
};

export default RegionSwitcher;
