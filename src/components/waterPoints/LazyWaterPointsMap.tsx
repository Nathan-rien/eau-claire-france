import React, { Suspense } from 'react';
import LoadingMap from '@/components/LoadingMap';
import type { WaterPoint } from '@/data/waterPoints';

const WaterPointsMap = React.lazy(() => import('./WaterPointsMap'));

interface LazyWaterPointsMapProps {
  points: WaterPoint[];
  photoUrls?: Record<string, string>;
  height?: number;
}

const LazyWaterPointsMap: React.FC<LazyWaterPointsMapProps> = (props) => (
  <Suspense fallback={<LoadingMap />}>
    <WaterPointsMap {...props} />
  </Suspense>
);

export default LazyWaterPointsMap;
