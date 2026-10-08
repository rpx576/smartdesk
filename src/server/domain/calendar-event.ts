import {
  addDays,
  calendarDateToDay,
  startOfZonedDay,
  zonedDay,
  type IsoDay,
} from "@/lib/dates";
import type { TaskPriority, TaskStatus } from "./task";

export const CALENDAR_EVENT_TYPES = ["MEETING", "REMINDER", "DELIVERY", "INTERNAL", "OTHER"] as const;
export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];

/**
 * Upper bound for an event's duration. V1 events last at most one calendar day
 * (25 hours on the autumn DST change); the bound also lets range queries use
 * the start-time index (an event that ends inside a period started at most
 * this long before it).
 */
export const MAX_EVENT_DURATION_MS = 25 * 3_600_000;

export type CalendarPerson = { id: string; name: string | null; email: string };

export type CalendarEvent = {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  type: CalendarEventType;
  /** Instants (UTC). All-day events span local midnight to the next local midnight. */
  startDateTime: Date;
  endDateTime: Date;
  allDay: boolean;
  location: string | null;
  createdById: string | null;
  assignedToId: string | null;
  clientId: string | null;
  projectId: string | null;
  taskId: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: CalendarPerson | null;
  assignedTo: CalendarPerson | null;
  client: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  task: { id: string; title: string } | null;
};

/** What the services persist: dates already resolved to instants. */
export type CalendarEventCreateData = {
  title: string;
  description?: string | null;
  type?: CalendarEventType;
  startDateTime: Date;
  endDateTime: Date;
  allDay?: boolean;
  location?: string | null;
  assignedToId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
};

export type CalendarEventUpdateData = Partial<CalendarEventCreateData>;

/** Another event of the same assignee that overlaps in time (a warning, never a block). */
export type CalendarConflict = Pick<CalendarEvent, "id" | "title" | "startDateTime" | "endDateTime">;

export const EVENT_CONFLICT_MESSAGE = "Este evento coincide con otro evento existente.";

/** Overlap of half-open intervals [start, end). Touching events (10–11 and 11–12) do not overlap. */
export function overlaps(a: { start: Date; end: Date }, b: { start: Date; end: Date }): boolean {
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}

/* ------------------------------------------------------------------------ */
/* Calendar view model                                                       */
/* ------------------------------------------------------------------------ */

export const CALENDAR_VIEWS = ["month", "week", "day", "agenda"] as const;
export type CalendarView = (typeof CALENDAR_VIEWS)[number];

/** Longest period one request may read (a month grid is at most 42 days). */
export const MAX_RANGE_DAYS = 62;

/** What the calendar shows: events and tasks. */
export const CALENDAR_SHOW = ["all", "events", "tasks"] as const;
export type CalendarShow = (typeof CALENDAR_SHOW)[number];

export type CalendarFilter = {
  show?: CalendarShow;
  /** Only my items: events I created or am assigned to, tasks assigned to me. */
  mine?: boolean;
  projectId?: string;
  /** Assignee of events and tasks. */
  userId?: string;
  /** Narrows to events of this type (tasks are hidden). */
  eventType?: CalendarEventType;
  /** Narrows to tasks in this status (events are hidden). CANCELLED is hidden unless asked for. */
  taskStatus?: TaskStatus;
  /** Event title/description, task title/description, project or client name. */
  search?: string;
};

/** Visible period: `[from, to)` calendar days in the business time zone. */
export type CalendarRange = { from: IsoDay; to: IsoDay };

/** Minimal task data the calendar needs (read from the Task table, never copied). */
export type CalendarTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date | null;
  dueDate: Date | null;
  project: { id: string; name: string; client: { id: string; name: string } };
  assignee: CalendarPerson;
};

/**
 * One entry of the calendar, whatever its source. A view model only: events
 * and tasks keep their own domain models and pages.
 */
export type CalendarItem = {
  /** Unique across sources: `event:<id>` or `task:<id>`. */
  key: string;
  /** Id of the event or task. */
  id: string;
  type: "event" | "task";
  title: string;
  /** Instants; all-day items span whole local days, `end` exclusive. */
  start: Date;
  end: Date;
  allDay: boolean;
  /** Event type (events only). */
  eventType: CalendarEventType | null;
  /** Task status and priority (tasks only). */
  status: TaskStatus | null;
  priority: TaskPriority | null;
  /** Task with only a due date ("deadline") or a start and due date ("interval"). */
  taskDisplay: "deadline" | "interval" | null;
  location: string | null;
  project: { id: string; name: string } | null;
  client: { id: string; name: string } | null;
  assignee: CalendarPerson | null;
  /** Where clicking the item goes. */
  href: string;
};

export function eventToItem(event: CalendarEvent): CalendarItem {
  return {
    key: `event:${event.id}`,
    id: event.id,
    type: "event",
    title: event.title,
    start: event.startDateTime,
    end: event.endDateTime,
    allDay: event.allDay,
    eventType: event.type,
    status: null,
    priority: null,
    taskDisplay: null,
    location: event.location,
    project: event.project,
    client: event.client,
    assignee: event.assignedTo,
    href: `/calendar/${event.id}`,
  };
}

/**
 * A task on the calendar: from its start date to its due date ("interval"),
 * or on its due date only ("deadline"). Tasks without a due date have nothing
 * to plan against and are not shown. Task dates are calendar days, so the
 * item spans whole local days.
 */
export function taskToItem(task: CalendarTask): CalendarItem | null {
  if (!task.dueDate) return null;
  const dueDay = calendarDateToDay(task.dueDate);
  const startDay = task.startDate ? calendarDateToDay(task.startDate) : dueDay;
  const interval = task.startDate !== null && startDay < dueDay;
  return {
    key: `task:${task.id}`,
    id: task.id,
    type: "task",
    title: task.title,
    start: startOfZonedDay(interval ? startDay : dueDay),
    end: startOfZonedDay(addDays(dueDay, 1)),
    allDay: true,
    eventType: null,
    status: task.status,
    priority: task.priority,
    taskDisplay: interval ? "interval" : "deadline",
    location: null,
    project: { id: task.project.id, name: task.project.name },
    client: task.project.client,
    assignee: task.assignee,
    href: `/tasks/${task.id}`,
  };
}

/**
 * Chronological order for every view: by start, all-day items before timed
 * ones starting at the same moment, then longer first, then title and key so
 * the order is stable.
 */
export function compareItems(a: CalendarItem, b: CalendarItem): number {
  return (
    a.start.getTime() - b.start.getTime() ||
    Number(b.allDay) - Number(a.allDay) ||
    b.end.getTime() - a.end.getTime() ||
    a.title.localeCompare(b.title, "es") ||
    a.key.localeCompare(b.key)
  );
}

/** Events and tasks of a period as one sorted list (combined in memory, no extra queries). */
export function combineItems(events: CalendarEvent[], tasks: CalendarTask[]): CalendarItem[] {
  const items = [...events.map(eventToItem)];
  for (const task of tasks) {
    const item = taskToItem(task);
    if (item) items.push(item);
  }
  return items.sort(compareItems);
}

/** Business days an item covers (its last day is the one before an exclusive midnight end). */
export function itemDays(item: Pick<CalendarItem, "start" | "end">): { first: IsoDay; last: IsoDay } {
  const first = zonedDay(item.start);
  const last = zonedDay(new Date(Math.max(item.start.getTime(), item.end.getTime() - 1)));
  return { first, last };
}

/** Upcoming events/deadlines shown on the dashboard and the project page. */
export type UpcomingEvent = Pick<
  CalendarEvent,
  "id" | "title" | "type" | "startDateTime" | "endDateTime" | "allDay" | "location"
> & { project: { id: string; name: string } | null };

/** Option lists for the event form (all from the active organization). */
export type CalendarFormOptions = {
  clients: { id: string; name: string }[];
  projects: { id: string; name: string; clientId: string }[];
  tasks: { id: string; title: string; projectId: string }[];
  assignees: CalendarPerson[];
};

/** API warnings for a saved event: overlaps are reported, never rejected. */
export function conflictWarnings(conflicts: CalendarConflict[]) {
  return conflicts.length > 0 ? [{ code: "EVENT_CONFLICT", message: EVENT_CONFLICT_MESSAGE, conflicts }] : [];
}
