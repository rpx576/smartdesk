/**
 * SmartWeb catalogue and quote engine: project types, modules, extras, the
 * look of the preview and the per-sector sample content. Plain data and pure
 * functions shared by the SmartWeb page, the SmartWeb Studio configurator and
 * the tests. Prices are SmartHub's reference prices (VAT excluded); the final
 * proposal is always confirmed with the customer.
 */

export const PROJECT_TYPE_IDS = ["landing", "corporativa", "reservas", "tienda"] as const;
export type ProjectTypeId = (typeof PROJECT_TYPE_IDS)[number];

export const MODULE_IDS = [
  "whatsapp",
  "seo",
  "resenas",
  "galeria",
  "blog",
  "reservas",
  "tienda",
  "pagos",
  "multidioma",
  "smartdesk",
  "smartai",
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export const EXTRA_IDS = ["textos", "logo", "fotos"] as const;
export type ExtraId = (typeof EXTRA_IDS)[number];

export const SECTOR_IDS = ["restaurante", "clinica", "taller", "reformas", "moda", "asesoria", "gimnasio", "belleza"] as const;
export type SectorId = (typeof SECTOR_IDS)[number];

export const PALETTE_IDS = ["esmeralda", "oceano", "coral", "violeta", "grafito", "oro"] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];

export const STYLE_IDS = ["moderno", "elegante", "atrevido", "minimal"] as const;
export type StyleId = (typeof STYLE_IDS)[number];

export const SPEED_IDS = ["estandar", "express"] as const;
export type SpeedId = (typeof SPEED_IDS)[number];

export const MAINTENANCE_IDS = ["ninguno", "esencial", "crecimiento"] as const;
export type MaintenanceId = (typeof MAINTENANCE_IDS)[number];

export type ProjectType = {
  id: ProjectTypeId;
  name: string;
  description: string;
  /** Price of the project with its included pages and modules (VAT excluded). */
  price: number;
  weeks: number;
  /** Pages included in the price; `fixedPages` types cannot add more. */
  pagesIncluded: number;
  fixedPages?: boolean;
  /** Modules that come with this type at no extra cost. */
  includes: ModuleId[];
  idealFor: string;
};

export const projectTypes: ProjectType[] = [
  {
    id: "landing",
    name: "Landing page",
    description: "Una sola página enfocada en que te contacten. Ideal para campañas y negocios que empiezan.",
    price: 690,
    weeks: 1,
    pagesIncluded: 1,
    fixedPages: true,
    includes: ["whatsapp"],
    idealFor: "Campañas, lanzamientos y profesionales",
  },
  {
    id: "corporativa",
    name: "Web corporativa",
    description: "Tu empresa al completo: servicios, quiénes sois, trabajos y contacto, con una imagen profesional.",
    price: 1290,
    weeks: 3,
    pagesIncluded: 5,
    includes: ["whatsapp"],
    idealFor: "Pymes, despachos y empresas de servicios",
  },
  {
    id: "reservas",
    name: "Web con reservas",
    description: "Tus clientes eligen día y hora sin llamarte. Recordatorios automáticos y agenda siempre al día.",
    price: 1690,
    weeks: 4,
    pagesIncluded: 5,
    includes: ["whatsapp", "reservas"],
    idealFor: "Clínicas, restaurantes, peluquerías y talleres",
  },
  {
    id: "tienda",
    name: "Tienda online",
    description: "Catálogo, carrito y pagos con tarjeta o Bizum para vender las 24 horas, con gestión sencilla de pedidos.",
    price: 2490,
    weeks: 5,
    pagesIncluded: 5,
    includes: ["whatsapp", "tienda", "pagos"],
    idealFor: "Comercios y marcas que quieren vender por internet",
  },
];

export type ModuleGroup = "captar" | "vender" | "automatizar";

export type WebModule = {
  id: ModuleId;
  name: string;
  description: string;
  price: number;
  /** Extra development time in weeks. */
  weeks: number;
  /** Weight in the SmartWeb index: how much it helps to get customers. */
  impact: number;
  group: ModuleGroup;
};

export const moduleGroups: { id: ModuleGroup; name: string }[] = [
  { id: "captar", name: "Atraer clientes" },
  { id: "vender", name: "Vender y reservar" },
  { id: "automatizar", name: "Automatizar" },
];

export const webModules: WebModule[] = [
  { id: "whatsapp", name: "Botón de WhatsApp", description: "Un toque y te escriben al móvil.", price: 0, weeks: 0, impact: 8, group: "captar" },
  { id: "seo", name: "SEO local", description: "Ficha de Google, mapa y textos para salir en tu zona.", price: 290, weeks: 0.5, impact: 12, group: "captar" },
  { id: "resenas", name: "Reseñas de Google", description: "Tus mejores opiniones, en tu web y al día.", price: 120, weeks: 0, impact: 8, group: "captar" },
  { id: "galeria", name: "Galería de trabajos", description: "Fotos de antes y después que convencen.", price: 150, weeks: 0, impact: 4, group: "captar" },
  { id: "blog", name: "Blog", description: "Artículos que te traen visitas de Google.", price: 290, weeks: 0.5, impact: 6, group: "captar" },
  { id: "multidioma", name: "Segundo idioma", description: "Inglés u otro idioma para turistas y clientes de fuera.", price: 350, weeks: 0.5, impact: 4, group: "captar" },
  { id: "reservas", name: "Reservas y citas", description: "Agenda online con recordatorios automáticos.", price: 390, weeks: 1, impact: 10, group: "vender" },
  { id: "tienda", name: "Tienda online", description: "Catálogo, carrito y gestión de pedidos.", price: 990, weeks: 1.5, impact: 10, group: "vender" },
  { id: "pagos", name: "Pagos online", description: "Tarjeta y Bizum, también para señales de reserva.", price: 290, weeks: 0.5, impact: 6, group: "vender" },
  { id: "smartdesk", name: "Conectada a SmartDesk", description: "Cada contacto entra como cliente en SmartDesk.", price: 250, weeks: 0.5, impact: 6, group: "automatizar" },
  { id: "smartai", name: "Asistente SmartAI 24/7", description: "Responde dudas y capta contactos aunque estés cerrado.", price: 490, weeks: 1, impact: 8, group: "automatizar" },
];

export type Extra = { id: ExtraId; name: string; description: string; price: number; impact: number };

export const extras: Extra[] = [
  { id: "textos", name: "Redacción de textos", description: "Escribimos todos los textos pensando en vender.", price: 190, impact: 5 },
  { id: "logo", name: "Diseño de logo", description: "Logo y colores de marca listos para usar.", price: 290, impact: 2 },
  { id: "fotos", name: "Sesión de fotos", description: "Fotógrafo en tu negocio, 2 horas.", price: 350, impact: 4 },
];

export const EXTRA_PAGE_PRICE = 120;
export const MAX_PAGES = 15;
/** Express delivery: about 30 % sooner for 20 % more. */
export const EXPRESS_SURCHARGE = 0.2;
export const VAT_RATE = 0.21;
/** Share of the project paid to start; the rest on delivery. */
export const DEPOSIT_RATE = 0.4;

export type MaintenancePlan = { id: MaintenanceId; name: string; monthly: number; description: string; impact: number };

export const maintenancePlans: MaintenancePlan[] = [
  { id: "ninguno", name: "Sin plan", monthly: 0, description: "Hosting y dominio el primer año. Cambios a demanda.", impact: 0 },
  { id: "esencial", name: "Esencial", monthly: 29, description: "Hosting, dominio, copias, seguridad y actualizaciones.", impact: 2 },
  { id: "crecimiento", name: "Crecimiento", monthly: 59, description: "Todo lo Esencial, 2 h de cambios al mes e informe de visitas.", impact: 4 },
];

export type Palette = { id: PaletteId; name: string; primary: string; accent: string; soft: string; ink: string };

export const palettes: Palette[] = [
  { id: "esmeralda", name: "Esmeralda", primary: "#059669", accent: "#a3e635", soft: "#ecfdf5", ink: "#052e2b" },
  { id: "oceano", name: "Océano", primary: "#2563eb", accent: "#22d3ee", soft: "#eff6ff", ink: "#0b1b3a" },
  { id: "coral", name: "Coral", primary: "#e11d48", accent: "#fb923c", soft: "#fff1f2", ink: "#3b0a17" },
  { id: "violeta", name: "Violeta", primary: "#7c3aed", accent: "#f472b6", soft: "#f5f3ff", ink: "#1e0b3d" },
  { id: "grafito", name: "Grafito", primary: "#18181b", accent: "#facc15", soft: "#f4f4f5", ink: "#09090b" },
  { id: "oro", name: "Oro", primary: "#a16207", accent: "#1c1917", soft: "#fefce8", ink: "#1c1917" },
];

export type SiteStyle = { id: StyleId; name: string; description: string };

export const siteStyles: SiteStyle[] = [
  { id: "moderno", name: "Moderno", description: "Limpio, redondeado y cercano" },
  { id: "elegante", name: "Elegante", description: "Tipografía serif y mucho aire" },
  { id: "atrevido", name: "Atrevido", description: "Titulares grandes y contraste" },
  { id: "minimal", name: "Minimal", description: "Lo justo, sin distracciones" },
];

export type SectorContent = {
  id: SectorId;
  name: string;
  /** Default business name for the preview. */
  sampleName: string;
  headlines: [string, string, string];
  subheadline: string;
  cta: string;
  services: { title: string; text: string }[];
  products: { name: string; price: string }[];
  testimonial: { text: string; author: string };
  /** Suggested project type and modules when the sector is picked. */
  suggested: { type: ProjectTypeId; modules: ModuleId[] };
};

export const sectors: SectorContent[] = [
  {
    id: "restaurante",
    name: "Restaurante",
    sampleName: "Casa Lucía",
    headlines: ["Cocina de mercado en el corazón del barrio", "Tu mesa te espera esta noche", "Sabores de siempre, hechos hoy"],
    subheadline: "Producto fresco, menú del día y terraza. Reserva en dos toques y te guardamos la mejor mesa.",
    cta: "Reservar mesa",
    services: [
      { title: "Menú del día", text: "Tres platos caseros que cambian cada semana." },
      { title: "Carta de temporada", text: "Producto local y recetas de la casa." },
      { title: "Eventos privados", text: "Cumpleaños y comidas de empresa a medida." },
    ],
    products: [
      { name: "Tarjeta regalo cena", price: "60 €" },
      { name: "Menú degustación", price: "45 €" },
      { name: "Vino de la casa", price: "14 €" },
    ],
    testimonial: { text: "Reservamos desde el móvil en un minuto y la comida, espectacular.", author: "Marta G." },
    suggested: { type: "reservas", modules: ["seo", "resenas", "galeria"] },
  },
  {
    id: "clinica",
    name: "Clínica",
    sampleName: "Clínica Sonrisa",
    headlines: ["Tu salud, en las mejores manos", "Pide cita sin esperas ni llamadas", "Cuidamos de ti y de tu familia"],
    subheadline: "Profesionales con experiencia, tecnología actual y cita online cuando mejor te venga.",
    cta: "Pedir cita",
    services: [
      { title: "Primera visita", text: "Diagnóstico completo y plan de tratamiento." },
      { title: "Tratamientos", text: "Explicados con claridad y sin sorpresas." },
      { title: "Financiación", text: "Paga en cómodos plazos sin intereses." },
    ],
    products: [
      { name: "Limpieza dental", price: "45 €" },
      { name: "Blanqueamiento", price: "190 €" },
      { name: "Revisión anual", price: "30 €" },
    ],
    testimonial: { text: "Pedí cita online un domingo y el lunes ya me estaban atendiendo.", author: "Javier R." },
    suggested: { type: "reservas", modules: ["seo", "resenas", "smartdesk"] },
  },
  {
    id: "taller",
    name: "Taller",
    sampleName: "Talleres Ana",
    headlines: ["Tu coche listo, sin sorpresas en la factura", "Mecánica de confianza cerca de ti", "Revisión, ITV y reparación en un solo sitio"],
    subheadline: "Presupuesto antes de empezar, cita online y aviso por WhatsApp cuando tu coche está listo.",
    cta: "Pedir presupuesto",
    services: [
      { title: "Mecánica general", text: "Frenos, embrague, distribución y más." },
      { title: "Pre-ITV", text: "Revisamos todo para que pases a la primera." },
      { title: "Neumáticos", text: "Montaje, equilibrado y alineación." },
    ],
    products: [
      { name: "Cambio de aceite", price: "59 €" },
      { name: "Revisión pre-ITV", price: "39 €" },
      { name: "Kit de frenos", price: "149 €" },
    ],
    testimonial: { text: "Me mandaron el presupuesto por WhatsApp y el coche estuvo en el día.", author: "Luis P." },
    suggested: { type: "corporativa", modules: ["seo", "resenas", "reservas"] },
  },
  {
    id: "reformas",
    name: "Reformas",
    sampleName: "Reformas Duero",
    headlines: ["Reformamos tu casa sin dolores de cabeza", "Del primer boceto a la última baldosa", "Reformas integrales con precio cerrado"],
    subheadline: "Visita gratuita, presupuesto desglosado en 48 horas y un responsable de obra para todo.",
    cta: "Pedir visita gratis",
    services: [
      { title: "Cocinas", text: "Diseño y montaje con materiales de primera." },
      { title: "Baños", text: "Plato de ducha, alicatado y fontanería." },
      { title: "Integrales", text: "Llave en mano y con plazos por contrato." },
    ],
    products: [
      { name: "Reforma de baño", price: "desde 4.900 €" },
      { name: "Cocina completa", price: "desde 7.500 €" },
      { name: "Pintura de piso", price: "desde 1.200 €" },
    ],
    testimonial: { text: "Cumplieron el plazo y el precio. La galería de su web nos convenció.", author: "Elena y Sergio" },
    suggested: { type: "corporativa", modules: ["seo", "galeria", "resenas"] },
  },
  {
    id: "moda",
    name: "Tienda de moda",
    sampleName: "Alma Studio",
    headlines: ["Nueva colección, ya disponible", "Moda que se siente tuya", "Envío gratis a partir de 50 €"],
    subheadline: "Prendas de diseño local, cambios fáciles y entrega en 24-48 horas en toda España.",
    cta: "Ver colección",
    services: [
      { title: "Envío 24-48 h", text: "Gratis desde 50 € de compra." },
      { title: "Cambios fáciles", text: "30 días para cambiar sin preguntas." },
      { title: "Pago seguro", text: "Tarjeta, Bizum y pago a plazos." },
    ],
    products: [
      { name: "Vestido Lino", price: "69 €" },
      { name: "Camisa Oxford", price: "45 €" },
      { name: "Bolso Nube", price: "59 €" },
    ],
    testimonial: { text: "Compré un domingo por la noche y el martes lo tenía en casa.", author: "Lucía M." },
    suggested: { type: "tienda", modules: ["seo", "resenas", "smartai"] },
  },
  {
    id: "asesoria",
    name: "Asesoría",
    sampleName: "Asesoría Norte",
    headlines: ["Tus impuestos, en orden y a tiempo", "Asesoría fiscal y laboral sin letra pequeña", "Más tiempo para tu negocio, menos papeleo"],
    subheadline: "Autónomos y pymes. Te avisamos de cada plazo y respondemos en menos de 24 horas.",
    cta: "Solicitar consulta",
    services: [
      { title: "Fiscal", text: "Declaraciones trimestrales y renta." },
      { title: "Laboral", text: "Nóminas, contratos y seguros sociales." },
      { title: "Contable", text: "Contabilidad al día y cuentas anuales." },
    ],
    products: [
      { name: "Plan autónomo", price: "49 €/mes" },
      { name: "Plan pyme", price: "120 €/mes" },
      { name: "Declaración de la renta", price: "60 €" },
    ],
    testimonial: { text: "Desde que trabajo con ellos no se me ha pasado ni un plazo.", author: "Andrés T." },
    suggested: { type: "corporativa", modules: ["seo", "blog", "smartdesk"] },
  },
  {
    id: "gimnasio",
    name: "Gimnasio",
    sampleName: "Pulso Fitness",
    headlines: ["Entrena con un plan hecho para ti", "Tu primera clase, gratis", "Más fuerte cada semana"],
    subheadline: "Clases dirigidas, entrenador personal y app de reservas. Sin matrícula este mes.",
    cta: "Probar gratis",
    services: [
      { title: "Clases dirigidas", text: "Más de 40 clases a la semana." },
      { title: "Entrenamiento personal", text: "Un plan con objetivos medibles." },
      { title: "Nutrición", text: "Seguimiento con nutricionista." },
    ],
    products: [
      { name: "Cuota mensual", price: "39 €" },
      { name: "Bono 10 clases", price: "60 €" },
      { name: "Entrenador personal", price: "30 €/sesión" },
    ],
    testimonial: { text: "Reservo las clases desde la web y nunca me quedo sin sitio.", author: "Paula D." },
    suggested: { type: "reservas", modules: ["seo", "pagos", "resenas"] },
  },
  {
    id: "belleza",
    name: "Peluquería y estética",
    sampleName: "Estudio Nácar",
    headlines: ["Tu mejor versión empieza aquí", "Reserva tu cita en 30 segundos", "Belleza con mimo y sin esperas"],
    subheadline: "Peluquería, color y tratamientos faciales con productos profesionales. Elige día, hora y estilista.",
    cta: "Reservar cita",
    services: [
      { title: "Corte y peinado", text: "Asesoramiento de estilo incluido." },
      { title: "Color y mechas", text: "Técnicas actuales y productos sin amoniaco." },
      { title: "Estética facial", text: "Limpiezas y tratamientos a medida." },
    ],
    products: [
      { name: "Corte y peinado", price: "28 €" },
      { name: "Mechas balayage", price: "85 €" },
      { name: "Limpieza facial", price: "45 €" },
    ],
    testimonial: { text: "Me encanta poder elegir estilista y hora desde el móvil.", author: "Carmen L." },
    suggested: { type: "reservas", modules: ["resenas", "galeria", "seo"] },
  },
];

export type WebConfig = {
  businessName: string;
  sector: SectorId;
  type: ProjectTypeId;
  pages: number;
  modules: ModuleId[];
  extras: ExtraId[];
  palette: PaletteId;
  style: StyleId;
  speed: SpeedId;
  maintenance: MaintenanceId;
  /** Which of the sector's headlines the preview shows. */
  headline: number;
};

export const BUSINESS_NAME_MAX = 40;

export function getProjectType(id: ProjectTypeId): ProjectType {
  return projectTypes.find((type) => type.id === id)!;
}

export function getSector(id: SectorId): SectorContent {
  return sectors.find((sector) => sector.id === id)!;
}

export function getPalette(id: PaletteId): Palette {
  return palettes.find((palette) => palette.id === id)!;
}

/** Starting configuration for a sector: its suggested type and modules. */
export function configForSector(sectorId: SectorId, base?: Partial<WebConfig>): WebConfig {
  const sector = getSector(sectorId);
  const type = getProjectType(sector.suggested.type);
  return {
    businessName: base?.businessName ?? "",
    sector: sectorId,
    type: type.id,
    pages: type.pagesIncluded,
    modules: MODULE_IDS.filter((id) => sector.suggested.modules.includes(id) && !type.includes.includes(id)),
    extras: base?.extras ?? ["textos"],
    palette: base?.palette ?? "esmeralda",
    style: base?.style ?? "moderno",
    speed: base?.speed ?? "estandar",
    maintenance: base?.maintenance ?? "esencial",
    headline: 0,
  };
}

export const defaultConfig: WebConfig = configForSector("restaurante");

/** Pages are clamped to what the project type allows. */
export function clampPages(type: ProjectTypeId, pages: number): number {
  const projectType = getProjectType(type);
  if (projectType.fixedPages) return projectType.pagesIncluded;
  const whole = Number.isFinite(pages) ? Math.round(pages) : projectType.pagesIncluded;
  return Math.min(MAX_PAGES, Math.max(3, whole));
}

/** Modules the website will have: the selected ones plus those included in the type. */
export function activeModules(config: Pick<WebConfig, "type" | "modules">): Set<ModuleId> {
  return new Set<ModuleId>([...getProjectType(config.type).includes, ...config.modules]);
}

const pick = <T extends string>(allowed: readonly T[], value: unknown, fallback: T): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

const pickList = <T extends string>(allowed: readonly T[], value: unknown, fallback: T[]): T[] =>
  Array.isArray(value) ? allowed.filter((id) => value.includes(id)) : fallback;

/**
 * A valid configuration from untrusted data (e.g. what a previous visit saved
 * in the browser). Unknown values fall back to the defaults.
 */
export function normalizeConfig(raw: unknown): WebConfig {
  const value = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const type = pick(PROJECT_TYPE_IDS, value.type, defaultConfig.type);
  const headline = Number(value.headline);
  return {
    businessName: typeof value.businessName === "string" ? value.businessName.slice(0, BUSINESS_NAME_MAX) : "",
    sector: pick(SECTOR_IDS, value.sector, defaultConfig.sector),
    type,
    pages: clampPages(type, Number(value.pages)),
    modules: pickList(MODULE_IDS, value.modules, defaultConfig.modules),
    extras: pickList(EXTRA_IDS, value.extras, defaultConfig.extras),
    palette: pick(PALETTE_IDS, value.palette, defaultConfig.palette),
    style: pick(STYLE_IDS, value.style, defaultConfig.style),
    speed: pick(SPEED_IDS, value.speed, defaultConfig.speed),
    maintenance: pick(MAINTENANCE_IDS, value.maintenance, defaultConfig.maintenance),
    headline: Number.isInteger(headline) && headline >= 0 && headline < 3 ? headline : 0,
  };
}

export type QuoteLine = { label: string; amount: number; note?: string };

export type Quote = {
  lines: QuoteLine[];
  /** Project price, VAT excluded. */
  subtotal: number;
  vat: number;
  total: number;
  /** Paid to start (VAT included). */
  deposit: number;
  monthly: number;
  weeks: number;
};

/** Itemised quote for a configuration. All amounts are whole euros. */
export function calculateQuote(config: WebConfig): Quote {
  const type = getProjectType(config.type);
  const included = new Set(type.includes);
  const lines: QuoteLine[] = [{ label: type.name, amount: type.price, note: describeIncludedPages(type) }];
  let weeks = type.weeks;

  const extraPages = clampPages(config.type, config.pages) - type.pagesIncluded;
  if (extraPages > 0) {
    lines.push({ label: `${extraPages} ${extraPages === 1 ? "página extra" : "páginas extra"}`, amount: extraPages * EXTRA_PAGE_PRICE });
    weeks += extraPages * 0.25;
  }

  for (const webModule of webModules) {
    if (!config.modules.includes(webModule.id) || included.has(webModule.id)) continue;
    lines.push({ label: webModule.name, amount: webModule.price });
    weeks += webModule.weeks;
  }

  for (const extra of extras) {
    if (config.extras.includes(extra.id)) lines.push({ label: extra.name, amount: extra.price });
  }

  let subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  weeks = Math.ceil(weeks);
  if (config.speed === "express") {
    const surcharge = Math.round(subtotal * EXPRESS_SURCHARGE);
    lines.push({ label: "Entrega exprés", amount: surcharge, note: "Prioridad en el calendario" });
    subtotal += surcharge;
    weeks = Math.max(1, Math.ceil(weeks * 0.7));
  }

  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;
  const monthly = maintenancePlans.find((plan) => plan.id === config.maintenance)!.monthly;
  return { lines, subtotal, vat, total, deposit: Math.round(total * DEPOSIT_RATE), monthly, weeks };
}

function describeIncludedPages(type: ProjectType): string {
  return type.pagesIncluded === 1 ? "1 página" : `Hasta ${type.pagesIncluded} páginas`;
}

const BASE_SCORE: Record<ProjectTypeId, number> = { landing: 20, corporativa: 26, reservas: 30, tienda: 30 };

export type ScoreTip = { id: ModuleId; name: string; points: number };

/**
 * SmartWeb index (0-100): how many of the levers that bring in most
 * customers the website includes. Orientative, shown as such in the UI.
 * `tips` are the three missing modules that would add the most (shop and
 * bookings define the type of website, so they are not suggested as tips).
 */
export function webScore(config: WebConfig): { score: number; tips: ScoreTip[] } {
  const modules = activeModules(config);
  let score = BASE_SCORE[config.type];
  for (const webModule of webModules) if (modules.has(webModule.id)) score += webModule.impact;
  for (const extra of extras) if (config.extras.includes(extra.id)) score += extra.impact;
  score += maintenancePlans.find((plan) => plan.id === config.maintenance)!.impact;
  const tips = webModules
    .filter((webModule) => !modules.has(webModule.id) && webModule.id !== "tienda" && webModule.id !== "reservas")
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
    .map((webModule) => ({ id: webModule.id, name: webModule.name, points: webModule.impact }));
  return { score: Math.min(100, score), tips };
}

const euroFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  useGrouping: "always",
});

/** "1.290 €" (whole euros, grouping also for four digits). */
export function formatEuros(amount: number): string {
  return euroFormatter.format(amount);
}

/** Lowest price of a project type, for "desde" labels. */
export function startingPrice(type: ProjectTypeId): number {
  return getProjectType(type).price;
}

/** Plain-text proposal sent by WhatsApp or copied by the visitor. */
export function buildProposalMessage(config: WebConfig): string {
  const quote = calculateQuote(config);
  const type = getProjectType(config.type);
  const sector = getSector(config.sector);
  const modules = webModules.filter((webModule) => activeModules(config).has(webModule.id)).map((webModule) => webModule.name);
  const chosenExtras = extras.filter((extra) => config.extras.includes(extra.id)).map((extra) => extra.name);
  const plan = maintenancePlans.find((p) => p.id === config.maintenance)!;
  const name = config.businessName.trim();
  const pages = clampPages(config.type, config.pages);

  const lines = [
    `Hola, he configurado mi web en SmartWeb Studio${name ? ` para ${name}` : ""}.`,
    "",
    `Tipo: ${type.name} (${pages} ${pages === 1 ? "página" : "páginas"})`,
    `Sector: ${sector.name}`,
    `Estilo: ${siteStyles.find((s) => s.id === config.style)!.name}, colores ${getPalette(config.palette).name}`,
    `Funciones: ${modules.length ? modules.join(", ") : "las básicas"}`,
  ];
  if (chosenExtras.length) lines.push(`Extras: ${chosenExtras.join(", ")}`);
  lines.push(
    `Mantenimiento: ${plan.name}${plan.monthly ? ` (${formatEuros(plan.monthly)}/mes)` : ""}`,
    `Entrega: ${config.speed === "express" ? "exprés, " : ""}unas ${quote.weeks} ${quote.weeks === 1 ? "semana" : "semanas"}`,
    "",
    `Presupuesto orientativo: ${formatEuros(quote.subtotal)} + IVA (${formatEuros(quote.total)} con IVA)`,
    "",
    "¿Me preparáis la propuesta de diseño?",
  );
  return lines.join("\n");
}
