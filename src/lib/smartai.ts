/**
 * SmartAI catalogue: the assistants of SmartAI Studio and the fields each one
 * asks for. Plain data shared by the page (form), the validation schema and
 * the service (prompts and demo answers).
 */
export const ASSISTANT_IDS = ["presupuesto", "respuesta", "resumen", "marketing", "resena"] as const;
export type AssistantId = (typeof ASSISTANT_IDS)[number];

export type AssistantField = {
  name: string;
  label: string;
  kind: "text" | "textarea" | "select";
  required?: boolean;
  maxLength: number;
  placeholder?: string;
  options?: readonly string[];
};

export type Assistant = {
  id: AssistantId;
  name: string;
  tagline: string;
  /** Rough minutes a person spends doing this by hand (shown as "time saved"). */
  minutesSaved: number;
  fields: AssistantField[];
  /** Realistic sample filled in by "Probar con un ejemplo". */
  example: Record<string, string>;
  submitLabel: string;
};

export const CHANNELS = ["Correo", "WhatsApp"] as const;
export const TONES = ["Cercano", "Profesional", "Breve"] as const;
export const NETWORKS = ["Instagram", "LinkedIn", "Facebook", "Google Business"] as const;
export const GOALS = ["Vender", "Dar a conocer", "Fidelizar"] as const;
export const RATINGS = ["5 estrellas", "4 estrellas", "3 estrellas", "2 estrellas", "1 estrella"] as const;

export const assistants: Assistant[] = [
  {
    id: "presupuesto",
    name: "Presupuestos",
    tagline: "Un presupuesto claro y desglosado, con IVA y el correo para enviarlo.",
    minutesSaved: 25,
    submitLabel: "Crear presupuesto",
    fields: [
      { name: "cliente", label: "Cliente", kind: "text", maxLength: 120, placeholder: "Ej.: Talleres Ana" },
      {
        name: "trabajo",
        label: "¿Qué vas a hacer?",
        kind: "textarea",
        required: true,
        maxLength: 2000,
        placeholder: "Describe el trabajo con tus palabras: qué incluye, materiales, visitas…",
      },
      { name: "importe", label: "Importe aproximado (sin IVA)", kind: "text", maxLength: 60, placeholder: "Ej.: 1.800 €" },
      { name: "plazo", label: "Plazo de entrega", kind: "text", maxLength: 80, placeholder: "Ej.: 3 semanas" },
    ],
    example: {
      cliente: "Talleres Ana",
      trabajo:
        "Web corporativa de 5 páginas con formulario de cita previa, adaptada a móvil, fotos del taller y ficha en Google. Incluye 1 año de mantenimiento.",
      importe: "1.800 €",
      plazo: "3 semanas",
    },
  },
  {
    id: "respuesta",
    name: "Responder clientes",
    tagline: "Contesta correos y WhatsApp en tu tono, sin dejar nada sin responder.",
    minutesSaved: 8,
    submitLabel: "Redactar respuesta",
    fields: [
      {
        name: "mensaje",
        label: "Mensaje del cliente",
        kind: "textarea",
        required: true,
        maxLength: 3000,
        placeholder: "Pega aquí el correo o el WhatsApp que te han enviado",
      },
      { name: "canal", label: "Canal", kind: "select", maxLength: 20, options: CHANNELS },
      { name: "tono", label: "Tono", kind: "select", maxLength: 20, options: TONES },
      {
        name: "objetivo",
        label: "¿Qué quieres conseguir?",
        kind: "text",
        maxLength: 160,
        placeholder: "Ej.: cerrar una cita esta semana",
      },
    ],
    example: {
      mensaje:
        "Hola, os escribí hace una semana pidiendo precio para cambiar los frenos de un Seat León de 2018 y nadie me ha contestado. ¿Seguís interesados en el trabajo o busco otro taller?",
      canal: "WhatsApp",
      tono: "Cercano",
      objetivo: "Disculparme y darle cita esta semana",
    },
  },
  {
    id: "resumen",
    name: "Resumen y tareas",
    tagline: "Convierte notas de reunión o hilos largos en decisiones y tareas.",
    minutesSaved: 15,
    submitLabel: "Resumir y sacar tareas",
    fields: [
      {
        name: "texto",
        label: "Notas, correo o transcripción",
        kind: "textarea",
        required: true,
        maxLength: 8000,
        placeholder: "Pega las notas de la reunión o el hilo de correos",
      },
    ],
    example: {
      texto:
        "Reunión con Clínica Dental Sonrisa (martes). Quieren renovar la web antes de septiembre. Marta enviará el presupuesto el viernes. Luis revisará el dominio y el correo actual. El cliente pide poder reservar citas online y que salga bien en Google. Decidimos empezar por la página de tratamientos. Hay que preparar una propuesta de diseño para el día 20. Pendiente: pedir fotos de la clínica y los textos de cada tratamiento.",
    },
  },
  {
    id: "marketing",
    name: "Contenido para redes",
    tagline: "Publicaciones listas para redes, con hashtags e idea para la imagen.",
    minutesSaved: 20,
    submitLabel: "Crear publicaciones",
    fields: [
      {
        name: "oferta",
        label: "¿Qué quieres comunicar?",
        kind: "textarea",
        required: true,
        maxLength: 1500,
        placeholder: "Producto, servicio, promoción o novedad",
      },
      { name: "red", label: "Red social", kind: "select", maxLength: 30, options: NETWORKS },
      { name: "objetivo", label: "Objetivo", kind: "select", maxLength: 30, options: GOALS },
    ],
    example: {
      oferta: "Revisión pre-ITV completa por 39 € durante todo octubre, con diagnóstico y lavado de cortesía.",
      red: "Instagram",
      objetivo: "Vender",
    },
  },
  {
    id: "resena",
    name: "Responder reseñas",
    tagline: "Respuestas públicas a reseñas de Google que cuidan tu reputación.",
    minutesSaved: 6,
    submitLabel: "Responder reseña",
    fields: [
      {
        name: "resena",
        label: "Reseña",
        kind: "textarea",
        required: true,
        maxLength: 2000,
        placeholder: "Pega la reseña tal y como aparece",
      },
      { name: "puntuacion", label: "Puntuación", kind: "select", maxLength: 20, options: RATINGS },
      { name: "autor", label: "Nombre de quien la escribe", kind: "text", maxLength: 80, placeholder: "Ej.: Javier" },
    ],
    example: {
      resena:
        "El trato fue muy amable y el coche quedó perfecto, pero tuve que esperar casi una hora aunque tenía cita. Mejorad la organización.",
      puntuacion: "3 estrellas",
      autor: "Javier",
    },
  },
];

export function getAssistant(id: AssistantId): Assistant {
  return assistants.find((assistant) => assistant.id === id)!;
}

/** Business profile the visitor can fill once; every assistant writes with it. */
export type BusinessProfile = { name: string; sector: string; tone: string };

export const BUSINESS_LIMITS = { name: 80, sector: 80, tone: 120 } as const;

/** "live" answers with the AI model; "demo" with templates when no API key is configured. */
export type SmartAiMode = "live" | "demo";

/**
 * Marker in the answer stream: what follows it is a user-facing error
 * message, not part of the answer.
 */
export const SMARTAI_ERROR_MARKER = "[[smartai-error]]";
