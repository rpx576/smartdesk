/**
 * Content of the "Soluciones" page: the three SmartHub services and the
 * business problems ("retos") a visitor can pick to get a recommendation.
 * Plain data (no JSX, no icons) so it can be shared by server and client
 * components and tested on its own.
 */
export type SolutionId = "smartdesk" | "smartai" | "smartweb";

export type Solution = {
  id: SolutionId;
  name: string;
  tagline: string;
  summary: string;
  audience: string;
  /** Before / after: what changes for the customer. */
  before: string;
  after: string;
  features: { title: string; text: string }[];
  /** How the customer gets it: a ready-made tool, or a project built with them. */
  availability: string;
  cta: { label: string; href: string };
};

export const solutions: Solution[] = [
  {
    id: "smartdesk",
    name: "SmartDesk",
    tagline: "Tu empresa, ordenada en un solo lugar",
    summary:
      "La herramienta de gestión de SmartHub. Clientes, proyectos, tareas y calendario conectados entre sí, para que todo el equipo sepa qué hay que hacer, para quién y para cuándo.",
    audience: "Pymes, autónomos y equipos que hoy se organizan con hojas de cálculo, notas y correos.",
    before: "Datos de clientes repartidos, tareas en la cabeza de cada uno y plazos que se escapan.",
    after: "Cada cliente con sus proyectos, cada proyecto con sus tareas y todo en un calendario compartido.",
    features: [
      { title: "Clientes", text: "Ficha de cada cliente con su contacto y todo lo que habéis hecho juntos." },
      { title: "Proyectos", text: "Estado, presupuesto, fechas y progreso calculado a partir de sus tareas." },
      { title: "Tareas", text: "Prioridad, responsable y fecha límite, con filtros para ver lo urgente." },
      { title: "Calendario", text: "Eventos y fechas de entrega en vista de mes, semana o agenda." },
      { title: "Dashboard", text: "Un resumen al entrar: actividad reciente, próximos eventos y cartera." },
      { title: "Equipo y permisos", text: "Varias organizaciones y roles para decidir quién ve y edita qué." },
    ],
    availability: "Disponible ya. Entra con tu cuenta de SmartHub y crea tu organización en un minuto.",
    cta: { label: "Probar SmartDesk", href: "/smartdesk" },
  },
  {
    id: "smartai",
    name: "SmartAI",
    tagline: "La inteligencia artificial trabajando para ti",
    summary:
      "Asistentes de IA que redactan presupuestos, contestan a tus clientes, resumen reuniones en tareas y crean contenido para redes. Pruébalo gratis en SmartAI Studio y, cuando quieras, lo adaptamos a tu negocio.",
    audience: "Empresas que pierden horas en trabajo manual: presupuestos, respuestas, informes o copiar datos.",
    before: "Horas cada semana copiando datos, redactando lo mismo y respondiendo las mismas preguntas.",
    after: "Procesos que se hacen solos y un asistente que prepara documentos y resúmenes en segundos.",
    features: [
      { title: "Asistentes a medida", text: "Un asistente que conoce tu negocio y responde como lo harías tú." },
      { title: "Documentos automáticos", text: "Presupuestos, informes y correos generados a partir de tus datos." },
      { title: "Análisis de datos", text: "Preguntas en lenguaje normal y respuestas claras sobre tus números." },
      { title: "Automatización", text: "Flujos que conectan formularios, correo, hojas de cálculo y más." },
      { title: "Integraciones", text: "Trabaja con las herramientas que ya tienes, sin cambiar de sistema." },
      { title: "Privacidad", text: "Tus datos se usan solo para tu proyecto y bajo tu control." },
    ],
    availability: "Pruébalo ya gratis en SmartAI Studio, sin registro. Para tu empresa, lo configuramos con tus precios, tu tono y tus herramientas.",
    cta: { label: "Probar SmartAI gratis", href: "/smartai" },
  },
  {
    id: "smartweb",
    name: "SmartWeb",
    tagline: "Una web que trabaja para tu negocio",
    summary:
      "Diseñamos y desarrollamos páginas web modernas, rápidas y pensadas para convertir visitas en clientes: desde una landing hasta una tienda online.",
    audience: "Negocios sin web, con una web antigua o que quieren empezar a vender por internet.",
    before: "Una web lenta, que no se ve bien en el móvil y que no trae clientes.",
    after: "Una web rápida, bonita en cualquier pantalla y preparada para que te encuentren y te escriban.",
    features: [
      { title: "Webs corporativas", text: "Tu empresa presentada con claridad y una imagen profesional." },
      { title: "Tiendas online", text: "Catálogo, carrito y pagos para vender a cualquier hora." },
      { title: "Landing pages", text: "Páginas de campaña enfocadas en una sola acción: que te contacten." },
      { title: "Aplicaciones web", text: "Herramientas a medida para tu equipo o tus clientes." },
      { title: "SEO y velocidad", text: "Bien construida para cargar rápido y aparecer en buscadores." },
      { title: "Mantenimiento", text: "Actualizaciones, cambios y soporte cuando lo necesites." },
    ],
    availability: "Diséñala ya en SmartWeb Studio: ves cómo queda y cuánto cuesta al momento. Propuesta de diseño en 72 horas.",
    cta: { label: "Diseñar mi web", href: "/smartweb" },
  },
];

export type Need = { id: string; label: string; weights: Partial<Record<SolutionId, number>> };

/** Problems the visitor can recognise; each one points to the service(s) that solve it. */
export const needs: Need[] = [
  { id: "clientes", label: "Tengo clientes y proyectos repartidos en hojas y correos", weights: { smartdesk: 3 } },
  { id: "plazos", label: "Se me escapan tareas y plazos", weights: { smartdesk: 3 } },
  { id: "agenda", label: "La agenda del equipo no cuadra", weights: { smartdesk: 2 } },
  { id: "repetitivo", label: "Pierdo horas en tareas repetitivas", weights: { smartai: 3 } },
  { id: "documentos", label: "Redactar presupuestos y documentos me lleva demasiado", weights: { smartai: 3 } },
  { id: "datos", label: "Tengo datos, pero no sé qué me dicen", weights: { smartai: 2, smartdesk: 1 } },
  { id: "sin-web", label: "No tengo web o se ha quedado antigua", weights: { smartweb: 3 } },
  { id: "vender", label: "Quiero vender por internet", weights: { smartweb: 3 } },
  { id: "captar", label: "Necesito conseguir más clientes", weights: { smartweb: 2, smartai: 1 } },
];

export type Recommendation = { id: SolutionId; score: number };

/**
 * Services that solve the selected needs, best match first. Unknown ids are
 * ignored; ties keep the order of `solutions`.
 */
export function recommendSolutions(selectedNeedIds: readonly string[]): Recommendation[] {
  const scores = new Map<SolutionId, number>();
  for (const need of needs) {
    if (!selectedNeedIds.includes(need.id)) continue;
    for (const [id, weight] of Object.entries(need.weights) as [SolutionId, number][]) {
      scores.set(id, (scores.get(id) ?? 0) + weight);
    }
  }
  return solutions
    .map((solution) => ({ id: solution.id, score: scores.get(solution.id) ?? 0 }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}
