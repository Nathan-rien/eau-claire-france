// GA4 event tracking helper
// The gtag script is loaded from index.html (measurement ID G-2DE2LT87EY).

type GAParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: GAParams = {}) {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === "function") {
      w.gtag("event", name, params);
    }
  } catch {
    // silent
  }
}
