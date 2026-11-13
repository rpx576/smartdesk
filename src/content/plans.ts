/**
 * Commercial plans and ways to hire each service. Edit prices here: `null`
 * shows "Precio a consultar", so no page ever shows a price that was not set.
 * Prices are monthly unless `period` says otherwise, VAT not included.
 */
export type Plan = {
  id: string;
  name: string;
  description: string;
  /** Price in euros, without VAT. `null` until the owner sets it. */
  price: number | null;
  /** "mes" for monthly fees, "proyecto" for one-off work. */
  period: "mes" | "proyecto";
  /** Shown as "Desde …" when the final price depends on the project. */
  from?: boolean;
  features: string[];
  featured?: boolean;
};

/** Maintenance plans: three levels of coverage. */
export const MAINTENANCE_PLANS: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    description: "Para webs sencillas que necesitan estar al día y con copias.",
    price: null,
    period: "mes",
    features: [
      "Actualizaciones de WordPress, plugins y temas",
      "Copia de seguridad semanal",
      "Monitorización de disponibilidad",
      "Protección básica de accesos",
      "Soporte por correo",
    ],
  },
  {
    id: "profesional",
    name: "Profesional",
    description: "Para negocios que dependen de su web para captar clientes.",
    price: null,
    period: "mes",
    featured: true,
    features: [
      "Todo lo del plan Básico",
      "Copia de seguridad diaria",
      "Corrección de errores incluida",
      "Pequeños cambios de contenido",
      "Soporte por correo y WhatsApp",
      "Informe mensual",
    ],
  },
  {
    id: "avanzado",
    name: "Avanzado",
    description: "Para tiendas online y webs con más tráfico o funcionalidades.",
    price: null,
    period: "mes",
    features: [
      "Todo lo del plan Profesional",
      "Optimización periódica de velocidad",
      "Monitorización de seguridad",
      "Más horas de soporte y cambios",
      "Revisión trimestral de mejoras",
    ],
  },
];

/** Ways to hire SEO work. */
export const SEO_PLANS: Plan[] = [
  {
    id: "auditoria",
    name: "Auditoría SEO",
    description: "Un diagnóstico completo con un plan de mejoras priorizado.",
    price: null,
    period: "proyecto",
    from: true,
    features: ["Revisión técnica y de contenidos", "Análisis de palabras clave", "Informe con prioridades", "Reunión de presentación"],
  },
  {
    id: "proyecto",
    name: "Proyecto SEO",
    description: "Implementamos las mejoras técnicas y on-page de tu web.",
    price: null,
    period: "proyecto",
    from: true,
    features: ["SEO técnico", "SEO on-page", "Configuración de Google Search Console", "Datos estructurados"],
  },
  {
    id: "local",
    name: "SEO local",
    description: "Para negocios que captan clientes en su zona.",
    price: null,
    period: "mes",
    features: ["Perfil de empresa en Google", "Coherencia de datos de contacto", "Páginas por zona cuando procede", "Informe mensual"],
  },
  {
    id: "mensual",
    name: "SEO mensual",
    description: "Trabajo continuo de contenidos, optimización y seguimiento.",
    price: null,
    period: "mes",
    featured: true,
    features: ["Optimización de contenidos", "Seguimiento de posicionamiento", "Revisión de Search Console", "Informes periódicos"],
  },
];

export type SecurityBlock = { id: "preventivo" | "auditoria" | "intervencion"; name: string; description: string; items: string[]; note: string };

/** Cybersecurity, split into prevention, audits and intervention (never mixed). */
export const SECURITY_BLOCKS: SecurityBlock[] = [
  {
    id: "preventivo",
    name: "Servicios preventivos",
    description: "Medidas para reducir el riesgo antes de que ocurra un problema.",
    items: [
      "Configuración de firewall",
      "Protección de accesos",
      "Doble autenticación",
      "Revisión de permisos",
      "Protección de formularios",
      "Copias de seguridad y recuperación",
      "Monitorización de seguridad",
    ],
    note: "Puede contratarse como servicio puntual o junto al mantenimiento.",
  },
  {
    id: "auditoria",
    name: "Auditorías",
    description: "Revisiones para saber en qué estado está tu web y qué conviene corregir.",
    items: ["Auditoría de seguridad web", "Análisis de vulnerabilidades autorizado", "Informe de hallazgos y recomendaciones"],
    note: "Solo sobre sistemas del cliente, con autorización por escrito y alcance acordado.",
  },
  {
    id: "intervencion",
    name: "Intervención",
    description: "Ayuda cuando ya ha ocurrido un incidente en tu web.",
    items: ["Análisis del incidente", "Limpieza y restauración desde copias", "Cierre de accesos comprometidos", "Recomendaciones para evitar que se repita"],
    note: "Valoramos cada caso y te confirmamos alcance y condiciones antes de empezar.",
  },
];

/** "120 €/mes", "Desde 300 €" or "Precio a consultar". */
export function formatPlanPrice(plan: Pick<Plan, "price" | "period" | "from">): string {
  if (plan.price === null) return "Precio a consultar";
  const amount = `${plan.price.toLocaleString("es-ES")} €`;
  const value = plan.period === "mes" ? `${amount}/mes` : amount;
  return plan.from ? `Desde ${value}` : value;
}
