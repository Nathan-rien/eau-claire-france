import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

const LoadingMap = () => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative h-96 w-full rounded-lg bg-gray-100 flex items-center justify-center">
          {/* Loading indicator */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <MapPin className="w-12 h-12 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-bounce"></div>
            </div>
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>
          </div>
          
          {/* Skeleton overlays */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <Skeleton className="h-4 w-48" />
          </div>
          
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingMap;