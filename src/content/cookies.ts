import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS } from "@/lib/consent";

/**
 * Cookies and similar storage of the website: one list for the cookie policy
 * table and the consent panel, so both always say the same. Only what the code
 * really sets. `service` marks the ones that only exist when that third party
 * is configured (`publicConfig.turnstileSiteKey` / `publicConfig.gaId`).
 * Any new cookie: add it here, to `PROCESSORS` in company.ts and to the CSP.
 */
export type CookieEntry = {
  name: string;
  provider: string;
  kind: string;
  purpose: string;
  duration: string;
  service?: "turnstile" | "analytics";
};

export type CookieCategory = {
  id: "necesarias" | "analitica";
  name: string;
  description: string;
  cookies: CookieEntry[];
};

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "necesarias",
    name: "Técnicas (necesarias)",
    description:
      "Hacen que la web funcione y recuerdan lo que tú eliges, como tu decisión sobre las cookies. Están exentas de consentimiento (art. 22.2 LSSI) y no se pueden desactivar.",
    cookies: [
      {
        name: CONSENT_COOKIE,
        provider: "Propia",
        kind: "Técnica (cookie)",
        purpose: "Guardar tu decisión sobre las cookies de análisis para no volver a preguntarte en cada visita.",
        duration: `${CONSENT_MAX_AGE_DAYS} días`,
      },
      {
        name: "smarthub.blog.saved",
        provider: "Propia",
        kind: "Técnica (localStorage)",
        purpose: "Recordar los artículos del blog que marcas para leer más tarde. Se guarda solo en tu navegador y no se envía a ningún servidor.",
        duration: "Hasta que la borres",
      },
      {
        name: "Cloudflare Turnstile",
        provider: "Cloudflare, Inc.",
        kind: "Técnica de seguridad",
        purpose: "Comprobar que el formulario de contacto lo envía una persona y no un programa automático. Solo se carga en la página de contacto.",
        duration: "Durante la verificación",
        service: "turnstile",
      },
    ],
  },
  {
    id: "analitica",
    name: "Análisis",
    description:
      "Sirven para saber, de forma agregada, cuántas personas visitan la web y qué páginas consultan, para mejorarla. Solo se instalan si las aceptas.",
    cookies: [
      {
        name: "_ga",
        provider: "Google Ireland Ltd.",
        kind: "Análisis",
        purpose: "Distinguir visitantes de forma seudónima para elaborar estadísticas de uso de la web.",
        duration: "2 años",
        service: "analytics",
      },
      {
        name: "_ga_*",
        provider: "Google Ireland Ltd.",
        kind: "Análisis",
        purpose: "Mantener el estado de la sesión de Google Analytics 4 para medir las visitas.",
        duration: "2 años",
        service: "analytics",
      },
    ],
  },
];
