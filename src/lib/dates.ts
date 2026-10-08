/**
 * Calendar-date helpers. Due dates are stored as `DATE` (UTC midnight); "today"
 * must be the business calendar day, not the UTC one, or tasks would become
 * overdue an hour or two early/late around midnight.
 */
const BUSINESS_TIME_ZONE = "Europe/Madrid";

const isoDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's business calendar date as a Date at UTC midnight (comparable with stored DATE values). */
export function todayCalendarDate(now: Date = new Date()): Date {
  return new Date(`${isoDayFormatter.format(now)}T00:00:00.000Z`);
}

/** True when a due date (calendar day) is before today. */
export function isPastDue(dueDate: Date | null, today: Date = todayCalendarDate()): boolean {
  return dueDate !== null && dueDate.getTime() < today.getTime();
}

/*
 * Wall-clock helpers for calendar events. Events are stored as instants (UTC)
 * but entered and displayed in the business time zone, so "10:00 on 26 Oct"
 * means 10:00 in Madrid whatever the server's zone, and days start at Madrid
 * midnight (23 or 25 hours long on DST changes).
 */

/** `YYYY-MM-DD` calendar day (no time zone). */
export type IsoDay = string;

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

const wallClockFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function wallClockParts(instant: Date) {
  const parts: Record<string, number> = {};
  for (const { type, value } of wallClockFormatter.formatToParts(instant)) {
    if (type !== "literal") parts[type] = Number(value);
  }
  return parts as { year: number; month: number; day: number; hour: number; minute: number };
}

/** Minutes the business time zone is ahead of UTC at that instant (60 or 120 in Madrid). */
function offsetMinutes(instant: Date): number {
  const { year, month, day, hour, minute } = wallClockParts(instant);
  const asUtc = Date.UTC(year, month - 1, day, hour, minute);
  return Math.round((asUtc - Math.floor(instant.getTime() / MINUTE_MS) * MINUTE_MS) / MINUTE_MS);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The business calendar day of an instant (e.g. 23:30 UTC on 5 Oct is already 6 Oct in Madrid). */
export function zonedDay(instant: Date): IsoDay {
  return isoDayFormatter.format(instant);
}

/** `HH:MM` wall-clock time of an instant in the business time zone. */
export function zonedTime(instant: Date): string {
  const { hour, minute } = wallClockParts(instant);
  return `${pad(hour)}:${pad(minute)}`;
}

/** Minutes since local midnight of the instant's business day (0–1439). */
export function zonedMinutes(instant: Date): number {
  const { hour, minute } = wallClockParts(instant);
  return hour * 60 + minute;
}

/**
 * Instant of a wall-clock date and time in the business time zone. A time
 * skipped by the spring-forward change (e.g. 02:30 on the last Sunday of
 * March) resolves to the equivalent instant one hour later; an ambiguous one
 * (autumn) resolves to its first occurrence.
 */
export function zonedDateTime(day: IsoDay, time = "00:00"): Date {
  const [year, month, date] = day.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, date, hour, minute);
  // The offsets in force a day before and a day after cover any DST change in between.
  const offsetBefore = offsetMinutes(new Date(wallAsUtc - DAY_MS));
  const offsetAfter = offsetMinutes(new Date(wallAsUtc + DAY_MS));
  const valid = [offsetBefore, offsetAfter]
    .map((offset) => wallAsUtc - offset * MINUTE_MS)
    .filter((candidate) => offsetMinutes(new Date(candidate)) * MINUTE_MS === wallAsUtc - candidate);
  return new Date(valid.length > 0 ? Math.min(...valid) : wallAsUtc - offsetBefore * MINUTE_MS);
}

/** Local midnight (business time zone) at the start of a calendar day. */
export function startOfZonedDay(day: IsoDay): Date {
  return zonedDateTime(day, "00:00");
}

/** Calendar-day arithmetic, independent of time zones and DST. */
export function addDays(day: IsoDay, amount: number): IsoDay {
  return new Date(Date.parse(`${day}T00:00:00.000Z`) + amount * DAY_MS).toISOString().slice(0, 10);
}

/** Day of the week with Monday = 0 … Sunday = 6 (the Spanish calendar starts on Monday). */
export function weekdayIndex(day: IsoDay): number {
  return (new Date(`${day}T00:00:00.000Z`).getUTCDay() + 6) % 7;
}

/** A stored calendar date (`@db.Date`, UTC midnight) as an `IsoDay`. */
export function calendarDateToDay(date: Date): IsoDay {
  return date.toISOString().slice(0, 10);
}

/** An `IsoDay` as a calendar date at UTC midnight (comparable with stored `@db.Date` values). */
export function dayToCalendarDate(day: IsoDay): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

/** Business calendar day of "now". */
export function todayIsoDay(now: Date = new Date()): IsoDay {
  return zonedDay(now);
}
