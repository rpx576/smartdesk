"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getAppContext } from "@/server/auth/organization-context";
import { ForbiddenError, NotFoundError, ValidationError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import { taskService } from "@/server/services/task.service";
import {
  taskAssigneeSchema,
  taskCreateSchema,
  taskPrioritySchema,
  taskStatusSchema,
  taskUpdateSchema,
} from "@/server/validation/task.schema";
import {
  LIST_STATE_FIELDS,
  readTaskForm,
  tasksListHref,
  type NoticeKey,
  type TaskFormField,
  type TaskFormValues,
  type TaskListState,
} from "./form-data";

export type TaskFormState =
  | {
      error?: string;
      fieldErrors?: Partial<Record<TaskFormField, string[]>>;
      /** What the user typed, to refill the form after an error. */
      values?: TaskFormValues;
    }
  | undefined;

export type TaskActionState = { error?: string } | undefined;

type FieldErrors = NonNullable<NonNullable<TaskFormState>["fieldErrors"]>;

const NOT_FOUND_MESSAGE = "La tarea no existe o no pertenece a tu organización.";

/**
 * Identity comes from Auth.js and the organization from the server-side
 * context (memberships in the database). Nothing from the form decides the
 * tenant; the service still authorizes every operation.
 */
async function requireTenant() {
  const { user, organization } = await getAppContext();
  if (!organization) throw new NotFoundError("Organization not found");
  return { user, organizationId: organization.id };
}

/** Field-level details from service validation (e.g. a project or assignee of another organization). */
function detailsToFieldErrors(details: unknown): FieldErrors | undefined {
  if (!Array.isArray(details)) return undefined;
  const fieldErrors: FieldErrors = {};
  for (const detail of details) {
    const path = (detail as { path?: unknown })?.path;
    const message = (detail as { message?: unknown })?.message;
    if (typeof path === "string" && typeof message === "string") fieldErrors[path as TaskFormField] = [message];
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

/** Maps expected failures to friendly messages; never exposes internal details. */
function failure(error: unknown, values?: TaskFormValues): NonNullable<TaskFormState> {
  // Let Next.js control-flow errors (e.g. the redirect to /login) through.
  unstable_rethrow(error);
  if (error instanceof ValidationError) {
    const fieldErrors = detailsToFieldErrors(error.details);
    return fieldErrors
      ? { fieldErrors, values }
      : { error: "El proyecto o el responsable no pertenecen a tu organización.", values };
  }
  if (error instanceof ForbiddenError) return { error: "No tienes permiso para realizar esta acción.", values };
  if (error instanceof NotFoundError) return { error: NOT_FOUND_MESSAGE, values };
  logger.error("Task action failed", { error });
  return { error: "No se han podido guardar los cambios. Inténtalo de nuevo en unos segundos.", values };
}

const taskIdSchema = z.uuid();

export async function createTask(_state: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const values = readTaskForm(formData);
  const parsed = taskCreateSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  let taskId: string;
  try {
    const { user, organizationId } = await requireTenant();
    // The service re-checks that project and assignee belong to this organization.
    taskId = (await taskService.create(user, organizationId, parsed.data)).id;
  } catch (error) {
    return failure(error, values);
  }
  redirect(`/tasks/${taskId}?notice=created`);
}

export async function updateTask(
  taskId: string,
  _state: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const values = readTaskForm(formData);
  // The bound id travels through the browser: treat it as untrusted input.
  const id = taskIdSchema.safeParse(taskId);
  if (!id.success) return { error: NOT_FOUND_MESSAGE, values };

  const parsed = taskUpdateSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  try {
    const { user, organizationId } = await requireTenant();
    await taskService.update(user, organizationId, id.data, parsed.data);
  } catch (error) {
    return failure(error, values);
  }
  redirect(`/tasks/${id.data}?notice=updated`);
}

/**
 * Shared path of the single-field changes (status, priority, assignee): same
 * validation, tenant and permission checks as a full update.
 */
async function quickUpdate(
  taskId: string,
  formData: FormData,
  field: "status" | "priority" | "assigneeId",
  schema: typeof taskStatusSchema | typeof taskPrioritySchema | typeof taskAssigneeSchema,
  notice: NoticeKey,
): Promise<TaskActionState> {
  const id = taskIdSchema.safeParse(taskId);
  if (!id.success) return { error: NOT_FOUND_MESSAGE };
  const parsed = schema.safeParse(readTaskForm(formData, [field]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Valor no válido" };

  try {
    const { user, organizationId } = await requireTenant();
    await taskService.update(user, organizationId, id.data, parsed.data);
  } catch (error) {
    const result = failure(error);
    return { error: result.error ?? Object.values(result.fieldErrors ?? {})[0]?.[0] };
  }
  redirect(`/tasks/${id.data}?notice=${notice}`);
}

export async function changeTaskStatus(taskId: string, _state: TaskActionState, formData: FormData) {
  return quickUpdate(taskId, formData, "status", taskStatusSchema, "status");
}

export async function changeTaskPriority(taskId: string, _state: TaskActionState, formData: FormData) {
  return quickUpdate(taskId, formData, "priority", taskPrioritySchema, "priority");
}

export async function assignTask(taskId: string, _state: TaskActionState, formData: FormData) {
  return quickUpdate(taskId, formData, "assigneeId", taskAssigneeSchema, "assignee");
}

export async function deleteTask(_state: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const id = taskIdSchema.safeParse(formData.get("taskId"));
  if (!id.success) return { error: NOT_FOUND_MESSAGE };

  try {
    const { user, organizationId } = await requireTenant();
    // Only ADMIN holds `task:delete`; the service rejects everyone else.
    await taskService.delete(user, organizationId, id.data);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ForbiddenError) return { error: "Solo un administrador puede eliminar tareas." };
    if (error instanceof NotFoundError) return { error: NOT_FOUND_MESSAGE };
    logger.error("Task delete failed", { error });
    return { error: "No se ha podido eliminar la tarea. Inténtalo de nuevo en unos segundos." };
  }

  // Back to the task list, keeping search, filters, sort and page (re-validated).
  const listState: TaskListState = {};
  for (const field of LIST_STATE_FIELDS) listState[field] = formData.get(field);
  redirect(tasksListHref({ ...listState, notice: "deleted" }));
}
