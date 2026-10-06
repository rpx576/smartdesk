import { toDateInputValue } from "@/lib/format";
import type { Project } from "@/server/domain/project";
import { projectListQuerySchema } from "@/server/validation/project.schema";

/** Fields the project form submits. Anything else in the FormData is ignored. */
export const PROJECT_FORM_FIELDS = [
  "name",
  "description",
  "clientId",
  "status",
  "priority",
  "startDate",
  "dueDate",
  "budget",
  "estimatedHours",
] as const;

export type ProjectFormField = (typeof PROJECT_FORM_FIELDS)[number];
export type ProjectFormValues = Partial<Record<ProjectFormField, string>>;

/**
 * Picks only the known project fields from a submitted form. A forged
 * `organizationId`, `createdById` or `id` never reaches validation or the service.
 */
export function readProjectForm(formData: FormData): ProjectFormValues {
  const values: ProjectFormValues = {};
  for (const field of PROJECT_FORM_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string") values[field] = value;
  }
  return values;
}

/** Stored project → form values (strings, as the inputs expect). */
export function projectToFormValues(project: Project): ProjectFormValues {
  return {
    name: project.name,
    description: project.description ?? "",
    clientId: project.clientId,
    status: project.status,
    priority: project.priority,
    startDate: toDateInputValue(project.startDate),
    dueDate: toDateInputValue(project.dueDate),
    // Decimal comma, as the form hint suggests (both comma and point are accepted).
    budget: project.budget === null ? "" : String(project.budget).replace(".", ","),
    estimatedHours: project.estimatedHours === null ? "" : String(project.estimatedHours).replace(".", ","),
  };
}

/** Success messages shown after a redirect (`?notice=...`). Unknown keys show nothing. */
export const NOTICES = {
  created: "Proyecto creado correctamente.",
  updated: "Cambios guardados correctamente.",
  deleted: "Proyecto eliminado.",
} as const;

export type NoticeKey = keyof typeof NOTICES;

export function noticeMessage(value: unknown): string | undefined {
  return typeof value === "string" && Object.hasOwn(NOTICES, value)
    ? NOTICES[value as NoticeKey]
    : undefined;
}

type ListState = {
  search?: unknown;
  status?: unknown;
  priority?: unknown;
  clientId?: unknown;
  page?: unknown;
};

/**
 * Builds a link to the project list keeping search, filters and page. Every
 * value is re-validated, so a redirect target can never point outside `/projects`.
 */
export function projectsListHref(input: ListState & { notice?: NoticeKey }) {
  const parsed = projectListQuerySchema.safeParse({
    search: input.search || undefined,
    status: input.status || undefined,
    priority: input.priority || undefined,
    clientId: input.clientId || undefined,
    page: input.page || undefined,
  });
  const params = new URLSearchParams();
  if (parsed.success) {
    const { search, status, priority, clientId, page } = parsed.data;
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (clientId) params.set("clientId", clientId);
    if (page > 1) params.set("page", String(page));
  }
  if (input.notice) params.set("notice", input.notice);
  const query = params.toString();
  return query ? `/projects?${query}` : "/projects";
}
