import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Lazy load QuelleEauBoire to reduce initial bundle size
const QuelleEauBoire = React.lazy(() => import('@/pages/QuelleEauBoire'));

const WaterRecommendationSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

interface LazyWaterRecommendationProps {
  initialMode?: 'quick' | 'full';
}

const LazyWaterRecommendation: React.FC<LazyWaterRecommendationProps> = ({ initialMode }) => {
  return (
    <Suspense fallback={<WaterRecommendationSkeleton />}>
      <QuelleEauBoire initialMode={initialMode} />
    </Suspense>
  );
};

export default LazyWaterRecommendation;
