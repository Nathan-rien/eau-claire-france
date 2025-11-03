import { useQuery } from '@tanstack/react-query';
import { getWaterAlerts, WaterAlert } from '@/services/waterAlertsApi';

const ALERTS_CACHE_TIME = 12 * 60 * 60 * 1000; // 12 hours
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export const useWaterAlerts = () => {
  return useQuery({
    queryKey: ['waterAlerts'],
    queryFn: getWaterAlerts,
    staleTime: STALE_TIME,
    gcTime: ALERTS_CACHE_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const groupAlertsByRegion = (alerts: WaterAlert[]) => {
  return alerts.reduce((acc, alert) => {
    if (!acc[alert.region]) {
      acc[alert.region] = [];
    }
    acc[alert.region].push(alert);
    return acc;
  }, {} as Record<string, WaterAlert[]>);
};
