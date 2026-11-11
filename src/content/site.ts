/**
 * Brand and contact data of the website: one place to change them.
 * Anything that is not confirmed yet is marked in `company.ts`, never invented here.
 */
export const BRAND = {
  name: "Advanthor",
  tagline: "Soluciones digitales avanzadas",
  /** Main promise, used in the home hero and in the default description. */
  headline: "Impulsamos tu negocio digital",
  subheadline: "Creamos, optimizamos y protegemos tu presencia online.",
  description:
    "Advanthor: creación de páginas web y tiendas online, mantenimiento web, SEO y ciberseguridad para empresas, autónomos y negocios.",
  logo: "/brand/advanthor-logo.png",
  heroImage: "/brand/advanthor-hero.jpg",
} as const;

/** WhatsApp and phone of the business (confirmed by the owner). */
export const WHATSAPP_NUMBER = "34655130513";
export const PHONE_DISPLAY = "+34 655 130 513";
export const PHONE_HREF = "tel:+34655130513";

/** wa.me link to the business WhatsApp, with the message pre-filled when given. */
export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export type NavLink = { label: string; href: string; description?: string };

export const SERVICE_LINKS: NavLink[] = [
  { label: "Creación web", href: "/creacion-web", description: "Webs corporativas, tiendas online y landing pages" },
  { label: "Mantenimiento web", href: "/mantenimiento-web", description: "Actualizaciones, copias, monitorización y soporte" },
  { label: "SEO", href: "/seo", description: "Auditoría, SEO técnico, on-page y local" },
  { label: "Ciberseguridad", href: "/ciberseguridad", description: "Prevención, auditorías e intervención" },
];

export const COMPANY_LINKS: NavLink[] = [
  { label: "Sobre nosotros", href: "/sobre-nosotros" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de privacidad", href: "/politica-de-privacidad" },
  { label: "Política de cookies", href: "/politica-de-cookies" },
  { label: "Configuración de cookies", href: "/configuracion-cookies" },
  { label: "Condiciones de contratación", href: "/condiciones-de-contratacion" },
];

/** Link to the contact form with a service (and optionally the quote mode) already chosen. */
export function quoteHref(service?: string): string {
  const params = new URLSearchParams({ tipo: "presupuesto" });
  if (service) params.set("servicio", service);
  return `/contacto?${params.toString()}#formulario`;
}
