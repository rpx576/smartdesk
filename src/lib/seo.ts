import type { Metadata } from "next";
import { BRAND, PHONE_DISPLAY } from "@/content/site";
import type { Faq, Service } from "@/content/services";

type PageSeo = {
  title: string;
  description: string;
  /** Path of the page, e.g. "/seo". Used for the canonical address and Open Graph. */
  path: string;
  /** Private, thank-you or duplicate pages stay out of search engines. */
  noindex?: boolean;
};

/** Share image (1200×630) served by `src/app/opengraph-image.jpg`. Page-level Open Graph replaces the root one, so it is set on every page. */
export const SHARE_IMAGE = { url: "/opengraph-image.jpg", width: 1200, height: 630, alt: `${BRAND.name}: ${BRAND.tagline}` };

/**
 * Metadata of one page: unique title and description, canonical address,
 * Open Graph and Twitter card with the share image.
 */
export function pageMetadata({ title, description, path, noindex }: PageSeo): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: BRAND.name, locale: "es_ES", title, description, url: path, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Public pages that search engines may index (the sitemap lists exactly these). */
export const INDEXABLE_PATHS = [
  "/",
  "/creacion-web",
  "/mantenimiento-web",
  "/seo",
  "/ciberseguridad",
  "/sobre-nosotros",
  "/blog",
  "/contacto",
  "/aviso-legal",
  "/politica-de-privacidad",
  "/politica-de-cookies",
  "/condiciones-de-contratacion",
] as const;

/** Pages that must never be indexed. */
export const NOINDEX_PATHS = ["/gracias", "/configuracion-cookies"] as const;

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(siteUrl: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: BRAND.name,
    slogan: BRAND.tagline,
    description: BRAND.description,
    url: siteUrl,
    logo: `${siteUrl}${BRAND.logo}`,
    contactPoint: [
      { "@type": "ContactPoint", telephone: PHONE_DISPLAY.replace(/\s/g, ""), contactType: "customer service", availableLanguage: ["es"] },
    ],
  };
}

export function serviceJsonLd(service: Service, siteUrl: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.metaDescription,
    url: `${siteUrl}${service.href}`,
    provider: { "@id": `${siteUrl}/#organization` },
    areaServed: { "@type": "Country", name: "España" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: service.itemsTitle,
      itemListElement: service.items.map((item) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: item.title, description: item.text },
      })),
    },
  };
}

export function faqJsonLd(faq: readonly Faq[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], siteUrl: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

/** JSON for a `<script type="application/ld+json">`, with `<` escaped so content can never close the tag. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
