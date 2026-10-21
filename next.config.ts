import type { NextConfig } from "next";

/*
 * Publishing settings, read when the site is built:
 * - SITE_INDEXING=on lets search engines in. Without it every response carries
 *   `X-Robots-Tag: noindex`, so a provisional site shared by link stays out of Google.
 * - SHOWCASE_MODE=1 publishes only the public pages (no database): accounts and the
 *   SmartDesk app redirect to the contact page and the API for them is closed.
 */
const indexing = process.env.SITE_INDEXING === "on";
const showcase = process.env.SHOWCASE_MODE === "1";

const closedPaths = [
  "/smartdesk",
  "/login",
  "/register",
  "/cuenta",
  "/smartdesk/login",
  "/smartdesk/empezar",
  "/smartdesk/dashboard",
  "/smartdesk/clients/:path*",
  "/smartdesk/projects/:path*",
  "/smartdesk/tasks/:path*",
  "/smartdesk/calendar/:path*",
  "/smartdesk/documents",
  "/smartdesk/settings",
  "/api/auth/:path*",
  "/api/organizations/:path*",
];

const nextConfig: NextConfig = {
  async headers() {
    if (indexing) return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] }];
  },
  async redirects() {
    // Spanish is the default language and lives at the root, so `/es` leads there.
    const spanish = [
      { source: "/es", destination: "/", permanent: false },
      { source: "/es/:path*", destination: "/:path*", permanent: false },
    ];
    if (!showcase) return spanish;
    return [...spanish, ...closedPaths.map((source) => ({ source, destination: "/contacto", permanent: false }))];
  },
};

export default nextConfig;
