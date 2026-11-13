/**
 * WhatsApp alternative of the contact form: builds the text that opens in
 * the business chat (wa.me link), so the visitor only has to press send.
 * Validation of the form itself lives in `src/server/contact/schema.ts`.
 */
import { whatsappUrl } from "@/content/site";

export type WhatsAppDraft = { name: string; company: string; serviceLabel: string; message: string };

/** Text that arrives on the WhatsApp of the business. Empty optional fields are left out. */
export function buildWhatsAppMessage(draft: WhatsAppDraft): string {
  const name = draft.name.trim() || "...";
  const company = draft.company.trim();
  return [
    company ? `Hola, soy ${name} de ${company}.` : `Hola, soy ${name}.`,
    `Me interesa: ${draft.serviceLabel}`,
    "",
    draft.message.trim() || "...",
    "",
    "(Enviado desde la web de Advanthor)",
  ].join("\n");
}

export function whatsappDraftUrl(draft: WhatsAppDraft): string {
  return whatsappUrl(buildWhatsAppMessage(draft));
}
