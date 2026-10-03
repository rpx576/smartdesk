import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_DEV_BYPASS: z.enum(["true", "false"]).default("false"),
});

export type Env = {
  nodeEnv: "development" | "test" | "production";
  databaseUrl: string;
  /** Never enabled in production, whatever the variable says. */
  authDevBypass: boolean;
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

  const { NODE_ENV, DATABASE_URL, AUTH_DEV_BYPASS } = parsed.data;
  cached = {
    nodeEnv: NODE_ENV,
    databaseUrl: DATABASE_URL,
    authDevBypass: NODE_ENV !== "production" && AUTH_DEV_BYPASS === "true",
  };
  return cached;
}
