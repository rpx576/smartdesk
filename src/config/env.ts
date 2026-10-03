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
