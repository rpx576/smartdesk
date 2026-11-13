import type { Faq, Item } from "./services";

/**
 * Words of the home page. Differentiators must stay true: if one stops being
 * true, change it here. Case studies are shown only when real ones are added.
 */
export const HOME = {
  metaTitle: "Advanthor | Creación web, mantenimiento, SEO y ciberseguridad",
  metaDescription:
    "Impulsamos tu negocio digital: creamos, optimizamos y protegemos tu presencia online con creación web, mantenimiento, SEO y ciberseguridad para empresas y autónomos.",
  intro: {
    eyebrow: "Quiénes somos",
    title: "Un equipo para todo lo que tu web necesita",
    text: "Advanthor ofrece servicios digitales a empresas, autónomos y negocios. Nos ocupamos de crear tu web, mantenerla al día, mejorar su posicionamiento y protegerla, para que tengas un único interlocutor y una presencia online que funcione.",
    points: [
      { title: "Creamos", text: "Webs y tiendas online a medida de tu negocio." },
      { title: "Optimizamos", text: "Velocidad, mantenimiento y posicionamiento." },
      { title: "Protegemos", text: "Accesos, copias de seguridad y datos." },
    ] satisfies Item[],
  },
  problems: {
    eyebrow: "Problemas que resolvemos",
    title: "¿Te suena alguno de estos?",
    items: [
      { title: "Mi web está anticuada", text: "No se ve bien en el móvil y no transmite lo que hoy es tu negocio." },
      { title: "Nadie me encuentra en Google", text: "Tus clientes buscan lo que ofreces, pero aparece tu competencia." },
      { title: "La web va lenta o falla", text: "Errores, avisos de actualización pendientes y páginas que tardan en cargar." },
      { title: "Me preocupa un ataque", text: "No sabes si tienes copias de seguridad ni quién tiene acceso a tu web." },
      { title: "No recibo solicitudes", text: "La web tiene visitas, pero pocas se convierten en contactos." },
      { title: "No tengo a quién llamar", text: "Cuando algo falla, no sabes a quién pedir ayuda." },
    ] satisfies Item[],
  },
  differentiators: {
    eyebrow: "Por qué Advanthor",
    title: "Lo que nos diferencia",
    items: [
      { title: "Cuatro servicios, un solo equipo", text: "Web, mantenimiento, SEO y seguridad coordinados, sin repartir tu proyecto entre varios proveedores." },
      { title: "Propuesta por escrito", text: "Antes de empezar recibes alcance, plazos y precio, sin sorpresas." },
      { title: "Hablas con quien hace el trabajo", text: "Comunicación directa por WhatsApp, teléfono o correo." },
      { title: "Explicaciones claras", text: "Te contamos qué hacemos y por qué, sin tecnicismos innecesarios." },
      { title: "Seguridad desde el principio", text: "Cada web nace con buenas prácticas de seguridad y copias de seguridad." },
      { title: "Sin promesas vacías", text: "No garantizamos posiciones en Google ni anunciamos certificaciones que no tenemos." },
    ] satisfies Item[],
  },
  method: {
    eyebrow: "Metodología",
    title: "Cómo trabajamos",
    steps: [
      { title: "Escuchamos", text: "Una primera conversación para entender tu negocio y tus objetivos." },
      { title: "Proponemos", text: "Te enviamos una propuesta con alcance, plazos y presupuesto." },
      { title: "Ejecutamos", text: "Trabajamos por fases y te enseñamos los avances." },
      { title: "Acompañamos", text: "Después de entregar, seguimos disponibles con mantenimiento y soporte." },
    ] satisfies Item[],
  },
  cases: {
    eyebrow: "Proyectos",
    title: "Casos de éxito",
  },
  faq: [
    { question: "¿Trabajáis con autónomos y pequeñas empresas?", answer: "Sí. Nuestros servicios están pensados para empresas, autónomos y negocios de cualquier tamaño." },
    { question: "¿Puedo contratar solo un servicio?", answer: "Sí. Cada servicio se puede contratar por separado, aunque coordinarlos suele dar mejores resultados." },
    { question: "¿Cómo pido un presupuesto?", answer: "Rellena el formulario de contacto eligiendo el servicio o escríbenos por WhatsApp. Te respondemos para conocer tu caso y te enviamos una propuesta por escrito." },
    { question: "¿Trabajáis en remoto?", answer: "Sí, podemos trabajar en remoto con reuniones por videollamada, teléfono o WhatsApp." },
    { question: "¿Qué pasa con mis datos y accesos?", answer: "Los tratamos de forma confidencial y solo para prestar el servicio. Al terminar, te entregamos los accesos de tu web." },
  ] satisfies Faq[],
  cta: {
    title: "¿Hablamos de tu proyecto?",
    text: "Cuéntanos qué necesitas y te respondemos con una propuesta clara.",
  },
} as const;

/** Real, publishable projects only. Empty on purpose: the section stays hidden until there are real cases. */
export type CaseStudy = { client: string; service: string; summary: string; result: string; url?: string };
export const CASE_STUDIES: CaseStudy[] = [];
