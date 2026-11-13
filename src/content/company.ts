/**
 * Data of the website owner for the legal pages (LSSI art. 10, RGPD art. 13).
 *
 * NOTHING here may be invented. Every `null` is shown on the legal pages as a
 * visible "[PENDIENTE: …]" marker until the owner provides it.
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
  /** Mercantile Registry data for a company; `false` for a self-employed owner (the row is hidden). */
  registry: string | false | null;
  /** Date the legal texts were last updated (YYYY-MM-DD). */
  lastReview: string;
};

export const COMPANY: CompanyData = {
  legalName: null,
  taxId: null,
  address: null,
  email: null,
  phone: "+34 655 130 513",
  registry: null,
  lastReview: "2026-11-11",
};

/** "11 de noviembre de 2026" for the legal pages. */
export function formatLegalDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/**
 * Providers that may process personal data for the website (data processors,
 * RGPD art. 28). The owner accepts each provider's data processing agreement.
 * `optional` providers are only used once they are configured.
 */
export const PROCESSORS = [
  { name: "Netlify, Inc.", purpose: "Alojamiento y entrega de la web", location: "Estados Unidos", optional: false },
  { name: "Resend, Inc.", purpose: "Envío de los correos del formulario de contacto", location: "Estados Unidos", optional: false },
  { name: "WhatsApp Ireland Ltd. (Meta)", purpose: "Conversaciones que inicias voluntariamente por WhatsApp", location: "Unión Europea, con posibles transferencias a Estados Unidos", optional: false },
  { name: "Cloudflare, Inc. (Turnstile)", purpose: "Verificación antispam del formulario", location: "Estados Unidos", optional: true },
  { name: "Google Ireland Ltd. (Google Analytics)", purpose: "Estadísticas de uso de la web, solo si las aceptas", location: "Unión Europea, con posibles transferencias a Estados Unidos", optional: true },
  { name: "Unsplash Inc.", purpose: "Fotografías del blog, servidas desde su red (recibe tu dirección IP al cargarlas)", location: "Estados Unidos", optional: false },
] as const;

/** "[PENDIENTE: label]" for data that has not been confirmed yet. */
export function pending(value: string | null, label: string): string {
  return value ?? `[PENDIENTE: ${label}]`;
}

/** True while any data required by the legal pages is still missing. */
export function hasPendingLegalData(data: CompanyData = COMPANY): boolean {
  return [data.legalName, data.taxId, data.address, data.email, data.registry].some((value) => value === null);
}
