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
