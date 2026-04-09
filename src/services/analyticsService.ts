
import { getCookie, setCookie, getVisitorId, getSessionId } from '@/utils/cookieUtils';

export interface PageMetrics {
  page: string;
  visits: number;
  avgTime: number;
  bounceRate: string;
}

export interface SiteMetrics {
  totalVisits: number;
  uniqueVisitors: number;
  avgTimePerPage: number;
  totalClicks: number;
  pageMetrics: PageMetrics[];
}

class AnalyticsService {
  private pageStartTime: number = 0;
  private currentPage: string = '';

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    const setup = () => {
      this.trackPageView();

      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          this.trackButtonClick();
        }
      });

      window.addEventListener('beforeunload', () => {
        this.trackPageDuration();
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.trackPageDuration();
        } else {
          this.pageStartTime = Date.now();
        }
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(setup);
    } else {
      setTimeout(setup, 200);
    }
  }

  trackPageView() {
    const currentPath = window.location.pathname;
    this.currentPage = this.getPageName(currentPath);
    this.pageStartTime = Date.now();

    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    // Get existing data
    const data = this.getStoredData();

    // Update visit count
    data.totalVisits++;

    // Add unique visitor
    if (!data.uniqueVisitors.includes(visitorId)) {
      data.uniqueVisitors.push(visitorId);
    }

    // Update page views
    if (!data.pageViews[this.currentPage]) {
      data.pageViews[this.currentPage] = 0;
    }
    data.pageViews[this.currentPage]++;

    // Store updated data
    this.storeData(data);

    
  }

  trackPageDuration() {
    if (this.pageStartTime === 0) return;

    const duration = Math.floor((Date.now() - this.pageStartTime) / 1000);
    const data = this.getStoredData();

    if (!data.pageDurations[this.currentPage]) {
      data.pageDurations[this.currentPage] = [];
    }
    data.pageDurations[this.currentPage].push(duration);

    this.storeData(data);
  }

  trackButtonClick() {
    const data = this.getStoredData();
    data.totalClicks++;
    this.storeData(data);
    
  }

  private getPageName(path: string): string {
    const pageNames: { [key: string]: string } = {
      '/': 'Accueil',
      '/carte': 'Carte',
      '/diagnostic': 'Diagnostic',
      '/alertes': 'Alertes',
      '/bouteilles': 'vs Bouteilles',
      '/polluants': 'Polluants',
      '/login': 'Connexion',
      '/dashboard': 'Dashboard'
    };
    return pageNames[path] || 'Autre';
  }

  private getStoredData() {
    const stored = localStorage.getItem('site_analytics');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        totalVisits: parsed.totalVisits || 0,
        uniqueVisitors: parsed.uniqueVisitors || [],
        pageViews: parsed.pageViews || {},
        pageDurations: parsed.pageDurations || {},
        totalClicks: parsed.totalClicks || 0
      };
    }
    return {
      totalVisits: 0,
      uniqueVisitors: [],
      pageViews: {},
      pageDurations: {},
      totalClicks: 0
    };
  }

  private storeData(data: any) {
    localStorage.setItem('site_analytics', JSON.stringify(data));
  }

  getSiteMetrics(): SiteMetrics {
    const data = this.getStoredData();

    // Calculate average time per page
    let totalTime = 0;
    let totalDurations = 0;
    Object.values(data.pageDurations).forEach((durations: number[]) => {
      durations.forEach(duration => {
        totalTime += duration;
        totalDurations++;
      });
    });
    const avgTimePerPage = totalDurations > 0 ? Math.floor(totalTime / totalDurations) : 0;

    // Calculate page metrics
    const pageMetrics: PageMetrics[] = Object.entries(data.pageViews).map(([page, visits]) => {
      const durations = data.pageDurations[page] || [];
      const avgTime = durations.length > 0 
        ? Math.floor(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
      
      // Simple bounce rate calculation (pages with < 30s duration)
      const shortVisits = durations.filter(d => d < 30).length;
      const bounceRate = durations.length > 0 
        ? Math.floor((shortVisits / durations.length) * 100)
        : 0;

      return {
        page,
        visits: visits as number,
        avgTime,
        bounceRate: `${bounceRate}%`
      };
    }).sort((a, b) => b.visits - a.visits);

    return {
      totalVisits: data.totalVisits,
      uniqueVisitors: data.uniqueVisitors.length,
      avgTimePerPage,
      totalClicks: data.totalClicks,
      pageMetrics
    };
  }

  resetAnalytics() {
    localStorage.removeItem('site_analytics');
    console.log('Analytics data reset');
  }
}

export const analyticsService = new AnalyticsService();
