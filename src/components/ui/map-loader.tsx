import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Map as MapIcon, Loader2 } from 'lucide-react';

interface MapLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadOnInteraction?: boolean;
  minHeight?: string;
}

/**
 * Lazy map loader component for mobile optimization
 * On mobile: Loads map only after user interaction (click button)
 * On desktop: Loads automatically when visible in viewport
 * Reduces initial bundle size and improves LCP
 */
export const MapLoader: React.FC<MapLoaderProps> = ({
  children,
  fallback,
  loadOnInteraction = true,
  minHeight = '50vh'
}) => {
  const [shouldLoad, setShouldLoad] = useState(!loadOnInteraction);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadOnInteraction || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [loadOnInteraction, shouldLoad]);

  // Auto-load on desktop when visible
  useEffect(() => {
    if (isVisible && window.innerWidth >= 768) {
      setShouldLoad(true);
    }
  }, [isVisible]);

  const handleLoadMap = () => {
    setShouldLoad(true);
  };

  if (!shouldLoad) {
    return (
      <div ref={containerRef} style={{ minHeight }}>
        {fallback || (
          <Card className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center p-6 sm:p-8">
            <MapIcon className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">
              Carte interactive disponible
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center max-w-md">
              Cliquez pour activer la carte et explorer les données géographiques
            </p>
            <Button
              onClick={handleLoadMap}
              size="lg"
              className="min-h-[48px] px-6 text-base"
              aria-label="Charger la carte interactive"
            >
              <MapIcon className="w-5 h-5 mr-2" />
              Afficher la carte
            </Button>
          </Card>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Loading placeholder for maps
 */
export const MapLoadingPlaceholder: React.FC<{ minHeight?: string }> = ({ 
  minHeight = '50vh' 
}) => {
  return (
    <Card 
      className="w-full h-full flex flex-col items-center justify-center p-8"
      style={{ minHeight }}
    >
      <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 animate-spin mb-4" />
      <p className="text-sm sm:text-base text-muted-foreground">
        Chargement de la carte...
      </p>
    </Card>
  );
};
