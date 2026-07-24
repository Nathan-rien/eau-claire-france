import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const STORAGE_KEY = "cookie_consent";

type Choice = "granted" | "denied";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __loadGA?: () => void;
    __gaLoaded?: boolean;
  }
}

function applyConsent(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* noop */
  }
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: choice,
      ad_user_data: choice,
      ad_personalization: choice,
      analytics_storage: choice,
    });
  }
  if (choice === "granted" && typeof window.__loadGA === "function") {
    window.__loadGA();
  }
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: choice }));
}

export function getConsent(): Choice | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

const CookieConsent = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
    const openHandler = () => setVisible(true);
    window.addEventListener("open-cookie-consent", openHandler);
    return () => window.removeEventListener("open-cookie-consent", openHandler);
  }, []);

  if (!visible) return null;

  const handle = (choice: Choice) => {
    applyConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('consent.ariaLabel')}
      className="fixed inset-x-3 bottom-3 z-[9999] md:inset-x-auto md:right-4 md:bottom-4 md:max-w-md"
    >
      <div className="relative rounded-xl border bg-background/95 backdrop-blur shadow-lg p-4">
        <button
          type="button"
          aria-label={t('consent.close')}
          onClick={() => handle("denied")}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 mt-0.5 text-primary shrink-0" />
          <div className="text-sm text-foreground">
            <p className="font-semibold mb-1">{t('consent.title')}</p>
            <p className="text-muted-foreground">
              {t('consent.body')}{" "}
              <Link to="/rgpd" className="underline hover:text-foreground">
                {t('consent.rgpdLink')}
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => handle("denied")}>
            {t('consent.decline')}
          </Button>
          <Button size="sm" onClick={() => handle("granted")}>
            {t('consent.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export function openCookieConsent() {
  window.dispatchEvent(new CustomEvent("open-cookie-consent"));
}

export function setCookieConsent(choice: Choice) {
  applyConsent(choice);
}

export default CookieConsent;
