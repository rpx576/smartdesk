import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConsentProvider } from "@/components/cookies/consent";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteConfig } from "@/config/env";
import { BRAND } from "@/content/site";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/** Phones: use the whole screen (notch, home bar); the menu panel adds the safe-area padding itself. */
export const viewport: Viewport = { viewportFit: "cover", themeColor: "#020617" };

/**
 * Site-wide metadata. Until SITE_INDEXING=on every page carries noindex, so a
 * provisional site that is shared by link never shows up in search results.
 */
export function generateMetadata(): Metadata {
  const { url, indexing, googleVerification } = getSiteConfig();
  return {
    metadataBase: new URL(url),
    applicationName: BRAND.name,
    title: { default: `${BRAND.name} | ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
    description: BRAND.description,
    robots: indexing ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
    openGraph: { type: "website", siteName: BRAND.name, locale: "es_ES", title: BRAND.name, description: BRAND.description },
    twitter: { card: "summary_large_image", title: BRAND.name, description: BRAND.description },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { url } = getSiteConfig();
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-950 font-sans text-slate-100">
        <JsonLd data={organizationJsonLd(url)} />
        <ConsentProvider>
          <SiteHeader />
          <div id="contenido" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </div>
          <SiteFooter />
        </ConsentProvider>
      </body>
    </html>
  );
}
