
import { useState, useEffect } from 'react';
import { analyticsService, SiteMetrics } from '@/services/analyticsService';

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<SiteMetrics>({
    totalVisits: 0,
    uniqueVisitors: 0,
    avgTimePerPage: 0,
    totalClicks: 0,
    pageMetrics: []
  });

  const refreshMetrics = () => {
    const newMetrics = analyticsService.getSiteMetrics();
    setMetrics(newMetrics);
  };

  useEffect(() => {
    refreshMetrics();
    
    // Refresh metrics every 5 seconds when dashboard is active
    const interval = setInterval(refreshMetrics, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    refreshMetrics,
    resetAnalytics: analyticsService.resetAnalytics
  };
};
