import { z } from "zod";

/*
 * Server-side settings, read lazily (never at import time) so that `next build`
 * works without secrets and a value added to the environment is picked up
 * without code changes. Browser settings use NEXT_PUBLIC_* variables, which
 * Next.js inlines at build time; they are read in `publicConfig` below.
 */

export type SiteConfig = {
  /** Public address of the website, without a trailing slash (e.g. https://advanthor.es). */
  url: string;
  /** Search engines may index the site only when SITE_INDEXING=on (provisional sites stay private). */
  indexing: boolean;
  /** Google Search Console "HTML tag" verification code, if any. */
  googleVerification: string | null;
};

const siteSchema = z.object({
  SITE_URL: z.string().trim().optional(),
  URL: z.string().trim().optional(), // set by Netlify to the main address of the site
  SITE_INDEXING: z.string().trim().optional(),
  GOOGLE_SITE_VERIFICATION: z.string().trim().optional(),
});

/** Website settings. Safe by default: not indexable until SITE_INDEXING=on. */
export function getSiteConfig(): SiteConfig {
  const parsed = siteSchema.parse(process.env);
  return {
    url: (parsed.SITE_URL || parsed.URL || "http://localhost:3000").replace(/\/+$/, ""),
    indexing: parsed.SITE_INDEXING === "on",
    googleVerification: parsed.GOOGLE_SITE_VERIFICATION || null,
  };
}

export type ContactConfig = {
  /** API key of Resend (transactional email). Without it the form says email is not available yet. */
  resendApiKey: string | null;
  /** Inbox that receives the requests. */
  to: string | null;
  /** Sender, on a domain verified in Resend, e.g. "Advanthor <web@advanthor.es>". */
  from: string | null;
  /** Cloudflare Turnstile secret. When set, every submission must carry a valid token. */
  turnstileSecret: string | null;
};

const contactSchema = z.object({
  RESEND_API_KEY: z.string().trim().optional(),
  CONTACT_TO_EMAIL: z.string().trim().optional(),
  CONTACT_FROM_EMAIL: z.string().trim().optional(),
  TURNSTILE_SECRET_KEY: z.string().trim().optional(),
});

export function getContactConfig(): ContactConfig {
  const parsed = contactSchema.parse(process.env);
  return {
    resendApiKey: parsed.RESEND_API_KEY || null,
    to: parsed.CONTACT_TO_EMAIL || null,
    from: parsed.CONTACT_FROM_EMAIL || null,
    turnstileSecret: parsed.TURNSTILE_SECRET_KEY || null,
  };
}

/** True when the form can really send email. */
export function isEmailConfigured(config: ContactConfig = getContactConfig()): boolean {
  return Boolean(config.resendApiKey && config.to && config.from);
}

/**
 * Settings visible to the browser. Each value must be written as
 * `process.env.NEXT_PUBLIC_X` literally so Next.js can inline it.
 */
export const publicConfig = {
  /** Cloudflare Turnstile site key (anti-spam widget on the contact form). */
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null,
  /** Public booking link (Cal.com, Calendly, Google Calendar...). Without it, no booking button is shown. */
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || null,
  /** Google Analytics 4 measurement id. Loaded only after the visitor accepts analytics cookies. */
  gaId: process.env.NEXT_PUBLIC_GA_ID || null,
  /** Public contact email shown on the site. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
};
