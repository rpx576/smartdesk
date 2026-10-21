/*
 * Spanish texts of the translated pages (home, contact) and of the shared
 * navigation. This file defines the shape every language must follow: a
 * missing or extra key in another language is a type error.
 * Placeholders look like {name}; see `format()` in ../format.ts.
 */
export const es = {
  htmlLang: "es",
  ogLocale: "es_ES",
  siteDescription: "SmartHub: SmartDesk y el resto de soluciones para pequeñas empresas",

  language: {
    label: "Idioma",
    names: { es: "Español", en: "English" },
    short: { es: "ES", en: "EN" },
    switchTo: "Cambiar el idioma a {language}",
    spanishOnly: "Solo en español",
  },

  nav: {
    mainAria: "Principal",
    footerAria: "Pie de página",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    soon: "Pronto",
    comingSoon: "Próximamente",
    home: "Inicio",
    solutions: "Soluciones",
    products: "Productos",
    pricing: "Precios",
    blog: "Blog",
    company: "Empresa",
    contact: "Contacto",
    about: "Sobre nosotros",
    idea: "Nuestra idea",
    smartdesk: { label: "SmartDesk", description: "Gestión empresarial: clientes, proyectos, tareas y calendario" },
    smartai: { label: "SmartAI", description: "Asistente de IA: presupuestos, respuestas y tareas en segundos" },
    smartweb: { label: "SmartWeb", description: "Diseña tu web o tienda online y mira el precio al momento" },
  },

  header: { contact: "Contactar", login: "Iniciar sesión", start: "Empezar ahora" },

  tabs: {
    aria: "Navegación principal",
    more: "Más",
    menuTitle: "Menú",
    menuAria: "Menú de SmartHub",
    close: "Cerrar",
    closeMenu: "Cerrar menú",
    sections: { products: "Productos", resources: "Recursos", company: "Empresa" },
    texts: {
      smartdesk: "Gestión empresarial",
      smartai: "Asistente de IA",
      smartweb: "Tu web o tienda online",
      blog: "Guías y novedades",
      pricing: "Planes y tarifas",
      idea: "Por qué existe SmartHub",
      contact: "Cuéntanos tu idea",
      about: "El equipo",
    },
  },

  footer: { rights: "Todos los derechos reservados." },

  home: {
    metaTitle: "SmartHub · Soluciones digitales para empresas",
    metaDescription:
      "Gestión empresarial, automatización e inteligencia artificial y desarrollo web en una única plataforma.",
    hero: {
      badge: "Soluciones digitales para empresas",
      titleStart: "Todo lo que necesita tu empresa para",
      titleEmphasis: "trabajar mejor.",
      text: "Gestión empresarial, automatización e inteligencia artificial en una única plataforma. Soluciones digitales diseñadas para hacer crecer tu negocio.",
      primary: "Empezar ahora",
      secondary: "Ver soluciones",
      highlights: [
        { title: "Fácil de usar", text: "Sin complicaciones" },
        { title: "Escalable", text: "Crece con tu negocio" },
        { title: "Seguro", text: "Tus datos protegidos" },
      ],
    },
    services: {
      label: "Nuestras soluciones",
      title: "Servicios digitales para impulsar tu negocio",
      text: "Herramientas y soluciones diseñadas para mejorar la productividad, automatizar procesos y llevar tu empresa al siguiente nivel.",
      items: [
        {
          subtitle: "Gestión empresarial",
          description: "Organiza clientes, proyectos, tareas y equipos desde una única plataforma.",
          features: ["Clientes y proyectos", "Tareas y calendario", "Documentos y equipo", "Dashboard e informes", "Integración con IA"],
          linkLabel: "Abrir SmartDesk",
        },
        {
          subtitle: "Automatización e IA",
          description:
            "Automatiza procesos, genera documentos y aprovecha la inteligencia artificial para ahorrar tiempo y mejorar resultados.",
          features: [
            "Asistentes personalizados",
            "Generación de documentos",
            "Análisis de datos",
            "Automatización de tareas",
            "Integración con tus herramientas",
          ],
          linkLabel: "Probar SmartAI gratis",
        },
        {
          subtitle: "Desarrollo digital",
          description:
            "Diseñamos y desarrollamos páginas web modernas, rápidas y adaptadas a las necesidades de tu negocio.",
          features: ["Páginas corporativas", "Tiendas online", "Landing pages", "Aplicaciones web", "Mantenimiento y soporte"],
          linkLabel: "Diseñar mi web con SmartWeb",
        },
      ],
    },
    previews: {
      dashboard: { title: "Dashboard", cards: ["Clientes", "Proyectos", "Tareas", "Eventos"] },
      assistant: {
        greeting: "Hola, soy tu asistente de IA",
        question: "¿En qué puedo ayudarte hoy?",
        chips: ["Generar un presupuesto", "Analizar datos del proyecto", "Resumir conversaciones"],
      },
      website: {
        brand: "Tu Empresa",
        menu: "Inicio · Servicios · Contacto",
        headline: ["Tu negocio", "en el mundo digital"],
        button: "Empezar ahora",
      },
    },
    idea: {
      label: "Nuestra idea",
      titleStart: "Menos herramientas sueltas.",
      titleEmphasis: "Más negocio.",
      p1: "En la mayoría de pequeñas empresas el trabajo vive repartido: los clientes en un Excel, las tareas en pósits, las citas en varias agendas y los proyectos perdidos entre correos. Cada herramienta resuelve una parte y ninguna habla con las demás.",
      p2: "SmartHub nace para juntar esas piezas. Una sola cuenta desde la que gestionas tu empresa, automatizas lo repetitivo y das la cara al mundo con una web que trabaja para ti.",
      points: [
        { title: "Un solo lugar", text: "para la información de tu negocio" },
        { title: "Un solo equipo", text: "trabajando sobre los mismos datos" },
        { title: "Un solo proveedor", text: "que entiende todo tu recorrido" },
      ],
    },
    chaos: {
      status: "Todo al día",
      showBefore: "Ver cómo era antes",
      showAfter: "Ordenar con SmartHub",
      pieces: [
        { before: "Clientes en un Excel", after: "Clientes" },
        { before: "Tareas en pósits", after: "Tareas" },
        { before: "Citas en tres agendas", after: "Calendario" },
        { before: "Proyectos por email", after: "Proyectos" },
        { before: "Una web sin actualizar", after: "Tu web" },
        { before: "Horas copiando datos", after: "Automatización" },
      ],
    },
    scope: [
      "Clientes",
      "Proyectos",
      "Tareas",
      "Calendario",
      "Equipos y permisos",
      "Asistentes de IA",
      "Automatización",
      "Generación de documentos",
      "Páginas corporativas",
      "Tiendas online",
      "Landing pages",
      "Aplicaciones web",
    ],
    ecosystem: {
      label: "Un ecosistema, no una lista de productos",
      title: "Cada pieza hace mejor a las demás",
      text: "Tu web atrae clientes, SmartDesk los organiza y la IA se ocupa de lo repetitivo. Toca cada pieza para ver qué aporta.",
      account: "Una cuenta",
      nodes: {
        smartweb: {
          role: "Atrae",
          text: "Tu web es la puerta de entrada. Presenta tu negocio, capta contactos y vende mientras tú te dedicas a otra cosa.",
          link: "Cada contacto que llega puede convertirse en un cliente dentro de SmartDesk.",
        },
        smartdesk: {
          role: "Organiza",
          text: "El centro de operaciones. Clientes, proyectos, tareas y calendario conectados, para que el equipo sepa qué hacer, para quién y para cuándo.",
          link: "Es el corazón del ecosistema: aquí vive la información que las demás piezas usan.",
        },
        smartai: {
          role: "Automatiza",
          text: "La inteligencia artificial se encarga de lo repetitivo: redactar, resumir, clasificar y mover datos de un sitio a otro.",
          link: "Trabaja con los datos que ya tienes, así que no empiezas de cero.",
        },
      },
    },
    values: {
      label: "Lo que nos mueve",
      title: "Tecnología pensada para quien no tiene tiempo para la tecnología",
      items: [
        {
          title: "Hecho para pymes, no para multinacionales",
          text: "Las grandes empresas tienen un departamento de sistemas. Tú tienes poco tiempo. Por eso cada herramienta de SmartHub se entiende en minutos, sin cursos ni consultores.",
        },
        {
          title: "Una cuenta para todo",
          text: "Te registras una vez en SmartHub y con esa misma cuenta entras en SmartDesk y en cada servicio que sumes.",
        },
        {
          title: "Tus datos, en tu espacio",
          text: "Cada empresa trabaja en su propia organización, con roles y permisos para decidir quién ve y quién edita cada cosa.",
        },
        {
          title: "Tecnología con sentido",
          text: "Solo automatizamos y añadimos IA donde de verdad te ahorra tiempo. Nada de funciones de escaparate.",
        },
        {
          title: "Crece a tu ritmo",
          text: "Empieza por lo que más te urge y suma piezas cuando las necesites. Todo encaja porque está pensado para encajar desde el primer día.",
        },
      ],
    },
    cta: {
      badge: "¿Listo para empezar?",
      title: "Lleva tu empresa al siguiente nivel",
      text: "Crea tu cuenta, empieza a ordenar tu empresa con SmartDesk y cuéntanos qué más necesitas. Lo construimos contigo.",
      primary: "Empezar ahora",
      secondary: "Contactar con ventas",
      tagline: "Soluciones digitales para un futuro mejor",
    },
  },

  contact: {
    metaTitle: "Contacto · SmartHub",
    metaDescription: "Escríbenos por WhatsApp al {phone} o déjanos tu mensaje y te respondemos.",
    back: "Volver al inicio",
    badge: "Atención directa por WhatsApp",
    title: "Hablemos",
    intro:
      "Sin formularios que se pierden en un buzón: tu mensaje llega a nuestro WhatsApp y te contestamos por el mismo chat.",
    openChat: "Abrir chat de WhatsApp",
    call: "Llamar ahora",
    howAria: "Cómo funciona",
    formAria: "Formulario de contacto",
    steps: [
      { title: "Rellena el formulario", text: "Nombre, asunto y lo que necesitas." },
      { title: "Se abre WhatsApp", text: "Con tu mensaje ya escrito en nuestro chat." },
      { title: "Pulsa enviar", text: "Y seguimos la conversación por WhatsApp." },
    ],
    form: {
      sentTitle: "Te hemos abierto WhatsApp",
      sentText: "Tu mensaje ya está escrito en el chat de SmartHub. Solo falta que pulses enviar.",
      openAgain: "Abrir WhatsApp otra vez",
      writeAnother: "Escribir otro mensaje",
      heading: "Cuéntanos qué necesitas",
      sub: "Al enviar se abre WhatsApp con tu mensaje listo para mandar.",
      name: "Nombre",
      namePlaceholder: "Tu nombre",
      company: "Empresa",
      companyPlaceholder: "Nombre de tu empresa",
      email: "Email",
      emailPlaceholder: "tu@empresa.com",
      optional: "Opcional",
      topicLegend: "¿Sobre qué quieres hablar?",
      topics: { SmartDesk: "SmartDesk", SmartAI: "SmartAI", SmartWeb: "SmartWeb", Otro: "Otro" },
      message: "Mensaje",
      messagePlaceholder: "Por ejemplo: quiero una demo de SmartDesk para mi equipo de 8 personas.",
      submit: "Enviar por WhatsApp",
      previewTitle: "Así nos llegará",
      previewAria: "Vista previa del mensaje",
      today: "Hoy",
      timeLocale: "es-ES",
      errors: {
        name: "Escribe tu nombre.",
        nameMax: "Máximo {max} caracteres.",
        email: "Revisa el email (o déjalo vacío).",
        messageMin: "Cuéntanos un poco más (mínimo {min} caracteres).",
        messageMax: "Máximo {max} caracteres.",
      },
      whatsapp: {
        greeting: "Hola, soy {name}.",
        greetingWithCompany: "Hola, soy {name} de {company}.",
        subject: "Asunto: {topic}",
        email: "Email: {email}",
        footer: "(Enviado desde la página de contacto de SmartHub)",
      },
    },
  },
};

export type Dictionary = typeof es;
