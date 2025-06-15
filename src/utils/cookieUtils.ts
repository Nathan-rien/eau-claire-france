
export interface VisitData {
  sessionId: string;
  visitCount: number;
  uniqueVisitors: Set<string>;
  pageViews: { [page: string]: number };
  pageDurations: { [page: string]: number[] };
  buttonClicks: number;
  lastVisit: number;
}

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const setCookie = (name: string, value: string, days: number = 30): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getVisitorId = (): string => {
  let visitorId = getCookie('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCookie('visitor_id', visitorId, 365); // 1 an
  }
  return visitorId;
};

export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};
