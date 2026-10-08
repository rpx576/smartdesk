/** Where SmartHub sends a user after signing in, unless a product asked for them. */
export const ACCOUNT_HOME = "/cuenta";

/**
 * Post-login target. Only SmartDesk paths are accepted (no host, query or
 * `//`), so a crafted link can never send someone to another site.
 */
export function safeNext(value: unknown): string {
  return typeof value === "string" && /^\/smartdesk(?:\/[a-z0-9-]+)*$/.test(value) ? value : ACCOUNT_HOME;
}
