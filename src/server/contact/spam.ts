/** A person needs at least this long to fill the form. */
export const MIN_FILL_MS = 3_000;
/** Forms left open longer than this must be reloaded (stale or replayed). */
export const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

export type SpamVerdict = { ok: true } | { ok: false; reason: "honeypot" | "too-fast" | "stale" };

/** Cheap bot checks that need no third party: hidden field and fill time. */
export function checkSpam(input: { website?: string; startedAt: number }, now = Date.now()): SpamVerdict {
  if (input.website && input.website.trim() !== "") return { ok: false, reason: "honeypot" };
  const elapsed = now - input.startedAt;
  if (elapsed < MIN_FILL_MS) return { ok: false, reason: "too-fast" };
  if (elapsed > MAX_FORM_AGE_MS) return { ok: false, reason: "stale" };
  return { ok: true };
}
