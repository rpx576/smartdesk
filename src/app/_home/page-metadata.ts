import type { Metadata } from "next";
import { format, getDictionary, languageAlternates, localizeHref, type Locale } from "@/i18n";
import { WHATSAPP_DISPLAY } from "../contacto/whatsapp";

/**
 * Metadata of a translated page: its own title and description, the canonical
 * address of this language and the links to its translations (hreflang), so
 * search engines show each language to the right visitors.
 */
export function pageMetadata(locale: Locale, page: "home" | "contact", barePath: string): Metadata {
  const dict = getDictionary(locale);
  const title = page === "home" ? dict.home.metaTitle : dict.contact.metaTitle;
  const description =
    page === "home" ? dict.home.metaDescription : format(dict.contact.metaDescription, { phone: WHATSAPP_DISPLAY });
  const other = locale === "es" ? "en" : "es";

  return {
    title,
    description,
    alternates: {
      canonical: localizeHref(locale, barePath),
      languages: { ...languageAlternates(barePath), "x-default": barePath },
    },
    openGraph: {
      type: "website",
      siteName: "SmartHub",
      title,
      description,
      locale: dict.ogLocale,
      alternateLocale: getDictionary(other).ogLocale,
      url: localizeHref(locale, barePath),
    },
  };
}
