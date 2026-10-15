/**
 * Contact through WhatsApp without a paid API: the page builds a wa.me link
 * with the message already written, and WhatsApp (app or web) opens the chat
 * with SmartHub so the visitor only has to press send.
 */
export const WHATSAPP_NUMBER = "34655130513";
export const WHATSAPP_DISPLAY = "+34 655 130 513";
export const PHONE_HREF = "tel:+34655130513";

export const CONTACT_TOPICS = ["SmartDesk", "SmartAI", "SmartWeb", "Otro"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export type ContactInput = {
  name: string;
  company: string;
  email: string;
  topic: ContactTopic;
  message: string;
};

export type ContactErrors = Partial<Record<"name" | "email" | "message", string>>;

export const NAME_MAX = 80;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 1000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Empty object when the form can be sent; otherwise one message per wrong field. */
export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name) errors.name = "Escribe tu nombre.";
  else if (name.length > NAME_MAX) errors.name = `Máximo ${NAME_MAX} caracteres.`;

  if (email && !EMAIL.test(email)) errors.email = "Revisa el email (o déjalo vacío).";

  if (message.length < MESSAGE_MIN) errors.message = `Cuéntanos un poco más (mínimo ${MESSAGE_MIN} caracteres).`;
  else if (message.length > MESSAGE_MAX) errors.message = `Máximo ${MESSAGE_MAX} caracteres.`;

  return errors;
}

/** Text that arrives on SmartHub's WhatsApp. Empty optional fields are left out. */
export function buildContactMessage(input: ContactInput): string {
  const name = input.name.trim();
  const company = input.company.trim();
  const email = input.email.trim();
  const lines = [
    `Hola, soy ${name || "..."}${company ? ` de ${company}` : ""}.`,
    `Asunto: ${input.topic}`,
    "",
    input.message.trim() || "...",
  ];
  if (email) lines.push("", `Email: ${email}`);
  lines.push("", "(Enviado desde la página de contacto de SmartHub)");
  return lines.join("\n");
}

/** wa.me link to SmartHub's WhatsApp, with the message pre-filled when given. */
export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
