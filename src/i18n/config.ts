/**
 * Languages of the public website. Spanish is the default and lives at the
 * root (`/`, `/contacto`); every other language has its own address prefix
 * (`/en`, `/en/contacto`), so each version can be shared, indexed and linked
 * to its translations (hreflang).
 */
export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Pages that exist in every language. The rest of the site is still Spanish
 * only: in English their links go to the Spanish page (marked "ES" in the menu).
 */
export const TRANSLATED_PATHS = ["/", "/contacto"] as const;

/** `/`, `/contacto`... without language prefix and without `#fragment` or `?query`. */
export function barePath(pathname: string): string {
  let path = pathname.split(/[?#]/)[0] || "/";
  if (path.length > 1) path = path.replace(/\/+$/, "") || "/";
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (path === `/${locale}`) return "/";
    if (path.startsWith(`/${locale}/`)) return path.slice(locale.length + 1) || "/";
  }
  return path;
}

/** Language of an address (Spanish when it has no prefix). */
export function localeOfPath(pathname: string): Locale {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
  }
  return DEFAULT_LOCALE;
}

export function isTranslatedPath(path: string): boolean {
  return (TRANSLATED_PATHS as readonly string[]).includes(path);
}

/**
 * Link to `href` (a site path such as `/contacto` or `/#idea`) in a language.
 * Paths that are not translated yet keep pointing to the Spanish page.
 */
export function localizeHref(locale: Locale, href: string): string {
  if (locale === DEFAULT_LOCALE) return href;
  const hashAt = href.indexOf("#");
  const path = hashAt === -1 ? href : href.slice(0, hashAt);
  const fragment = hashAt === -1 ? "" : href.slice(hashAt);
  if (!path.startsWith("/") || !isTranslatedPath(barePath(path))) return href;
  const bare = barePath(path);
  return `/${locale}${bare === "/" ? "" : bare}${fragment}`;
}

/** Same page in another language; a page without translation leads to the home of that language. */
export function switchLocaleHref(pathname: string, target: Locale): string {
  const bare = barePath(pathname);
  return localizeHref(target, isTranslatedPath(bare) ? bare : "/");
}

/** Absolute alternates of a translated page, for `alternates.languages` (hreflang). */
export function languageAlternates(bare: string): Record<string, string> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, localizeHref(locale, bare)]));
}
