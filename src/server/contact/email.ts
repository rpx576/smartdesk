import { BRAND, PHONE_DISPLAY } from "@/content/site";
import { BUDGETS, DEADLINES, REQUEST_TYPES, serviceLabel, type ContactInput } from "./schema";

export type Email = { to: string; from: string; replyTo?: string; subject: string; text: string; html: string };

/** Escapes text for HTML so nothing the visitor writes can become markup in the email. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);
}

/** Removes line breaks so a value cannot inject extra email headers (e.g. in the subject). */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function rows(input: ContactInput): [string, string][] {
  const list: [string, string][] = [
    ["Tipo", REQUEST_TYPES[input.requestType]],
    ["Servicio", serviceLabel(input.service)],
    ["Nombre", input.name],
    ["Empresa", input.company ?? "—"],
    ["Correo", input.email],
    ["Teléfono", input.phone ?? "—"],
  ];
  if (input.plan) list.push(["Plan o modalidad", input.plan]);
  if (input.budget) list.push(["Presupuesto orientativo", BUDGETS[input.budget]]);
  if (input.deadline) list.push(["Plazo", DEADLINES[input.deadline]]);
  return list;
}

function table(list: [string, string][]): string {
  return `<table cellpadding="6" style="border-collapse:collapse;font:14px/1.5 sans-serif">${list
    .map(([key, value]) => `<tr><td style="color:#555"><b>${escapeHtml(key)}</b></td><td>${escapeHtml(value)}</td></tr>`)
    .join("")}</table>`;
}

function paragraphs(text: string): string {
  return `<div style="font:14px/1.6 sans-serif;white-space:pre-wrap">${escapeHtml(text)}</div>`;
}

/** Notification for the team, with Reply-To set to the visitor. */
export function teamEmail(input: ContactInput, config: { to: string; from: string }): Email {
  const list = rows(input);
  const subject = oneLine(`[Web] ${REQUEST_TYPES[input.requestType]}: ${serviceLabel(input.service)} · ${input.name}`).slice(0, 180);
  return {
    to: config.to,
    from: config.from,
    replyTo: input.email,
    subject,
    text: `${list.map(([key, value]) => `${key}: ${value}`).join("\n")}\n\nMensaje:\n${input.message}\n`,
    html: `${table(list)}<h3 style="font:600 15px sans-serif">Mensaje</h3>${paragraphs(input.message)}`,
  };
}

/** Acknowledgement for the visitor, with a copy of what they sent. */
export function acknowledgementEmail(input: ContactInput, config: { to: string; from: string }): Email {
  const intro = `Hola, ${oneLine(input.name)}:\n\nHemos recibido tu ${input.requestType === "presupuesto" ? "solicitud de presupuesto" : "consulta"} sobre ${serviceLabel(input.service)}. Te responderemos lo antes posible. Si es urgente, escríbenos por WhatsApp al ${PHONE_DISPLAY}.`;
  const footer = `\n\n${BRAND.name} · ${BRAND.tagline}\nHas recibido este correo porque enviaste el formulario de nuestra web. Si no has sido tú, ignóralo.`;
  return {
    to: input.email,
    from: config.from,
    replyTo: config.to,
    subject: `Hemos recibido tu mensaje · ${BRAND.name}`,
    text: `${intro}\n\nTu mensaje:\n${input.message}${footer}`,
    html: `${paragraphs(intro)}<h3 style="font:600 15px sans-serif">Tu mensaje</h3>${paragraphs(input.message)}${paragraphs(footer)}`,
  };
}
