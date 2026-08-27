/**
 * Consentement cookies partagé entre CookieBanner (qui écrit le choix) et
 * PostHogProvider (qui doit réagir immédiatement à un clic Accepter/Refuser
 * sans rechargement de page). Les deux composants sont montés côte à côte
 * dans LayoutClient, sans relation parent/enfant : un évènement custom sur
 * window est le mécanisme le plus simple pour les synchroniser.
 */

export const COOKIE_CONSENT_KEY = "cookies_accepted";
export const COOKIE_CONSENT_EVENT = "baobab:cookie-consent-changed";

export type ConsentValue = "granted" | "denied" | null;

export function getStoredConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (stored === "true") return "granted";
  if (stored === "false") return "denied";
  return null;
}

export function setStoredConsent(value: "granted" | "denied"): void {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, value === "granted" ? "true" : "false");
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}
