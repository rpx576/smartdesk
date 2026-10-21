import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteConfig } from "@/config/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Phones: use the whole screen (notch, home bar); the bottom bar adds the safe-area padding itself. */
export const viewport: Viewport = { viewportFit: "cover" };

const DESCRIPTION = "SmartHub: SmartDesk y el resto de soluciones para pequeñas empresas";

/**
 * Site-wide metadata. Until SITE_INDEXING=on every page carries noindex, so a
 * provisional site that is shared by link never shows up in search results.
 */
export function generateMetadata(): Metadata {
  const { url, indexing, googleVerification } = getSiteConfig();
  return {
    metadataBase: new URL(url),
    title: { default: "SmartHub", template: "%s" },
    description: DESCRIPTION,
    robots: indexing ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
    openGraph: { type: "website", siteName: "SmartHub", locale: "es_ES", title: "SmartHub", description: DESCRIPTION },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
