// GA4 event tracking helper
// The gtag script is loaded from index.html (measurement ID G-2DE2LT87EY),
// only once the visitor has accepted cookies (Consent Mode v2).

type GAParams = Record<string, string | number | boolean | undefined>;

/** Aucun envoi tant que le consentement analytics n'est pas accordé. */
function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem('cookie_consent') === 'granted';
  } catch {
    return false;
  }
}

export function trackEvent(name: string, params: GAParams = {}) {
  try {
    if (!hasAnalyticsConsent()) return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === "function") {
      w.gtag("event", name, params);
    }
  } catch {
    // silent
  }
}

/** page_view explicite pour les navigations côté client (React Router). */
export function trackPageView(path: string) {
  trackEvent("page_view", {
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
  });
}

/** Clic sur un lien affilié (Amazon). Même garde de consentement que trackEvent. */
export function trackAffiliateClick(
  product: { slug: string; name: string; tier: string; category: string },
  opts: { placement?: string; position: number; language?: string },
) {
  const path = typeof window !== 'undefined' ? window.location.pathname : undefined;
  trackEvent('affiliate_click', {
    page_path: path,
    placement: opts.placement || path,
    product_slug: product.slug,
    product_name: product.name,
    product_tier: product.tier,
    product_category: product.category,
    position: opts.position,
    language: opts.language,
    transport_type: 'beacon',
  });
}
