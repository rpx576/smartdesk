import type { NextConfig } from "next";

/*
 * Publishing settings, read when the site is built:
 * - SITE_INDEXING=on lets search engines in. Without it every response carries
 *   `X-Robots-Tag: noindex`, so a provisional site shared by link stays out of Google.
 */
const indexing = process.env.SITE_INDEXING === "on";
const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy without nonces (pages stay static). Only the third
 * parties the site really uses: Unsplash photos (blog), Cloudflare Turnstile
 * (anti-spam, if enabled) and Google Analytics (only after consent, if enabled).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://www.googletagmanager.com https://*.google-analytics.com",
  "font-src 'self'",
  "connect-src 'self' https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Browsers only honour HSTS over HTTPS. No `preload`: it is hard to undo, decide it once the domain is final.
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

/** Old addresses of the SmartHub products, sent for good (301) to the closest new page. */
const moved: [string, string][] = [
  ["/smartweb", "/creacion-web"],
  ["/smartweb/:path*", "/creacion-web"],
  ["/smartai", "/creacion-web"],
  ["/smartai/:path*", "/creacion-web"],
  ["/soluciones", "/"],
  ["/soluciones/:path*", "/"],
  ["/smartdesk", "/"],
  ["/smartdesk/:path*", "/"],
  ["/login", "/"],
  ["/register", "/"],
  ["/cuenta", "/"],
  ["/en", "/"],
  ["/en/contacto", "/contacto"],
  ["/en/:path*", "/"],
  ["/es", "/"],
  ["/es/:path*", "/:path*"],
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 85],
  },
  async headers() {
    return [
      { source: "/:path*", headers: [...securityHeaders, ...(indexing ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }])] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  async redirects() {
    return moved.map(([source, destination]) => ({ source, destination, statusCode: 301 }));
  },
};

export default nextConfig;
