"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getAppContext } from "@/server/auth/organization-context";
import { ForbiddenError, NotFoundError, ValidationError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import { calendarEventService } from "@/server/services/calendar-event.service";
import { calendarEventCreateSchema, calendarEventUpdateSchema } from "@/server/validation/calendar-event.schema";
import { isoDay } from "@/server/validation/common";
import { readEventForm, type EventFormField, type EventFormValues } from "./form-data";
import { calendarHref } from "./view-model";

export type EventFormState =
  | {
      error?: string;
      fieldErrors?: Partial<Record<EventFormField, string[]>>;
      /** What the user typed, to refill the form after an error. */
      values?: EventFormValues;
    }
  | undefined;

export type EventActionState = { error?: string } | undefined;

type FieldErrors = NonNullable<NonNullable<EventFormState>["fieldErrors"]>;

const NOT_FOUND_MESSAGE = "El evento no existe o no pertenece a tu organización.";
const FORBIDDEN_MESSAGE = "Solo puedes modificar eventos que has creado o que tienes asignados.";
const CREATE_FORBIDDEN_MESSAGE = "Tu rol en esta organización no permite crear eventos.";

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

/** Field-level details from service validation (e.g. a project of another organization). */
function detailsToFieldErrors(details: unknown): FieldErrors | undefined {
  if (!Array.isArray(details)) return undefined;
  const fieldErrors: FieldErrors = {};
  for (const detail of details) {
    const path = (detail as { path?: unknown })?.path;
    const message = (detail as { message?: unknown })?.message;
    if (typeof path === "string" && typeof message === "string") fieldErrors[path as EventFormField] = [message];
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

/** Maps expected failures to friendly messages; never exposes internal details. */
function failure(
  error: unknown,
  values?: EventFormValues,
  forbiddenMessage = FORBIDDEN_MESSAGE,
): NonNullable<EventFormState> {
  // Let Next.js control-flow errors (e.g. the redirect to /login) through.
  unstable_rethrow(error);
  if (error instanceof ValidationError) {
    const fieldErrors = detailsToFieldErrors(error.details);
    return fieldErrors
      ? { fieldErrors, values }
      : { error: "El responsable, el cliente, el proyecto o la tarea no pertenecen a tu organización.", values };
  }
  if (error instanceof ForbiddenError) return { error: forbiddenMessage, values };
  if (error instanceof NotFoundError) return { error: NOT_FOUND_MESSAGE, values };
  logger.error("Calendar event action failed", { error });
  return { error: "No se han podido guardar los cambios. Inténtalo de nuevo en unos segundos.", values };
}

const eventIdSchema = z.uuid();

export async function createCalendarEvent(_state: EventFormState, formData: FormData): Promise<EventFormState> {
  const values = readEventForm(formData);
  const parsed = calendarEventCreateSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  let eventId: string;
  try {
    const { user, organizationId } = await requireTenant();
    // The service re-checks assignee, client, project and task against this organization.
    eventId = (await calendarEventService.create(user, organizationId, parsed.data)).event.id;
  } catch (error) {
    return failure(error, values, CREATE_FORBIDDEN_MESSAGE);
  }
  // Overlaps are shown as a warning on the event page; they never block saving.
  redirect(`/calendar/${eventId}?notice=created`);
}

export async function updateCalendarEvent(
  eventId: string,
  _state: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const values = readEventForm(formData);
  // The bound id travels through the browser: treat it as untrusted input.
  const id = eventIdSchema.safeParse(eventId);
  if (!id.success) return { error: NOT_FOUND_MESSAGE, values };

  // The form always sends the whole timing; an unchecked "all day" box is simply absent.
  const parsed = calendarEventUpdateSchema.safeParse({ ...values, allDay: values.allDay ?? "" });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  try {
    const { user, organizationId } = await requireTenant();
    // EMPLOYEE may only edit events they created or are assigned to: checked by the service.
    await calendarEventService.update(user, organizationId, id.data, parsed.data);
  } catch (error) {
    return failure(error, values);
  }
  redirect(`/calendar/${id.data}?notice=updated`);
}

export async function deleteCalendarEvent(_state: EventActionState, formData: FormData): Promise<EventActionState> {
  const id = eventIdSchema.safeParse(formData.get("eventId"));
  if (!id.success) return { error: NOT_FOUND_MESSAGE };

  try {
    const { user, organizationId } = await requireTenant();
    await calendarEventService.delete(user, organizationId, id.data);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ForbiddenError) return { error: FORBIDDEN_MESSAGE };
    if (error instanceof NotFoundError) return { error: NOT_FOUND_MESSAGE };
    logger.error("Calendar event delete failed", { error });
    return { error: "No se ha podido eliminar el evento. Inténtalo de nuevo en unos segundos." };
  }

  // Back to the week of the deleted event (the day is re-validated).
  const date = isoDay.safeParse(formData.get("date"));
  redirect(calendarHref({ view: "week", date: date.success ? date.data : undefined, notice: "deleted" }));
}
