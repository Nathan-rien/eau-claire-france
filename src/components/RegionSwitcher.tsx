import React from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { cn } from '@/lib/utils';

const RegionSwitcher: React.FC = () => {
  const { region, setRegion } = useRegion();

  return (
    <div className="flex items-center rounded-full border border-border bg-muted p-0.5 text-xs font-medium">
      <button
        onClick={() => setRegion('fr')}
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
        onClick={() => setRegion('eu')}
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
