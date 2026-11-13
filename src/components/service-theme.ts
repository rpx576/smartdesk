import type { CSSProperties } from "react";
import type { ServiceId } from "@/content/services";

/**
 * Accent of each service: every page keeps the brand blue for its buttons and
 * takes its own tint for icons, labels, illustrations and details, so the four
 * modules are told apart at a glance. Values are RGB triplets for `rgb(var(--acc) / a)`;
 * `--acc` is the main tone, `--acc-soft` the light one for text and
 * `--acc-strong` the deep one for solid badges. The default (blue) is on `:root`.
 */
const ACCENTS: Record<ServiceId, [main: string, soft: string, strong: string]> = {
  "creacion-web": ["96 165 250", "191 219 254", "37 99 235"],
  "mantenimiento-web": ["45 212 191", "153 246 228", "13 148 136"],
  seo: ["167 139 250", "221 214 254", "124 58 237"],
  ciberseguridad: ["52 211 153", "167 243 208", "5 150 105"],
};

/** Inline style that sets the accent variables for everything inside. */
export function accentStyle(id: ServiceId): CSSProperties {
  const [main, soft, strong] = ACCENTS[id];
  return { "--acc": main, "--acc-soft": soft, "--acc-strong": strong } as CSSProperties;
}
