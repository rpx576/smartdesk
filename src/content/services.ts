/**
 * The four services of Advanthor: one source for the service pages, the home,
 * the menu, the contact form and the structured data (schema.org Service).
 *
 * Rule for this file: describe only work that is really offered. No
 * certifications, guarantees, response times or results that are not real.
 */
export type ServiceId = "creacion-web" | "mantenimiento-web" | "seo" | "ciberseguridad";

export type Item = { title: string; text: string };
export type Faq = { question: string; answer: string };

export type Service = {
  id: ServiceId;
  href: `/${ServiceId}`;
  name: string;
  /** One line for cards and menus. */
  summary: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  highlights: string[];
  itemsTitle: string;
  items: Item[];
  benefitsTitle: string;
  benefits: Item[];
  process: Item[];
  faq: Faq[];
};

export const SERVICES: Service[] = [
  {
    id: "creacion-web",
    href: "/creacion-web",
    name: "Creación web",
    summary: "Webs corporativas, tiendas online y landing pages rápidas, claras y preparadas para vender.",
    metaTitle: "Creación de páginas web y tiendas online | Advanthor",
    metaDescription:
      "Diseño y desarrollo de webs corporativas, tiendas online y landing pages responsive, rápidas y con SEO técnico inicial. Pide presupuesto sin compromiso.",
    eyebrow: "Creación web",
    title: "Webs profesionales que explican lo que haces y convierten visitas en clientes",
    intro:
      "Diseñamos y desarrollamos tu web a partir de tus objetivos: qué vendes, a quién y qué quieres que haga quien la visita. El resultado es una web rápida, adaptada a móvil y fácil de mantener.",
    highlights: ["Diseño responsive", "Optimización de velocidad", "SEO técnico inicial"],
    itemsTitle: "Qué podemos crear para ti",
    items: [
      { title: "Páginas web corporativas", text: "Presenta tu empresa, tus servicios y tu forma de trabajar con una web clara y profesional." },
      { title: "Tiendas online", text: "Catálogo, carrito, pagos y envíos configurados para que puedas vender por internet." },
      { title: "Landing pages", text: "Páginas enfocadas en una campaña o servicio concreto, pensadas para captar solicitudes." },
      { title: "Diseño responsive", text: "Cada página se diseña y se prueba en móvil, tablet y ordenador." },
      { title: "Desarrollo personalizado", text: "Funcionalidades a medida cuando una plantilla no cubre lo que tu negocio necesita." },
      { title: "Integración de formularios", text: "Formularios de contacto y presupuesto que llegan a tu correo, con protección antispam." },
      { title: "Automatizaciones", text: "Conexión de la web con tus herramientas para ahorrar tareas repetitivas, como avisos o altas de contactos." },
      { title: "Optimización de velocidad", text: "Imágenes en formatos modernos, carga diferida y código ligero para que la web cargue rápido." },
      { title: "SEO técnico inicial", text: "Titles, descripciones, URLs limpias, sitemap y datos estructurados desde el primer día." },
    ],
    benefitsTitle: "Qué ganas con una web profesional",
    benefits: [
      { title: "Imagen profesional", text: "Una web cuidada transmite confianza antes de la primera llamada." },
      { title: "Más solicitudes", text: "Llamadas a la acción visibles y formularios sencillos en cada página." },
      { title: "Lista para crecer", text: "Estructura preparada para añadir servicios, idiomas o una tienda más adelante." },
      { title: "Fácil de mantener", text: "Te explicamos cómo editar tus contenidos y documentamos lo que entregamos." },
    ],
    process: [
      { title: "Briefing", text: "Hablamos de tu negocio, tus clientes y lo que debe conseguir la web." },
      { title: "Propuesta y presupuesto", text: "Te enviamos alcance, plazos y precio por escrito antes de empezar." },
      { title: "Diseño", text: "Preparamos la estructura y el diseño de las páginas principales para que los revises." },
      { title: "Desarrollo y pruebas", text: "Construimos la web y la probamos en distintos dispositivos y navegadores." },
      { title: "Publicación y formación", text: "La publicamos, comprobamos que todo funciona y te enseñamos a gestionarla." },
    ],
    faq: [
      { question: "¿Cuánto cuesta una página web?", answer: "Depende del número de páginas, las funcionalidades y si incluye tienda online. Te damos un presupuesto cerrado por escrito después de una primera conversación." },
      { question: "¿Cuánto se tarda en tener la web?", answer: "El plazo depende del alcance y de cuándo tengamos los contenidos. Lo acordamos en la propuesta, antes de empezar." },
      { question: "¿Podré modificar los textos yo mismo?", answer: "Sí. Al terminar te enseñamos a editar los contenidos habituales y te dejamos indicaciones por escrito." },
      { question: "¿Incluye el mantenimiento?", answer: "El mantenimiento es un servicio aparte con planes mensuales, para que solo pagues por la cobertura que necesitas." },
    ],
  },
  {
    id: "mantenimiento-web",
    href: "/mantenimiento-web",
    name: "Mantenimiento web",
    summary: "Actualizaciones, copias de seguridad, monitorización y soporte para que tu web funcione siempre.",
    metaTitle: "Mantenimiento web y WordPress | Advanthor",
    metaDescription:
      "Planes de mantenimiento web: actualizaciones de WordPress, plugins y temas, copias de seguridad, monitorización, corrección de errores y soporte técnico.",
    eyebrow: "Mantenimiento web",
    title: "Tu web actualizada, con copias de seguridad y alguien pendiente de ella",
    intro:
      "Una web sin mantenimiento acumula fallos, se vuelve lenta y es más fácil de atacar. Nos ocupamos de las actualizaciones, las copias y la vigilancia para que tú te dediques a tu negocio.",
    highlights: ["Copias de seguridad", "Monitorización", "Soporte técnico"],
    itemsTitle: "Qué incluye el mantenimiento",
    items: [
      { title: "Actualizaciones de WordPress", text: "Aplicamos las versiones nuevas del núcleo después de comprobar que son compatibles con tu web." },
      { title: "Plugins y temas", text: "Actualizamos plugins y temas y revisamos que nada deje de funcionar." },
      { title: "Copias de seguridad", text: "Copias periódicas de archivos y base de datos, guardadas fuera del servidor de la web." },
      { title: "Monitorización", text: "Vigilamos que la web esté en línea y te avisamos si detectamos una caída." },
      { title: "Protección básica", text: "Medidas de seguridad esenciales: accesos, permisos y bloqueo de intentos de entrada." },
      { title: "Corrección de errores", text: "Resolvemos los fallos que aparezcan en la web dentro de las horas de tu plan." },
      { title: "Soporte técnico", text: "Te ayudamos con dudas y pequeños cambios por correo o WhatsApp." },
      { title: "Optimización periódica", text: "Limpieza de la base de datos, revisión de velocidad y de imágenes." },
    ],
    benefitsTitle: "Qué ganas con el mantenimiento",
    benefits: [
      { title: "Menos sustos", text: "Los problemas se detectan antes de que los vean tus clientes." },
      { title: "Recuperación rápida", text: "Con copias recientes, volver a un estado correcto es mucho más sencillo." },
      { title: "Coste previsible", text: "Una cuota mensual en lugar de arreglos urgentes sin presupuesto." },
      { title: "Un único interlocutor", text: "Sabes a quién escribir cuando algo no va bien." },
    ],
    process: [
      { title: "Revisión inicial", text: "Analizamos el estado de tu web, sus versiones y sus copias actuales." },
      { title: "Puesta a punto", text: "Corregimos lo urgente y dejamos configuradas las copias y la monitorización." },
      { title: "Mantenimiento mensual", text: "Actualizaciones, revisiones y soporte según tu plan." },
      { title: "Informe", text: "Te contamos qué se ha hecho y qué recomendamos mejorar." },
    ],
    faq: [
      { question: "¿Solo mantenéis webs en WordPress?", answer: "WordPress es lo más habitual, pero también revisamos otras webs. Cuéntanos con qué está hecha la tuya y te diremos si podemos mantenerla." },
      { question: "¿Mantenéis webs que no habéis hecho vosotros?", answer: "Sí. Empezamos con una revisión inicial para conocer su estado antes de asumir el mantenimiento." },
      { question: "¿Puedo cambiar de plan?", answer: "Sí, puedes subir o bajar de plan. Las condiciones se detallan en el contrato del servicio." },
    ],
  },
  {
    id: "seo",
    href: "/seo",
    name: "SEO",
    summary: "Auditoría, SEO técnico, on-page y local para que te encuentren quienes ya te están buscando.",
    metaTitle: "Posicionamiento SEO: auditoría, SEO técnico y local | Advanthor",
    metaDescription:
      "Servicios SEO para empresas: auditoría, SEO técnico, on-page y local, palabras clave, contenidos, Google Search Console e informes de posicionamiento.",
    eyebrow: "SEO y posicionamiento",
    title: "Que te encuentren en Google quienes buscan lo que ofreces",
    intro:
      "Trabajamos el SEO con método: primero medimos dónde estás, después corregimos lo técnico, optimizamos tus contenidos y seguimos la evolución con informes que se entienden.",
    highlights: ["Auditoría SEO", "SEO local", "Informes periódicos"],
    itemsTitle: "Qué trabajamos",
    items: [
      { title: "Auditoría SEO", text: "Revisión completa de tu web con una lista priorizada de problemas y mejoras." },
      { title: "SEO técnico", text: "Indexación, velocidad, sitemap, robots, canonical, datos estructurados y errores de rastreo." },
      { title: "SEO on-page", text: "Títulos, descripciones, encabezados, enlaces internos e imágenes de cada página." },
      { title: "SEO local", text: "Perfil de empresa en Google, datos de contacto coherentes y páginas por zona cuando tiene sentido." },
      { title: "Investigación de palabras clave", text: "Descubrimos cómo buscan tus clientes y qué búsquedas merece la pena atacar." },
      { title: "Optimización de contenidos", text: "Mejoramos tus textos y planificamos contenidos nuevos que respondan a esas búsquedas." },
      { title: "Google Search Console", text: "Configuración, verificación y revisión de los datos que Google ofrece sobre tu web." },
      { title: "Seguimiento de posicionamiento", text: "Medimos la evolución de tus palabras clave principales." },
      { title: "Informes periódicos", text: "Te explicamos qué ha cambiado, por qué y cuáles son los siguientes pasos." },
    ],
    benefitsTitle: "Qué ganas con el SEO",
    benefits: [
      { title: "Visitas con intención", text: "Llegan personas que ya están buscando lo que ofreces." },
      { title: "Decisiones con datos", text: "Trabajamos con datos de Search Console y de tu analítica, no con suposiciones." },
      { title: "Resultados acumulables", text: "Las mejoras de SEO siguen dando fruto con el tiempo." },
      { title: "Transparencia", text: "Sabes qué se ha hecho cada mes. No prometemos posiciones concretas: nadie puede garantizarlas." },
    ],
    process: [
      { title: "Auditoría", text: "Analizamos tu web, tu competencia y tus búsquedas clave." },
      { title: "Plan de acción", text: "Priorizamos las mejoras por impacto y esfuerzo." },
      { title: "Implementación", text: "Corregimos lo técnico y optimizamos páginas y contenidos." },
      { title: "Seguimiento", text: "Medimos, informamos y ajustamos el plan." },
    ],
    faq: [
      { question: "¿Cuándo se ven resultados?", answer: "El SEO es un trabajo a medio plazo. Los cambios técnicos se reflejan antes y el crecimiento de visitas suele tardar varios meses. Te lo explicamos con tus datos." },
      { question: "¿Garantizáis la primera posición?", answer: "No. Nadie puede garantizar posiciones en Google. Sí nos comprometemos con un plan de trabajo claro y con informar de su evolución." },
      { question: "¿Puedo contratar solo la auditoría?", answer: "Sí. La auditoría es una modalidad independiente y te quedas con el informe y el plan de mejoras." },
    ],
  },
  {
    id: "ciberseguridad",
    href: "/ciberseguridad",
    name: "Ciberseguridad",
    summary: "Protección preventiva, auditorías de seguridad web y ayuda ante incidentes.",
    metaTitle: "Ciberseguridad web para empresas | Advanthor",
    metaDescription:
      "Seguridad para webs de empresas: auditorías, análisis de vulnerabilidades autorizado, firewall, doble autenticación, copias de seguridad y monitorización.",
    eyebrow: "Ciberseguridad",
    title: "Protege tu web, tus accesos y los datos de tus clientes",
    intro:
      "Separamos claramente lo que hacemos para prevenir problemas, lo que revisamos en una auditoría y cómo te ayudamos si ya ha ocurrido un incidente. Siempre con tu autorización y con un alcance acordado por escrito.",
    highlights: ["Prevención", "Auditorías autorizadas", "Copias y recuperación"],
    itemsTitle: "Qué hacemos",
    items: [
      { title: "Auditoría de seguridad web", text: "Revisión de la configuración, versiones, accesos y puntos débiles de tu web." },
      { title: "Análisis de vulnerabilidades autorizado", text: "Pruebas técnicas sobre tu web, solo con autorización escrita del titular y en el alcance acordado." },
      { title: "Configuración de firewall", text: "Reglas para filtrar tráfico malicioso y bloquear intentos de ataque habituales." },
      { title: "Protección de accesos", text: "Contraseñas robustas, limitación de intentos y cuentas con el mínimo acceso necesario." },
      { title: "Doble autenticación", text: "Activamos un segundo factor en los accesos de administración." },
      { title: "Revisión de permisos", text: "Revisamos usuarios, roles y permisos de archivos para cerrar accesos innecesarios." },
      { title: "Protección de formularios", text: "Antispam, validación y límites de envío para evitar abusos." },
      { title: "Copias de seguridad y recuperación", text: "Copias fuera del servidor y un procedimiento probado para restaurar la web." },
      { title: "Monitorización de seguridad", text: "Vigilancia de cambios y avisos ante actividad sospechosa." },
    ],
    benefitsTitle: "Qué ganas protegiendo tu web",
    benefits: [
      { title: "Menos riesgo", text: "La mayoría de ataques a webs aprovechan descuidos que se pueden prevenir." },
      { title: "Confianza", text: "Tus clientes dejan sus datos en una web cuidada." },
      { title: "Respuesta ordenada", text: "Si ocurre un incidente, sabes qué hacer y con quién." },
      { title: "Cumplimiento", text: "Te ayudamos a aplicar medidas técnicas razonables para proteger los datos personales que tratas." },
    ],
    process: [
      { title: "Diagnóstico", text: "Revisamos el estado de tu web y tus accesos." },
      { title: "Autorización y alcance", text: "Acordamos por escrito qué se revisa y cómo, antes de cualquier prueba." },
      { title: "Medidas", text: "Aplicamos las protecciones acordadas y documentamos los cambios." },
      { title: "Seguimiento", text: "Monitorizamos y revisamos periódicamente según el servicio contratado." },
    ],
    faq: [
      { question: "¿Hacéis pruebas de intrusión sin permiso?", answer: "Nunca. Cualquier análisis técnico se hace solo sobre sistemas del cliente, con su autorización por escrito y en el alcance acordado." },
      { question: "¿Mi web ha sido atacada, podéis ayudarme?", answer: "Escríbenos cuanto antes por WhatsApp. Revisamos el caso y te decimos qué podemos hacer y en qué condiciones antes de empezar." },
      { question: "¿Tenéis certificaciones de seguridad?", answer: "No anunciamos certificaciones que no tenemos. Te explicamos con detalle qué revisamos y cómo lo hacemos." },
    ],
  },
];

export function getService(id: ServiceId): Service {
  const service = SERVICES.find((item) => item.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}

export function isServiceId(value: unknown): value is ServiceId {
  return typeof value === "string" && SERVICES.some((service) => service.id === value);
}
