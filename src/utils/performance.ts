// Performance utilities for the application

/**
 * Preload a route component to improve perceived performance
 */
export const preloadRoute = (routeImport: () => Promise<any>) => {
  const prefetchLink = document.createElement('link');
  prefetchLink.rel = 'prefetch';
  routeImport().then(() => {
    // Component is now preloaded
  }).catch(() => {
    // Ignore preload errors, component will load normally when accessed
  });
};

/**
 * Debounced function utility
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Request idle callback for non-critical tasks
 */
export const requestIdleCallback = (callback: () => void, timeout = 5000) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(callback, 16); // ~60fps
};

/**
 * Intersection Observer for lazy loading
 */
export const createLazyObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (!('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
  });
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};