/**
 * Cookie consent (LSSI art. 22.2 and AEPD guide on cookies). Only one optional
 * category exists today: analytics. Necessary storage (this choice, the blog's
 * saved articles in localStorage, the anti-spam check) needs no consent.
 *
 * The choice is kept in a first-party cookie for 180 days; after that the
 * visitor is asked again.
 */
export const CONSENT_COOKIE = "adv_consent";
export const CONSENT_MAX_AGE_DAYS = 180;
const VERSION = "v1";

export type Consent = { analytics: boolean; decidedAt: number };

export function serializeConsent(consent: Consent): string {
  return `${VERSION}.${consent.analytics ? 1 : 0}.${Math.trunc(consent.decidedAt)}`;
}

/** Null when there is no valid, unexpired choice (the banner must ask). */
export function parseConsent(value: string | undefined | null, now = Date.now()): Consent | null {
  if (!value) return null;
  const match = /^v1\.([01])\.(\d{10,15})$/.exec(value);
  if (!match) return null;
  const decidedAt = Number(match[2]);
  if (decidedAt > now + 60_000) return null;
  if (now - decidedAt > CONSENT_MAX_AGE_DAYS * 86_400_000) return null;
  return { analytics: match[1] === "1", decidedAt };
}

/** Value of one cookie from a `document.cookie` string. */
export function readCookie(cookies: string, name: string): string | null {
  for (const part of cookies.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Cookies set by Google Analytics, removed when the visitor withdraws consent. */
export function isAnalyticsCookie(name: string): boolean {
  return name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name.startsWith("_gat");
}
