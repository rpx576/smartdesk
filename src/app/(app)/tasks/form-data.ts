import { toDateInputValue } from "@/lib/format";
import type { Task } from "@/server/domain/task";
import { taskListQuerySchema } from "@/server/validation/task.schema";

/** Fields the task form submits. Anything else in the FormData is ignored. */
export const TASK_FORM_FIELDS = [
  "title",
  "description",
  "projectId",
  "assigneeId",
  "status",
  "priority",
  "startDate",
  "dueDate",
  "estimatedHours",
  "actualHours",
] as const;

export type TaskFormField = (typeof TASK_FORM_FIELDS)[number];
export type TaskFormValues = Partial<Record<TaskFormField, string>>;

/**
 * Picks only the given task fields from a submitted form (all of them by
 * default). A forged `organizationId`, `createdById`, `completedAt` or `id`
 * never reaches validation or the service.
 */
export function readTaskForm(
  formData: FormData,
  fields: readonly TaskFormField[] = TASK_FORM_FIELDS,
): TaskFormValues {
  const values: TaskFormValues = {};
  for (const field of fields) {
    const value = formData.get(field);
    if (typeof value === "string") values[field] = value;
  }
  return values;
}

const decimal = (value: number | null) => (value === null ? "" : String(value).replace(".", ","));

/** Stored task → form values (strings, as the inputs expect). */
export function taskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? "",
    projectId: task.projectId,
    assigneeId: task.assigneeId,
    status: task.status,
    priority: task.priority,
    startDate: toDateInputValue(task.startDate),
    dueDate: toDateInputValue(task.dueDate),
    // Decimal comma, as the form hint suggests (both comma and point are accepted).
    estimatedHours: decimal(task.estimatedHours),
    actualHours: decimal(task.actualHours),
  };
}

/** Success messages shown after a redirect (`?notice=...`). Unknown keys show nothing. */
export const NOTICES = {
  created: "Tarea creada correctamente.",
  updated: "Cambios guardados correctamente.",
  deleted: "Tarea eliminada.",
  status: "Estado actualizado.",
  priority: "Prioridad actualizada.",
  assignee: "Responsable actualizado.",
} as const;

export type NoticeKey = keyof typeof NOTICES;

export function noticeMessage(value: unknown): string | undefined {
  return typeof value === "string" && Object.hasOwn(NOTICES, value)
    ? NOTICES[value as NoticeKey]
    : undefined;
}

/** Everything that defines a position in the task list (search, filters, sort, page). */
export const LIST_STATE_FIELDS = [
  "search",
  "status",
  "priority",
  "projectId",
  "assigneeId",
  "dueFrom",
  "dueTo",
  "sort",
  "page",
] as const;

export type TaskListState = Partial<Record<(typeof LIST_STATE_FIELDS)[number], unknown>>;

const toQueryDate = (value: unknown) => (value instanceof Date ? value.toISOString().slice(0, 10) : value);

/**
 * Builds a link to the task list keeping search, filters, sort and page.
 * Every value is re-validated, so a redirect target can never point outside `/tasks`.
 */
export function tasksListHref(input: TaskListState & { notice?: NoticeKey }) {
  const raw: Record<string, unknown> = {};
  for (const field of LIST_STATE_FIELDS) {
    const value = toQueryDate(input[field]);
    if (value !== undefined && value !== null && value !== "") raw[field] = value;
  }
  const parsed = taskListQuerySchema.safeParse(raw);
  const params = new URLSearchParams();
  if (parsed.success) {
    for (const field of LIST_STATE_FIELDS) {
      const value = parsed.data[field];
      if (field === "page" || value === undefined) continue;
      params.set(field, String(toQueryDate(value)));
    }
    if (parsed.data.page > 1) params.set("page", String(parsed.data.page));
  }
  if (input.notice) params.set("notice", input.notice);
  const query = params.toString();
  return query ? `/tasks?${query}` : "/tasks";
}
