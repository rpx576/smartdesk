import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/config/env";

// Read at request time, so changing SITE_INDEXING never needs a code change.
export const dynamic = "force-dynamic";

/** robots.txt: closed to every crawler until SITE_INDEXING=on. */
export default function robots(): MetadataRoute.Robots {
  const { indexing, url } = getSiteConfig();
  if (!indexing) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/smartdesk", "/cuenta", "/login", "/register"] },
    sitemap: `${url}/sitemap.xml`,
  };
}
