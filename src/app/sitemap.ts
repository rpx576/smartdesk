import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/config/env";
import { INDEXABLE_PATHS } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PRIORITY: Record<string, number> = { "/": 1, "/creacion-web": 0.9, "/mantenimiento-web": 0.9, "/seo": 0.9, "/ciberseguridad": 0.9, "/contacto": 0.8 };

/** Indexable public pages only. Empty while the site is not indexable. */
export default function sitemap(): MetadataRoute.Sitemap {
  const { indexing, url } = getSiteConfig();
  if (!indexing) return [];
  return INDEXABLE_PATHS.map((path) => ({
    url: `${url}${path === "/" ? "" : path}`,
    changeFrequency: path === "/blog" ? "weekly" : "monthly",
    priority: PRIORITY[path] ?? 0.5,
  }));
}
