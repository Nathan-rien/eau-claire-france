import React, { Suspense } from 'react';
import LoadingMap from './LoadingMap';

// Lazy load the QualityMap component to avoid loading Mapbox in the initial bundle
const QualityMap = React.lazy(() => import('./QualityMap'));

const LazyQualityMap: React.FC = () => {
  return (
    <Suspense fallback={<LoadingMap />}>
      <QualityMap />
    </Suspense>
  );
};

export default LazyQualityMap;