import { zonedDay, zonedTime } from "@/lib/dates";
import type { CalendarEvent } from "@/server/domain/calendar-event";

/** Fields the event form submits. Anything else in the FormData is ignored. */
export const EVENT_FORM_FIELDS = [
  "title",
  "description",
  "type",
  "date",
  "startTime",
  "endTime",
  "allDay",
  "location",
  "assignedToId",
  "clientId",
  "projectId",
  "taskId",
] as const;

export type EventFormField = (typeof EVENT_FORM_FIELDS)[number];
export type EventFormValues = Partial<Record<EventFormField, string>>;

/**
 * Picks only the event fields from a submitted form. A forged
 * `organizationId`, `createdById`, `startDateTime` or `id` never reaches
 * validation or the service.
 */
export function readEventForm(formData: FormData): EventFormValues {
  const values: EventFormValues = {};
  for (const field of EVENT_FORM_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string") values[field] = value;
  }
  return values;
}

/** Stored event → form values, with day and times in the business time zone. */
export function eventToFormValues(event: CalendarEvent): EventFormValues {
  return {
    title: event.title,
    description: event.description ?? "",
    type: event.type,
    date: zonedDay(event.startDateTime),
    startTime: event.allDay ? "" : zonedTime(event.startDateTime),
    endTime: event.allDay ? "" : zonedTime(event.endDateTime),
    allDay: event.allDay ? "on" : "",
    location: event.location ?? "",
    assignedToId: event.assignedToId ?? "",
    clientId: event.clientId ?? "",
    projectId: event.projectId ?? "",
    taskId: event.taskId ?? "",
  };
}

/** Success messages shown after a redirect (`?notice=...`). Unknown keys show nothing. */
export const NOTICES = {
  created: "Evento creado correctamente.",
  updated: "Cambios guardados correctamente.",
  deleted: "Evento eliminado.",
} as const;

export type NoticeKey = keyof typeof NOTICES;

export function noticeMessage(value: unknown): string | undefined {
  return typeof value === "string" && Object.hasOwn(NOTICES, value) ? NOTICES[value as NoticeKey] : undefined;
}
