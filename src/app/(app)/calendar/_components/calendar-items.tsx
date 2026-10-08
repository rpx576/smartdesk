import Link from "next/link";
import { calendarEventTypeLabels, formatDayMonth, personLabel, taskStatusLabels } from "@/lib/format";
import { itemDays, type CalendarEventType, type CalendarItem } from "@/server/domain/calendar-event";
import { CheckCircleIcon, CheckSquareIcon, MapPinIcon } from "../../_components/icons";
import { itemAccessibleLabel, itemKindLabel, itemTimeLabel } from "../view-model";

/*
 * Visual language of the calendar. Colour is only a hint: every item also
 * carries its kind as text or icon (and a full accessible name), tasks have a
 * dashed border and a check icon, completed tasks are struck through and say
 * so, and cancelled ones say "Cancelada".
 */

const eventTypeStyles: Record<CalendarEventType, string> = {
  MEETING: "border-l-sky-500 bg-sky-50 text-sky-900 dark:bg-sky-950/50 dark:text-sky-100",
  REMINDER: "border-l-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
  DELIVERY: "border-l-violet-500 bg-violet-50 text-violet-900 dark:bg-violet-950/50 dark:text-violet-100",
  INTERNAL: "border-l-slate-500 bg-slate-100 text-slate-900 dark:bg-slate-800/60 dark:text-slate-100",
  OTHER: "border-l-zinc-400 bg-surface-muted text-ink",
};

const taskStyle = "border border-dashed border-accent/50 bg-accent-soft/60 text-ink";
const doneStyle = "border border-dashed border-line bg-surface text-ink-subtle";

export function itemStyle(item: CalendarItem): string {
  if (item.type === "task") return item.status === "COMPLETED" || item.status === "CANCELLED" ? doneStyle : taskStyle;
  return `border-l-4 ${eventTypeStyles[item.eventType ?? "OTHER"]}`;
}

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface";

function TaskMark({ item }: { item: CalendarItem }) {
  const Icon = item.status === "COMPLETED" ? CheckCircleIcon : CheckSquareIcon;
  return <Icon className="size-3.5 shrink-0" />;
}

/** One-line item for month cells and all-day rows. */
export function ItemChip({ item, showTime = true }: { item: CalendarItem; showTime?: boolean }) {
  const done = item.status === "COMPLETED";
  return (
    <Link
      href={item.href}
      aria-label={itemAccessibleLabel(item)}
      title={itemAccessibleLabel(item)}
      className={`flex min-w-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs leading-5 ${itemStyle(item)} ${focusRing} hover:brightness-95`}
    >
      {item.type === "task" ? (
        <TaskMark item={item} />
      ) : (
        showTime && !item.allDay && <span className="shrink-0 tabular-nums opacity-80">{itemTimeLabel(item).slice(0, 5)}</span>
      )}
      <span className={`truncate font-medium ${done ? "line-through" : ""}`}>{item.title}</span>
    </Link>
  );
}

/** Block inside the time grid (week and day views). Positioned by the caller. */
export function TimedBlock({ item, compact }: { item: CalendarItem; compact: boolean }) {
  return (
    <Link
      href={item.href}
      aria-label={itemAccessibleLabel(item)}
      title={itemAccessibleLabel(item)}
      className={`flex h-full min-w-0 flex-col overflow-hidden rounded-md px-1.5 py-1 text-xs shadow-sm ${itemStyle(item)} ${focusRing} hover:brightness-95`}
    >
      <span className="truncate font-semibold">{item.title}</span>
      {!compact && <span className="truncate tabular-nums opacity-80">{itemTimeLabel(item)}</span>}
    </Link>
  );
}

/** Badge with the event type (text, not just colour). */
export function EventTypeBadge({ type }: { type: CalendarEventType }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded border-l-4 px-1.5 py-0.5 text-xs font-medium ${eventTypeStyles[type]}`}>
      {calendarEventTypeLabels[type]}
    </span>
  );
}

/** "10:00 – 11:00", "Todo el día", "Fecha límite" or "6 oct – 9 oct" (task interval). */
function itemWhen(item: CalendarItem): string {
  if (item.type === "event") return itemTimeLabel(item);
  if (item.taskDisplay === "deadline") return "Fecha límite";
  const { first, last } = itemDays(item);
  return `${formatDayMonth(first)} – ${formatDayMonth(last)}`;
}

/** Full row for the agenda and day lists: time, kind, title and context. */
export function ItemRow({ item }: { item: CalendarItem }) {
  const done = item.status === "COMPLETED";
  return (
    <Link
      href={item.href}
      className={`flex min-w-0 flex-col gap-1 rounded-lg px-3 py-2.5 sm:flex-row sm:items-start sm:gap-4 ${itemStyle(item)} ${focusRing} hover:brightness-95`}
    >
      <span className="shrink-0 text-xs font-medium tabular-nums sm:w-32 sm:pt-0.5">
        {itemWhen(item)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          {item.type === "task" && <TaskMark item={item} />}
          <span className={`min-w-0 break-words text-sm font-semibold ${done ? "line-through" : ""}`}>{item.title}</span>
          <span className="text-xs opacity-80">
            {itemKindLabel(item)}
            {item.status && ` · ${taskStatusLabels[item.status]}`}
          </span>
        </span>
        <span className="flex min-w-0 flex-wrap gap-x-3 text-xs opacity-80">
          {item.project && <span className="min-w-0 truncate">Proyecto: {item.project.name}</span>}
          {item.client && <span className="min-w-0 truncate">Cliente: {item.client.name}</span>}
          {item.assignee && <span className="min-w-0 truncate">Responsable: {personLabel(item.assignee)}</span>}
          {item.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPinIcon className="size-3.5 shrink-0" />
              <span className="truncate">{item.location}</span>
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}

/** Colour key, with the same words the items use. */
export function CalendarLegend() {
  return (
    <ul aria-label="Leyenda" className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-ink-muted">
      {(Object.keys(eventTypeStyles) as CalendarEventType[]).map((type) => (
        <li key={type} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`h-3 w-3 rounded-sm border-l-4 ${eventTypeStyles[type]}`} />
          {calendarEventTypeLabels[type]}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <CheckSquareIcon className="size-3.5 text-accent" />
        Tarea (borde discontinuo)
      </li>
      <li className="flex items-center gap-1.5">
        <CheckCircleIcon className="size-3.5" />
        <span className="line-through">Completada</span>
      </li>
    </ul>
  );
}
