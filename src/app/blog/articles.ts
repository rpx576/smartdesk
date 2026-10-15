/**
 * Blog content: real news summarised by SmartHub, each with links to its
 * original sources. Dates are publication days (YYYY-MM-DD, read as UTC).
 * Keep summaries factual and say when something is announced but not approved.
 */
export type CategoryId = "facturacion" | "ia" | "web" | "seguridad" | "datos";

export type Category = { id: CategoryId; label: string; product: string; blurb: string };

export const CATEGORIES: Category[] = [
  { id: "facturacion", label: "Facturación y normativa", product: "SmartDesk", blurb: "Verifactu, factura electrónica y obligaciones" },
  { id: "ia", label: "IA para empresas", product: "SmartAI", blurb: "Agentes, automatización y regulación de la IA" },
  { id: "web", label: "Web y buscadores", product: "SmartWeb", blurb: "Accesibilidad, SEO y presencia online" },
  { id: "seguridad", label: "Ciberseguridad", product: "Todas", blurb: "Fraudes, ataques y cómo protegerse" },
  { id: "datos", label: "Datos y tendencias", product: "Todas", blurb: "Cifras sobre la digitalización de las empresas" },
];

export type Source = { name: string; url: string };

/** Cover photo from Unsplash (free licence): its photo id, description and author. */
export type CoverImage = { id: string; alt: string; author: string };

export type Article = {
  id: string;
  category: CategoryId;
  date: string;
  title: string;
  summary: string;
  /** What it means for a small business, in one or two sentences. */
  takeaway: string;
  sources: Source[];
  tags: string[];
  readMinutes: number;
  image: CoverImage;
};

export const ARTICLES: Article[] = [
  {
    id: "factura-electronica-fechas",
    image: { id: "photo-1554224154-26032ffc0d07", alt: "Móvil, bolígrafo y documentos fiscales sobre una carpeta", author: "Kelly Sikkema" },
    category: "facturacion",
    date: "2026-10-07",
    title: "Ya hay fechas para la factura electrónica obligatoria entre empresas",
    summary:
      "La Orden HAC/1028/2026, publicada en el BOE el 5 de octubre, regula la Solución Pública de Facturación Electrónica y pone en marcha la cuenta atrás: las empresas con más de 8 millones de euros de volumen de operaciones tendrán que emitir facturas electrónicas desde el 6 de octubre de 2027, y el resto de empresas y profesionales desde el 6 de octubre de 2028.",
    takeaway:
      "Si facturas a otras empresas, tu programa de facturación tendrá que emitir y recibir facturas electrónicas. Conviene elegir ya una herramienta preparada en lugar de cambiar con prisas.",
    sources: [
      { name: "Agencia Tributaria", url: "https://sede.agenciatributaria.gob.es/Sede/en_gb/todas-noticias/2026/octubre/7/solucion-publica-facturacion-electronica.html" },
      { name: "BOE · Orden HAC/1028/2026", url: "https://www.boe.es/boe/dias/2026/10/05/pdfs/BOE-A-2026-20587.pdf" },
      { name: "Garrigues", url: "https://www.garrigues.com/es_ES/noticia/comienza-computo-plazos-aplicacion-factura-electronica-obligatoria-empresarios" },
    ],
    tags: ["factura electrónica", "B2B", "AEAT", "pymes", "autónomos"],
    readMinutes: 4,
  },
  {
    id: "verifactu-2028",
    image: { id: "photo-1634733988138-bf2c3a2a13fa", alt: "Terminal de pago con un tique largo sobre fondo naranja", author: "Towfiqu barbhuiya" },
    category: "facturacion",
    date: "2026-10-07",
    title: "Hacienda anuncia otro aplazamiento de Verifactu, ahora hasta octubre de 2028",
    summary:
      "Hacienda quiere que Verifactu arranque a la vez que la factura electrónica obligatoria y ha anunciado su aplazamiento hasta octubre de 2028 para autónomos y pymes que facturan menos de 8 millones. El cambio todavía no está aprobado: hasta que se publique, las fechas oficiales siguen siendo el 1 de enero de 2027 para sociedades y el 1 de julio de 2027 para el resto.",
    takeaway:
      "No es momento de olvidarse: mientras no se apruebe el cambio, el calendario vigente es el de 2027. Un software que ya cumpla Verifactu te quita el problema sea cual sea la fecha final.",
    sources: [
      { name: "Infoautónomos", url: "https://www.infoautonomos.com/blog/retraso-verifactu/" },
      { name: "Emprendedores", url: "https://emprendedores.es/gestion/aplazamiento-verifactu-2028/" },
      { name: "CMS Albiñana & Suárez de Lezo", url: "https://cms.law/en/esp/publication/factura-electronica-b2b-arranca-la-cuenta-atras-y-veri-factu-se-aplaza-a-2028" },
    ],
    tags: ["Verifactu", "AEAT", "autónomos", "pymes", "plazos"],
    readMinutes: 3,
  },
  {
    id: "reglamento-factura-electronica",
    image: { id: "photo-1450101499163-c8848c66ca85", alt: "Persona firmando un documento", author: "Scott Graham" },
    category: "facturacion",
    date: "2026-03-31",
    title: "Aprobado el reglamento de la factura electrónica obligatoria en operaciones B2B",
    summary:
      "El Real Decreto 238/2026, de 25 de marzo, publicado en el BOE el 31 de marzo, desarrolla la obligación de la Ley Crea y Crece de facturar electrónicamente entre empresarios y profesionales. Fija un calendario escalonado (12 meses para quien supera 8 millones de facturación y 24 meses para el resto) que empezó a contar con la orden ministerial de octubre.",
    takeaway:
      "Es la norma que da forma a la obligación: formatos, intercambio y estados de las facturas. Las fechas concretas llegaron después con la Orden HAC/1028/2026.",
    sources: [{ name: "Cuatrecasas", url: "https://www.cuatrecasas.com/es/spain/fiscalidad/art/reglamento-facturacion-electronica-obligatorio-operaciones" }],
    tags: ["factura electrónica", "B2B", "Ley Crea y Crece", "reglamento"],
    readMinutes: 3,
  },
  {
    id: "verifactu-2027",
    image: { id: "photo-1435527173128-983b87201f4d", alt: "Agenda mensual abierta sobre una mesa de madera", author: "Eric Rothermel" },
    category: "facturacion",
    date: "2025-12-03",
    title: "Verifactu se retrasó a 2027 con el Real Decreto-ley 15/2025",
    summary:
      "El Real Decreto-ley 15/2025, publicado en el BOE el 3 de diciembre de 2025, movió la obligación de usar sistemas de facturación Verifactu al 1 de enero de 2027 para las sociedades y al 1 de julio de 2027 para autónomos y profesionales. Es el calendario que sigue en vigor mientras no se apruebe el nuevo aplazamiento.",
    takeaway:
      "Es la referencia legal actual. Cualquier nueva fecha tendrá que aprobarse con otra norma.",
    sources: [
      { name: "Legal Today", url: "https://www.legaltoday.com/actualidad-juridica/noticias-de-derecho/hacienda-aplaza-un-ano-hasta-2027-la-entrada-en-vigor-del-sistema-de-facturacion-digital-verifactu-2025-12-02/" },
      { name: "Infoautónomos", url: "https://www.infoautonomos.com/blog/verifactu-cuando-es-obligatorio-a-quien-afecta/" },
    ],
    tags: ["Verifactu", "plazos", "sociedades", "autónomos"],
    readMinutes: 2,
  },
  {
    id: "ai-act-omnibus",
    image: { id: "photo-1594810205183-18a8b0ce6c13", alt: "Fila de banderas de la Unión Europea", author: "Guillaume Périgois" },
    category: "ia",
    date: "2026-07-27",
    title: "Entra en vigor el «Ómnibus Digital»: la UE da más tiempo a la IA de alto riesgo",
    summary:
      "El Reglamento (UE) 2026/1744 modifica la Ley de IA europea. Las obligaciones de transparencia siguen aplicándose desde el 2 de agosto de 2026, el marcado de contenido generado por IA en sistemas ya en el mercado pasa al 2 de diciembre de 2026, los sistemas de alto riesgo del anexo III al 2 de diciembre de 2027 y los integrados en productos regulados al 2 de agosto de 2028.",
    takeaway:
      "Si tu empresa usa chatbots o genera contenido con IA, la transparencia ya es obligatoria: hay que avisar a las personas de que hablan con una IA.",
    sources: [
      { name: "Hunton Andrews Kurth", url: "https://www.hunton.com/privacy-and-cybersecurity-law-blog/eu-digital-omnibus-on-ai-enters-into-force" },
      { name: "White & Case", url: "https://www.whitecase.com/insight-alert/eu-agrees-digital-omnibus-deal-simplify-ai-rules" },
    ],
    tags: ["AI Act", "regulación", "UE", "transparencia", "chatbots"],
    readMinutes: 4,
  },
  {
    id: "meta-business-agent",
    image: { id: "photo-1614680376408-81e91ffe3db7", alt: "Icono verde de chat con un teléfono sobre fondo oscuro", author: "Alexander Shatov" },
    category: "ia",
    date: "2026-06-03",
    title: "Meta lanza un agente de IA para atender a clientes por WhatsApp e Instagram",
    summary:
      "En su evento Conversations de Londres, Meta presentó Business Agent, un asistente que responde preguntas, recomienda productos, reserva citas, cualifica contactos y cierra ventas en WhatsApp, Messenger e Instagram. La empresa decide cuándo pasa la conversación a una persona. Se está desplegando para negocios de cualquier tamaño, gratis al empezar y con planes de pago anunciados.",
    takeaway:
      "WhatsApp ya es el canal donde muchos clientes preguntan. Automatizar las respuestas frecuentes libera tiempo, siempre con un traspaso claro a una persona.",
    sources: [{ name: "PPC Land", url: "https://ppc.land/meta-business-agent-brings-ai-customer-service-to-whatsapp-globally/" }],
    tags: ["WhatsApp", "atención al cliente", "agentes", "automatización"],
    readMinutes: 3,
  },
  {
    id: "gartner-agentes-apps",
    image: { id: "photo-1697577418970-95d99b5a55cf", alt: "Chip de ordenador con las letras AI", author: "Igor Omilaev" },
    category: "ia",
    date: "2025-08-26",
    title: "Gartner prevé que el 40 % de las aplicaciones empresariales tengan agentes de IA en 2026",
    summary:
      "La consultora estimó que el 40 % de las aplicaciones empresariales incluirán agentes de IA especializados en tareas concretas a finales de 2026, frente a menos del 5 % en 2025. Los asistentes integrados en el software de gestión pasan a ser algo esperado.",
    takeaway:
      "La IA más útil no es un chat aparte: es la que trabaja dentro de tus herramientas, sobre tus clientes, tareas y calendario.",
    sources: [{ name: "Gartner", url: "https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025" }],
    tags: ["agentes", "software de gestión", "tendencias"],
    readMinutes: 2,
  },
  {
    id: "gartner-agentes-cancelados",
    image: { id: "photo-1528819622765-d6bcf132f793", alt: "Piezas de ajedrez sobre el tablero", author: "Felix Mittermeier" },
    category: "ia",
    date: "2025-06-25",
    title: "Más del 40 % de los proyectos de IA agéntica se cancelarán antes de 2028, según Gartner",
    summary:
      "Gartner advirtió de que muchos proyectos de agentes de IA se abandonarán a finales de 2027 por costes crecientes, valor de negocio poco claro o controles de riesgo insuficientes, y alertó del «agent washing»: productos que se venden como agentes sin serlo.",
    takeaway:
      "Antes de invertir en IA, define qué proceso concreto quieres mejorar y cómo vas a medirlo. Empezar pequeño y con un objetivo claro reduce el riesgo.",
    sources: [{ name: "Gartner", url: "https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027" }],
    tags: ["agentes", "inversión", "riesgos", "tendencias"],
    readMinutes: 2,
  },
  {
    id: "incibe-balance-2025",
    image: { id: "photo-1614064641938-3bbee52942c7", alt: "Candado rojo sobre un teclado negro", author: "FlyD" },
    category: "seguridad",
    date: "2026-02-09",
    title: "INCIBE gestionó 122.223 incidentes de ciberseguridad en 2025, un 26 % más",
    summary:
      "El malware fue el incidente más frecuente (55.411 casos, 392 de ellos ransomware), seguido del fraude online con 45.445 casos, de los que 25.133 fueron phishing. La Línea de Ayuda en Ciberseguridad 017 atendió 142.767 consultas, un 44,9 % más que el año anterior.",
    takeaway:
      "El fraude por correo y mensajería sigue creciendo. Contraseñas robustas, doble factor y desconfiar de los enlaces urgentes evitan la mayoría de sustos. Ante una duda, el 017 es gratuito.",
    sources: [{ name: "INCIBE", url: "https://www.incibe.es/incibe/sala-de-prensa/incibe-detecto-mas-de-122000-incidentes-de-ciberseguridad-en-2025" }],
    tags: ["phishing", "ransomware", "017", "INCIBE"],
    readMinutes: 3,
  },
  {
    id: "eurostat-ia-2025",
    image: { id: "photo-1551288049-bebda4e38f71", alt: "Gráficas de analítica en la pantalla de un portátil", author: "Luke Chesser" },
    category: "datos",
    date: "2025-12-12",
    title: "Una de cada cinco empresas europeas ya usa inteligencia artificial",
    summary:
      "Según Eurostat, el 20 % de las empresas de la UE con 10 o más empleados usó tecnologías de IA en 2025, frente al 13,5 % de 2024. Dinamarca (42 %), Finlandia (37,8 %) y Suecia (35 %) encabezan la adopción.",
    takeaway:
      "La IA está pasando de experimento a herramienta habitual. La diferencia la marcan los usos prácticos: redactar, clasificar, resumir y responder.",
    sources: [
      { name: "Eurostat", url: "https://ec.europa.eu/eurostat/statistics-explained/index.php/Use_of_artificial_intelligence_in_enterprises" },
      { name: "Cyprus Mail", url: "https://cyprus-mail.com/2025/12/12/cyprus-firms-slow-to-adopt-ai-despite-steady-improvement" },
    ],
    tags: ["Eurostat", "adopción", "UE", "estadísticas"],
    readMinutes: 2,
  },
  {
    id: "ine-tic-2025",
    image: { id: "photo-1531058240690-006c446962d8", alt: "Mujer en su pequeño negocio junto al mostrador", author: "Ellicia" },
    category: "datos",
    date: "2025-10-22",
    title: "El 21,1 % de las empresas españolas de 10 o más empleados ya usa IA",
    summary:
      "La encuesta del INE sobre uso de TIC muestra que en el primer trimestre de 2025 usaban IA el 21,1 % de las empresas de 10 o más empleados y el 13,4 % de las de menos de 10. Solo el 37 % de las microempresas con internet tiene página web, frente al 84,5 % de las de 10 o más empleados.",
    takeaway:
      "Seis de cada diez microempresas siguen sin web propia: tener una página rápida y clara todavía te diferencia de la competencia.",
    sources: [{ name: "INE", url: "https://www.ine.es/dyngs/Prensa/ETICCE20241T2025.htm" }],
    tags: ["INE", "microempresas", "página web", "estadísticas"],
    readMinutes: 2,
  },
  {
    id: "google-ai-mode-espana",
    image: { id: "photo-1594663653925-365bcbf7ef86", alt: "Mano sujetando un móvil con el buscador de Google", author: "Solen Feyissa" },
    category: "web",
    date: "2025-10-08",
    title: "El Modo IA de Google llega a España y cambia cómo te encuentran los clientes",
    summary:
      "Google anunció el despliegue de AI Mode en 50 países nuevos, España incluida, y en 36 idiomas. A diferencia de los resúmenes de IA, es una búsqueda conversacional que el usuario activa desde el menú. Los datos citados por el sector apuntan a que más del 90 % de sus sesiones no generan clics hacia otras webs.",
    takeaway:
      "Aparecer en las respuestas de la IA pide contenido claro, datos estructurados y una web técnicamente sólida. El SEO de siempre sigue contando, pero ya no basta.",
    sources: [{ name: "Human Level", url: "https://www.humanlevel.com/en/blog/seo/ai-mode-arrives-in-spain-the-new-face-of-google-search" }],
    tags: ["Google", "SEO", "AI Mode", "buscadores"],
    readMinutes: 3,
  },
  {
    id: "ley-accesibilidad",
    image: { id: "photo-1559028012-481c04fa702d", alt: "Monitor mostrando el diseño de una interfaz web", author: "Eftakher Alam" },
    category: "web",
    date: "2025-06-28",
    title: "La accesibilidad web ya es obligatoria para tiendas online y servicios digitales",
    summary:
      "Desde el 28 de junio de 2025 se aplica la Ley Europea de Accesibilidad, transpuesta en España por la Ley 11/2023. Afecta al comercio electrónico y a muchos servicios digitales; la única excepción son las microempresas de menos de 10 empleados y menos de 2 millones de euros de facturación. El incumplimiento puede acarrear multas o la retirada del servicio.",
    takeaway:
      "Contraste suficiente, textos alternativos, navegación con teclado y formularios bien etiquetados: una web accesible además vende más y posiciona mejor.",
    sources: [
      { name: "Legálitas", url: "https://www.legalitas.com/actualidad/european-accessibility-act" },
      { name: "Xataka Móvil", url: "https://www.xatakamovil.com/movil-y-sociedad/ley-europea-accesibilidad-va-a-afectar-a-casi-todas-tiendas-online-estos-cambios-que-traera" },
    ],
    tags: ["accesibilidad", "tiendas online", "Ley 11/2023", "EAA"],
    readMinutes: 3,
  },
];

export type KeyDate = { date: string; title: string; detail: string; category: CategoryId; tentative?: boolean };

/** Upcoming deadlines mentioned in the news above. */
export const KEY_DATES: KeyDate[] = [
  { date: "2026-12-02", title: "Marcado de contenido IA", detail: "Sistemas ya en el mercado (Ómnibus Digital)", category: "ia" },
  { date: "2027-01-01", title: "Verifactu · sociedades", detail: "Fecha vigente; Hacienda ha anunciado aplazarla", category: "facturacion", tentative: true },
  { date: "2027-07-01", title: "Verifactu · autónomos", detail: "Fecha vigente; Hacienda ha anunciado aplazarla", category: "facturacion", tentative: true },
  { date: "2027-10-06", title: "Factura electrónica B2B", detail: "Empresas de más de 8 M€ de facturación", category: "facturacion" },
  { date: "2027-12-02", title: "IA de alto riesgo", detail: "Obligaciones del anexo III de la Ley de IA", category: "ia" },
  { date: "2028-10-06", title: "Factura electrónica B2B", detail: "Resto de empresas y profesionales", category: "facturacion" },
];

export function categoryOf(id: CategoryId): Category {
  const category = CATEGORIES.find((c) => c.id === id);
  if (!category) throw new Error(`Unknown blog category: ${id}`);
  return category;
}
