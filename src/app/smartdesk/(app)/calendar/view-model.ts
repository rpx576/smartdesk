import {
  addDays,
  startOfZonedDay,
  weekdayIndex,
  zonedDay,
  zonedMinutes,
  type IsoDay,
} from "@/lib/dates";
import { calendarEventTypeLabels, formatTimeRange, monthName, taskStatusLabels } from "@/lib/format";
import { itemDays, type CalendarFilter, type CalendarItem, type CalendarView } from "@/server/domain/calendar-event";
import { calendarQuerySchema } from "@/server/validation/calendar-event.schema";

/*
 * Pure helpers behind the calendar views: which days a view shows, how items
 * are laid out, labels and links. No data access; everything here is tested.
 */

export type CalendarPeriod = {
  view: CalendarView;
  /** The day the user navigated to (kept when switching views). */
  anchor: IsoDay;
  /** Days queried and shown: `[from, to)`. */
  from: IsoDay;
  to: IsoDay;
  label: string;
  /** Anchors of the previous and next period. */
  previous: IsoDay;
  next: IsoDay;
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const year = (day: IsoDay) => day.slice(0, 4);
const dayOfMonth = (day: IsoDay) => String(Number(day.slice(8, 10)));
const firstOfMonth = (day: IsoDay) => `${day.slice(0, 7)}-01`;

function shiftMonth(day: IsoDay, amount: number): IsoDay {
  const [y, m] = day.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + amount, 1));
  return date.toISOString().slice(0, 10);
}

/** "Octubre 2026". */
export function monthLabel(day: IsoDay): string {
  return `${capitalize(monthName(day))} ${year(day)}`;
}

/** "5 - 11 octubre 2026", "28 septiembre - 4 octubre 2026", "28 diciembre 2026 - 3 enero 2027". */
export function rangeLabel(first: IsoDay, last: IsoDay): string {
  if (first.slice(0, 7) === last.slice(0, 7)) {
    return `${dayOfMonth(first)} - ${dayOfMonth(last)} ${monthName(last)} ${year(last)}`;
  }
  if (year(first) === year(last)) {
    return `${dayOfMonth(first)} ${monthName(first)} - ${dayOfMonth(last)} ${monthName(last)} ${year(last)}`;
  }
  return `${dayOfMonth(first)} ${monthName(first)} ${year(first)} - ${dayOfMonth(last)} ${monthName(last)} ${year(last)}`;
}

/** "6 octubre 2026". */
export function dayLabel(day: IsoDay): string {
  return `${dayOfMonth(day)} ${monthName(day)} ${year(day)}`;
}

/**
 * Days a view covers. Weeks start on Monday; the month view shows whole weeks
 * (so it may include days of the previous and next month); the agenda lists
 * the anchor's month.
 */
export function periodFor(view: CalendarView, anchor: IsoDay): CalendarPeriod {
  switch (view) {
    case "day":
      return { view, anchor, from: anchor, to: addDays(anchor, 1), label: dayLabel(anchor), previous: addDays(anchor, -1), next: addDays(anchor, 1) };
    case "week": {
      const from = addDays(anchor, -weekdayIndex(anchor));
      return {
        view,
        anchor,
        from,
        to: addDays(from, 7),
        label: rangeLabel(from, addDays(from, 6)),
        previous: addDays(anchor, -7),
        next: addDays(anchor, 7),
      };
    }
    case "agenda": {
      const from = firstOfMonth(anchor);
      return { view, anchor, from, to: shiftMonth(from, 1), label: monthLabel(from), previous: shiftMonth(from, -1), next: shiftMonth(from, 1) };
    }
    default: {
      const first = firstOfMonth(anchor);
      const last = addDays(shiftMonth(first, 1), -1);
      return {
        view: "month",
        anchor,
        from: addDays(first, -weekdayIndex(first)),
        to: addDays(last, 7 - weekdayIndex(last)),
        label: monthLabel(first),
        previous: shiftMonth(first, -1),
        next: shiftMonth(first, 1),
      };
    }
  }
}

/** Every day in `[from, to)`. */
export function daysBetween(from: IsoDay, to: IsoDay): IsoDay[] {
  const days: IsoDay[] = [];
  for (let day = from; day < to; day = addDays(day, 1)) days.push(day);
  return days;
}

/** Days of a month view, in rows of seven (Monday first). */
export function monthWeeks(period: CalendarPeriod): IsoDay[][] {
  const days = daysBetween(period.from, period.to);
  return Array.from({ length: days.length / 7 }, (_, week) => days.slice(week * 7, week * 7 + 7));
}

/** Items of each day; an item spanning several days appears on each of them. */
export function itemsByDay(items: CalendarItem[], days: IsoDay[]): Map<IsoDay, CalendarItem[]> {
  const result = new Map<IsoDay, CalendarItem[]>(days.map((day) => [day, []]));
  for (const item of items) {
    const { first, last } = itemDays(item);
    for (const day of days) {
      if (day >= first && day <= last) result.get(day)!.push(item);
    }
  }
  return result;
}

/** Timed item placed on a day column: minutes from local midnight and its lane among overlaps. */
export type TimedSegment = {
  item: CalendarItem;
  startMinute: number;
  endMinute: number;
  /** Column inside its group of overlapping items, and how many columns the group needs. */
  lane: number;
  lanes: number;
  /** The item started on an earlier day / ends on a later day. */
  continuesBefore: boolean;
  continuesAfter: boolean;
};

const MIN_SEGMENT_MINUTES = 20;

/**
 * Splits a day's items into all-day ones and timed segments clipped to the
 * day, and places overlapping segments side by side (greedy lanes per group of
 * overlapping items).
 */
export function layoutDay(items: CalendarItem[], day: IsoDay): { allDay: CalendarItem[]; timed: TimedSegment[] } {
  const dayStart = startOfZonedDay(day).getTime();
  const dayEnd = startOfZonedDay(addDays(day, 1)).getTime();
  const allDay: CalendarItem[] = [];
  const segments: Omit<TimedSegment, "lane" | "lanes">[] = [];

  for (const item of items) {
    if (item.allDay) {
      allDay.push(item);
      continue;
    }
    const continuesBefore = item.start.getTime() < dayStart;
    const continuesAfter = item.end.getTime() > dayEnd;
    const startMinute = continuesBefore ? 0 : zonedMinutes(item.start);
    const rawEnd = continuesAfter || zonedDay(item.end) !== day ? 24 * 60 : zonedMinutes(item.end);
    const endMinute = Math.min(24 * 60, Math.max(rawEnd, startMinute + MIN_SEGMENT_MINUTES));
    segments.push({ item, startMinute, endMinute, continuesBefore, continuesAfter });
  }
  segments.sort((a, b) => a.startMinute - b.startMinute || b.endMinute - a.endMinute);

  const timed: TimedSegment[] = [];
  let group: TimedSegment[] = [];
  let groupEnd = -1;
  const closeGroup = () => {
    const lanes = Math.max(1, ...group.map((segment) => segment.lane + 1));
    for (const segment of group) segment.lanes = lanes;
    timed.push(...group);
    group = [];
  };
  for (const segment of segments) {
    if (segment.startMinute >= groupEnd && group.length > 0) closeGroup();
    // First lane whose last segment has ended.
    const busy = new Set(group.filter((other) => other.endMinute > segment.startMinute).map((other) => other.lane));
    let lane = 0;
    while (busy.has(lane)) lane += 1;
    group.push({ ...segment, lane, lanes: 1 });
    groupEnd = Math.max(groupEnd, segment.endMinute);
  }
  if (group.length > 0) closeGroup();
  return { allDay, timed };
}

export const DEFAULT_FIRST_HOUR = 8;
export const DEFAULT_LAST_HOUR = 20;

/** Hours shown in the time grid: working hours, widened to fit every segment. */
export function hourBounds(segments: Pick<TimedSegment, "startMinute" | "endMinute">[]): { first: number; last: number } {
  let first = DEFAULT_FIRST_HOUR;
  let last = DEFAULT_LAST_HOUR;
  for (const { startMinute, endMinute } of segments) {
    first = Math.min(first, Math.floor(startMinute / 60));
    last = Math.max(last, Math.ceil(endMinute / 60));
  }
  return { first, last };
}

export const AGENDA_PAGE_SIZE = 25;

/**
 * Agenda page: each item once, under the first day it is visible in the
 * period, paginated over the chronological list.
 */
export function agendaPage(items: CalendarItem[], from: IsoDay, page: number, pageSize = AGENDA_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const slice = items.slice((current - 1) * pageSize, current * pageSize);
  const groups: { day: IsoDay; items: CalendarItem[] }[] = [];
  for (const item of slice) {
    const first = itemDays(item).first;
    const day = first < from ? from : first;
    const last = groups.at(-1);
    if (last?.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  return { groups, page: current, totalPages, total: items.length };
}

/** "Tarea", "Reunión"... */
export function itemKindLabel(item: CalendarItem): string {
  if (item.type === "task") return item.taskDisplay === "deadline" ? "Vencimiento de tarea" : "Tarea";
  return item.eventType ? calendarEventTypeLabels[item.eventType] : "Evento";
}

/** When, as shown next to the title (tasks are whole days). */
export function itemTimeLabel(item: CalendarItem): string {
  return formatTimeRange(item.start, item.end, item.allDay);
}

/** Complete description for screen readers (kind, title, time, status), independent of colours. */
export function itemAccessibleLabel(item: CalendarItem): string {
  const parts = [`${itemKindLabel(item)}: ${item.title}`];
  if (item.type === "event") parts.push(itemTimeLabel(item));
  if (item.status) parts.push(taskStatusLabels[item.status]);
  if (item.project) parts.push(`Proyecto ${item.project.name}`);
  return parts.join(", ");
}

/** State of the calendar page that links must keep. */
export type CalendarState = CalendarFilter & { view?: CalendarView; date?: IsoDay; page?: number };

const STATE_FIELDS = ["view", "date", "show", "mine", "projectId", "userId", "eventType", "taskStatus", "search", "page"] as const;

/**
 * Link to the calendar keeping view, day, filters and agenda page. Every value
 * is re-validated, so a link or redirect can never point outside `/smartdesk/calendar`.
 */
export function calendarHref(state: CalendarState & { notice?: string }): string {
  const raw: Record<string, unknown> = {};
  for (const field of STATE_FIELDS) {
    const value = state[field];
    if (value !== undefined && value !== null && value !== "" && value !== false) raw[field] = value === true ? "1" : value;
  }
  const parsed = calendarQuerySchema.safeParse(raw);
  const params = new URLSearchParams();
  if (parsed.success) {
    for (const field of STATE_FIELDS) {
      const value = parsed.data[field];
      if (value === undefined || value === false || (field === "page" && value === 1)) continue;
      params.set(field, value === true ? "1" : String(value));
    }
  }
  if (state.notice && /^[a-z]+$/.test(state.notice)) params.set("notice", state.notice);
  const query = params.toString();
  return query ? `/smartdesk/calendar?${query}` : "/smartdesk/calendar";
}

/** Number of active filters (shown on the collapsed filter panel). */
export function activeFilterCount(filter: CalendarFilter): number {
  return [filter.show && filter.show !== "all", filter.mine, filter.projectId, filter.userId, filter.eventType, filter.taskStatus, filter.search].filter(
    Boolean,
  ).length;
}
