import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/config/env";
import { LOCALES, TRANSLATED_PATHS, languageAlternates, localizeHref } from "@/i18n";

export const dynamic = "force-dynamic";

/** Public pages that exist only in Spanish (never the app behind a login). */
const SPANISH_ONLY_PATHS = ["/soluciones", "/smartai", "/smartweb", "/blog"];

/**
 * Public pages only. Translated pages appear once per language, each with the
 * links to its translations (hreflang). Empty while the site is not indexable.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const { indexing, url } = getSiteConfig();
  if (!indexing) return [];
  const absolute = (path: string) => `${url}${path === "/" ? "" : path}`;

  const translated = TRANSLATED_PATHS.flatMap((bare) =>
    LOCALES.map((locale) => ({
      url: absolute(localizeHref(locale, bare)),
      changeFrequency: "weekly" as const,
      alternates: {
        languages: Object.fromEntries(Object.entries(languageAlternates(bare)).map(([lang, path]) => [lang, absolute(path)])),
      },
    })),
  );
  const spanishOnly = SPANISH_ONLY_PATHS.map((path) => ({ url: absolute(path), changeFrequency: "weekly" as const }));
  return [...translated, ...spanishOnly];
}
