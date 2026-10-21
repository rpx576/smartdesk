/**
 * Contact through WhatsApp without a paid API: the page builds a wa.me link
 * with the message already written, and WhatsApp (app or web) opens the chat
 * with SmartHub so the visitor only has to press send.
 */
import { es } from "@/i18n/dictionaries/es";
import { format, type Dictionary } from "@/i18n";
export const WHATSAPP_NUMBER = "34655130513";
export const WHATSAPP_DISPLAY = "+34 655 130 513";
export const PHONE_HREF = "tel:+34655130513";

/** Texts of the contact form in one language (Spanish unless told otherwise). */
export type ContactCopy = Dictionary["contact"]["form"];

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
export function validateContact(input: ContactInput, copy: ContactCopy = es.contact.form): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name) errors.name = copy.errors.name;
  else if (name.length > NAME_MAX) errors.name = format(copy.errors.nameMax, { max: NAME_MAX });

  if (email && !EMAIL.test(email)) errors.email = copy.errors.email;

  if (message.length < MESSAGE_MIN) errors.message = format(copy.errors.messageMin, { min: MESSAGE_MIN });
  else if (message.length > MESSAGE_MAX) errors.message = format(copy.errors.messageMax, { max: MESSAGE_MAX });

  return errors;
}

/** Text that arrives on SmartHub's WhatsApp. Empty optional fields are left out. */
export function buildContactMessage(input: ContactInput, copy: ContactCopy = es.contact.form): string {
  const name = input.name.trim();
  const company = input.company.trim();
  const email = input.email.trim();
  const lines = [
    company
      ? format(copy.whatsapp.greetingWithCompany, { name: name || "...", company })
      : format(copy.whatsapp.greeting, { name: name || "..." }),
    format(copy.whatsapp.subject, { topic: copy.topics[input.topic] }),
    "",
    input.message.trim() || "...",
  ];
  if (email) lines.push("", format(copy.whatsapp.email, { email }));
  lines.push("", copy.whatsapp.footer);
  return lines.join("\n");
}

/** wa.me link to SmartHub's WhatsApp, with the message pre-filled when given. */
export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
