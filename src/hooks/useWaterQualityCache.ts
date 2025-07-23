import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getWaterQualityByCommune, ApiResponse } from '@/services/dataGouvApi';

const WATER_QUALITY_CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useWaterQualityCache = (commune: string) => {
  return useQuery({
    queryKey: ['waterQuality', commune],
    queryFn: () => getWaterQualityByCommune(commune),
    enabled: !!commune,
    staleTime: STALE_TIME,
    gcTime: WATER_QUALITY_CACHE_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const usePrefetchWaterQuality = () => {
  const queryClient = useQueryClient();

  const prefetchWaterQuality = (commune: string) => {
    queryClient.prefetchQuery({
      queryKey: ['waterQuality', commune],
      queryFn: () => getWaterQualityByCommune(commune),
      staleTime: STALE_TIME,
      gcTime: WATER_QUALITY_CACHE_TIME,
    });
  };

  return { prefetchWaterQuality };
};