import { analyticsId } from "./seoConfig";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackSeoEvent = (
  eventName: string,
  params: Record<string, string | number | boolean | undefined> = {}
) => {
  if (!analyticsId || typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, params);
};
