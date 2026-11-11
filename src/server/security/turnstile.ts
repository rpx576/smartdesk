/** Verifies a Cloudflare Turnstile token on the server. False on any failure. */
export async function verifyTurnstile(
  token: string | undefined,
  secret: string,
  ip: string | null,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
