import React, { Suspense } from 'react';
import LoadingMap from './LoadingMap';

// Lazy load the InteractiveMap component to avoid loading Mapbox in the initial bundle
const InteractiveMap = React.lazy(() => import('./InteractiveMap'));

interface LazyInteractiveMapProps {
  showWaterSources?: boolean;
}

const LazyInteractiveMap: React.FC<LazyInteractiveMapProps> = (props) => {
  return (
    <Suspense fallback={<LoadingMap />}>
      <InteractiveMap {...props} />
    </Suspense>
  );
};

export default LazyInteractiveMap;