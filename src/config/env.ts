import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // Read by Auth.js itself; validated here so a missing secret fails fast.
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
});

export type Env = {
  nodeEnv: "development" | "test" | "production";
  databaseUrl: string;
};

let cached: Env | undefined;

/**
 * Validated environment. Read lazily so that importing a module during
 * `next build` does not require runtime secrets.
 */
export function getEnv(): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${problems}`);
  }

  cached = { nodeEnv: parsed.data.NODE_ENV, databaseUrl: parsed.data.DATABASE_URL };
  return cached;
}

export type SiteConfig = {
  /** Public address of the website, without a trailing slash (e.g. https://smarthub.es). */
  url: string;
  /** Search engines may index the site only when SITE_INDEXING=on (provisional sites stay private). */
  indexing: boolean;
  /** Showcase mode: only the public pages; accounts and SmartDesk are redirected (no database). */
  showcase: boolean;
  /** Google Search Console "HTML tag" verification code, if any. */
  googleVerification: string | null;
};

const siteSchema = z.object({
  SITE_URL: z.string().trim().optional(),
  URL: z.string().trim().optional(), // set by Netlify to the main address of the site
  SITE_INDEXING: z.string().trim().optional(),
  SHOWCASE_MODE: z.string().trim().optional(),
  GOOGLE_SITE_VERIFICATION: z.string().trim().optional(),
});

/**
 * Website settings (indexing, address, showcase mode). Separate from
 * `getEnv()` so the public pages work without the database and auth
 * variables. Safe by default: not indexable until SITE_INDEXING=on.
 */
export function getSiteConfig(): SiteConfig {
  const parsed = siteSchema.parse(process.env);
  return {
    url: (parsed.SITE_URL || parsed.URL || "http://localhost:3000").replace(/\/+$/, ""),
    indexing: parsed.SITE_INDEXING === "on",
    showcase: parsed.SHOWCASE_MODE === "1",
    googleVerification: parsed.GOOGLE_SITE_VERIFICATION || null,
  };
}

export type SmartAiConfig = {
  /** Anthropic API key. Without it SmartAI runs in demo mode (template answers). */
  apiKey: string | null;
  model: string;
};

const smartAiSchema = z.object({
  ANTHROPIC_API_KEY: z.string().trim().optional(),
  SMARTAI_MODEL: z.string().trim().optional(),
});

/**
 * SmartAI settings. Separate from `getEnv()` so the public SmartAI page and
 * API work without the database and auth variables, and read on every call
 * so a key added to the environment is picked up without code changes.
 */
export function getSmartAiConfig(): SmartAiConfig {
  const parsed = smartAiSchema.parse(process.env);
  return {
    apiKey: parsed.ANTHROPIC_API_KEY || null,
    model: parsed.SMARTAI_MODEL || "claude-opus-5-5",
  };
}
