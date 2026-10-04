import { clientListQuerySchema } from "@/server/validation/client.schema";

/** Fields the client form submits. Anything else in the FormData is ignored. */
export const CLIENT_FORM_FIELDS = ["name", "email", "phone", "company", "status", "notes"] as const;

export type ClientFormField = (typeof CLIENT_FORM_FIELDS)[number];
export type ClientFormValues = Partial<Record<ClientFormField, string>>;

/**
 * Picks only the known client fields from a submitted form. Extra keys (for
 * example a forged `organizationId`) never reach validation or the service.
 */
export function readClientForm(formData: FormData): ClientFormValues {
  const values: ClientFormValues = {};
  for (const field of CLIENT_FORM_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string") values[field] = value;
  }
  return values;
}

/** Success messages shown after a redirect (`?notice=...`). Unknown keys show nothing. */
export const NOTICES = {
  created: "Cliente creado correctamente.",
  updated: "Cambios guardados correctamente.",
  deleted: "Cliente eliminado.",
} as const;

export type NoticeKey = keyof typeof NOTICES;

export function noticeMessage(value: unknown): string | undefined {
  return typeof value === "string" && Object.hasOwn(NOTICES, value)
    ? NOTICES[value as NoticeKey]
    : undefined;
}

/**
 * Builds a link back to the client list. Search and page are re-validated, so
 * a redirect target can never point outside `/clients`.
 */
export function clientsListHref(input: { search?: unknown; page?: unknown; notice?: NoticeKey }) {
  const parsed = clientListQuerySchema.safeParse({ search: input.search || undefined, page: input.page || undefined });
  const params = new URLSearchParams();
  if (parsed.success) {
    if (parsed.data.search) params.set("search", parsed.data.search);
    if (parsed.data.page > 1) params.set("page", String(parsed.data.page));
  }
  if (input.notice) params.set("notice", input.notice);
  const query = params.toString();
  return query ? `/clients?${query}` : "/clients";
}
