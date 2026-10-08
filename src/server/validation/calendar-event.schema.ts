import { z } from "zod";
import { addDays, startOfZonedDay, zonedDateTime, type IsoDay } from "@/lib/dates";
import {
  CALENDAR_EVENT_TYPES,
  CALENDAR_SHOW,
  CALENDAR_VIEWS,
  MAX_RANGE_DAYS,
  type CalendarEventCreateData,
} from "@/server/domain/calendar-event";
import { TASK_STATUSES } from "@/server/domain/task";
import { blankToNull, isoDay, optionalFilter, optionalText, tooLong } from "./common";

/*
 * Events are entered as a calendar day plus wall-clock times in the business
 * time zone (Europe/Madrid), both in the form and in the API. The schemas turn
 * them into instants, so services and repositories only see `startDateTime`
 * and `endDateTime`. V1 events start and end on the same day.
 */

export const END_BEFORE_START = "La hora de fin debe ser posterior a la de inicio";
const START_TIME_REQUIRED = "Indica la hora de inicio";
const END_TIME_REQUIRED = "Indica la hora de fin";

const time = z
  .string({ error: "Introduce una hora válida (HH:MM)" })
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Introduce una hora válida (HH:MM)");

const optionalTime = z.preprocess(blankToNull, time.nullish()).transform((v) => v ?? null);

/** Checkbox ("on") from forms, boolean from the API. Absent means false. */
const allDayFlag = z.preprocess(
  (value) => (value === "on" || value === "true" ? true : value === "" || value === "false" ? false : value),
  z.boolean({ error: "Valor no válido" }),
);

/** Optional link to another record of the organization; "" clears it. */
const optionalId = (message: string) =>
  z.preprocess(blankToNull, z.uuid({ error: message }).nullish()).transform((v) => v ?? null);

const eventFields = {
  title: z
    .string({ error: "El título es obligatorio" })
    .trim()
    .min(1, "El título es obligatorio")
    .max(200, tooLong(200)),
  description: optionalText(5000),
  type: z.enum(CALENDAR_EVENT_TYPES, { error: "Selecciona un tipo válido" }),
  date: z.preprocess((value) => (value === "" ? undefined : value), isoDay),
  startTime: optionalTime,
  endTime: optionalTime,
  allDay: allDayFlag,
  location: optionalText(200),
  assignedToId: optionalId("Selecciona un responsable"),
  clientId: optionalId("Selecciona un cliente"),
  projectId: optionalId("Selecciona un proyecto"),
  taskId: optionalId("Selecciona una tarea"),
};

const TIMING_FIELDS = ["date", "startTime", "endTime", "allDay"];

type Timing = { date?: IsoDay; startTime?: string | null; endTime?: string | null; allDay?: boolean };

/**
 * Timing rules as separate refinements, so the user sees every problem in one
 * submit. `when` lets them run even if unrelated fields (title...) failed.
 */
const timingRule = (check: (data: Timing) => boolean, message: string, path: string) => ({
  check,
  options: {
    message,
    path: [path],
    when: (payload: { issues: readonly { path?: readonly PropertyKey[] }[] }) =>
      !payload.issues.some((issue) => TIMING_FIELDS.includes(String(issue.path?.[0]))),
  },
});

const hasTiming = (data: Timing) => TIMING_FIELDS.some((field) => data[field as keyof Timing] !== undefined);

const timingRules = [
  timingRule((d) => !hasTiming(d) || d.date !== undefined, "Introduce una fecha válida", "date"),
  timingRule((d) => !hasTiming(d) || Boolean(d.allDay) || Boolean(d.startTime), START_TIME_REQUIRED, "startTime"),
  timingRule((d) => !hasTiming(d) || Boolean(d.allDay) || Boolean(d.endTime), END_TIME_REQUIRED, "endTime"),
  timingRule(
    (d) => Boolean(d.allDay) || !d.startTime || !d.endTime || d.endTime > d.startTime,
    END_BEFORE_START,
    "endTime",
  ),
];

/**
 * Day + times → instants in the business time zone. An all-day event covers
 * the whole local day: from its midnight to the next one (exclusive).
 */
export function toInstants(timing: Required<Pick<Timing, "date">> & Timing) {
  if (timing.allDay) {
    return {
      startDateTime: startOfZonedDay(timing.date),
      endDateTime: startOfZonedDay(addDays(timing.date, 1)),
      allDay: true,
    };
  }
  return {
    startDateTime: zonedDateTime(timing.date, timing.startTime ?? "00:00"),
    endDateTime: zonedDateTime(timing.date, timing.endTime ?? "00:00"),
    allDay: false,
  };
}

function withRules<T extends z.ZodType<Timing>>(schema: T): T {
  let refined = schema;
  for (const rule of timingRules) refined = refined.refine(rule.check, rule.options);
  return refined;
}

export const calendarEventCreateSchema = withRules(
  z.strictObject({
    ...eventFields,
    description: eventFields.description.optional(),
    type: eventFields.type.optional(),
    startTime: eventFields.startTime.optional(),
    endTime: eventFields.endTime.optional(),
    allDay: eventFields.allDay.optional(),
    location: eventFields.location.optional(),
    assignedToId: eventFields.assignedToId.optional(),
    clientId: eventFields.clientId.optional(),
    projectId: eventFields.projectId.optional(),
    taskId: eventFields.taskId.optional(),
  }),
).transform(({ date, startTime, endTime, allDay, ...rest }): CalendarEventCreateData => ({
  ...rest,
  ...toInstants({ date, startTime, endTime, allDay }),
}));

/** Partial update. Changing any timing field needs the whole timing (day, and times unless all-day). */
export const calendarEventUpdateSchema = withRules(
  z.strictObject({
    title: eventFields.title.optional(),
    description: eventFields.description.optional(),
    type: eventFields.type.optional(),
    date: eventFields.date.optional(),
    startTime: eventFields.startTime.optional(),
    endTime: eventFields.endTime.optional(),
    allDay: eventFields.allDay.optional(),
    location: eventFields.location.optional(),
    assignedToId: eventFields.assignedToId.optional(),
    clientId: eventFields.clientId.optional(),
    projectId: eventFields.projectId.optional(),
    taskId: eventFields.taskId.optional(),
  }),
)
  .refine((data) => Object.keys(data).length > 0, "Indica al menos un campo")
  .transform(({ date, startTime, endTime, allDay, ...rest }): Partial<CalendarEventCreateData> => ({
    ...rest,
    ...(date !== undefined ? toInstants({ date, startTime, endTime, allDay }) : {}),
  }));

const mineFlag = z.preprocess(
  (value) => (value === "1" || value === "true" ? true : value === "0" || value === "false" ? false : value),
  z.boolean(),
);

/** Filters shared by the calendar page and the API. Empty GET values mean "no filter". */
const filterFields = {
  show: optionalFilter(z.enum(CALENDAR_SHOW)),
  mine: optionalFilter(mineFlag),
  projectId: optionalFilter(z.uuid()),
  userId: optionalFilter(z.uuid()),
  eventType: optionalFilter(z.enum(CALENDAR_EVENT_TYPES)),
  taskStatus: optionalFilter(z.enum(TASK_STATUSES)),
  search: optionalFilter(z.string().trim().max(200)),
};

/** Query string of the `/calendar` page: view, anchor day, filters and agenda page. */
export const calendarQuerySchema = z.object({
  view: optionalFilter(z.enum(CALENDAR_VIEWS)),
  date: optionalFilter(isoDay),
  ...filterFields,
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

const RANGE_TOO_LONG = `El periodo no puede superar ${MAX_RANGE_DAYS} días`;

/** `GET /calendar-events?from=YYYY-MM-DD&to=YYYY-MM-DD` (to exclusive) plus filters. */
export const calendarEventListQuerySchema = z
  .object({
    from: isoDay,
    to: isoDay,
    ...filterFields,
  })
  .refine((data) => data.to > data.from, { message: "La fecha final debe ser posterior a la inicial", path: ["to"] })
  .refine((data) => data.to <= addDays(data.from, MAX_RANGE_DAYS), { message: RANGE_TOO_LONG, path: ["to"] });
