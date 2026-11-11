/**
 * Data of the website owner for the legal pages (LSSI art. 10, RGPD art. 13).
 *
 * NOTHING here may be invented. Every `null` is shown on the legal pages as a
 * visible "[PENDIENTE: …]" marker until the owner confirms it, and the legal
 * texts must be reviewed by a lawyer before the site is published for real.
 */
export type CompanyData = {
  /** Name of the natural person or company that owns the website. */
  legalName: string | null;
  /** NIF / CIF. */
  taxId: string | null;
  /** Registered address. */
  address: string | null;
  /** Public contact email (also where privacy requests are sent). */
  email: string | null;
  phone: string;
  /** Mercantile Registry data, only if it is a company. */
  registry: string | null;
  /** Data Protection Officer, only if there is one. */
  dpo: string | null;
  /** Date the legal texts were last reviewed (YYYY-MM-DD). */
  lastReview: string | null;
};

export const COMPANY: CompanyData = {
  legalName: null,
  taxId: null,
  address: null,
  email: null,
  phone: "+34 655 130 513",
  registry: null,
  dpo: null,
  lastReview: null,
};

/**
 * Providers that may process personal data for the website (data processors,
 * RGPD art. 28). The owner must sign or accept each provider's DPA.
 * Only providers that the website really uses, or will use once configured.
 */
export const PROCESSORS = [
  { name: "Netlify, Inc.", purpose: "Alojamiento y entrega de la web", location: "Estados Unidos (revisar garantías de transferencia internacional)" },
  { name: "Proveedor de correo transaccional (p. ej. Resend)", purpose: "Envío de los correos del formulario de contacto", location: "[PENDIENTE: confirmar proveedor y ubicación]" },
  { name: "WhatsApp (Meta Platforms Ireland Ltd.)", purpose: "Conversaciones que el usuario inicia voluntariamente por WhatsApp", location: "Unión Europea / Estados Unidos" },
  { name: "Cloudflare, Inc. (Turnstile)", purpose: "Protección antispam del formulario, solo si se activa", location: "Estados Unidos (revisar garantías)" },
  { name: "Google Ireland Ltd. (Google Analytics)", purpose: "Analítica web, solo si se activa y el usuario la acepta", location: "Unión Europea / Estados Unidos" },
  { name: "Unsplash", purpose: "Fotografías del blog, servidas desde su red", location: "Estados Unidos" },
] as const;

/** "[PENDIENTE: label]" for data that has not been confirmed yet. */
export function pending(value: string | null, label: string): string {
  return value ?? `[PENDIENTE: ${label}]`;
}

/** True while any data required by the legal pages is still missing. */
export function hasPendingLegalData(data: CompanyData = COMPANY): boolean {
  return [data.legalName, data.taxId, data.address, data.email, data.lastReview].some((value) => value === null);
}
