/**
 * In-memory sliding-window limiter (per server instance). Enough to stop one
 * visitor from burning the AI quota of a public demo; a multi-instance
 * deployment would move this to a shared store.
 */
export function createRateLimiter(options: { limit: number; windowMs: number; maxKeys?: number }) {
  const hits = new Map<string, number[]>();
  const maxKeys = options.maxKeys ?? 10_000;

  return {
    /** Records a hit for `key`; false when the key is over its limit (the hit is not recorded). */
    tryConsume(key: string, now = Date.now()): boolean {
      const since = now - options.windowMs;
      const recent = (hits.get(key) ?? []).filter((time) => time > since);
      if (recent.length >= options.limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.delete(key);
      hits.set(key, recent);
      // Forget the least recently used keys so memory stays bounded.
      while (hits.size > maxKeys) hits.delete(hits.keys().next().value!);
      return true;
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;
