import Link from "next/link";
import type { IsoDay } from "@/lib/dates";
import { formatDayHeading, pluralize, weekdayShort } from "@/lib/format";
import type { CalendarItem } from "@/server/domain/calendar-event";
import { calendarHref, hourBounds, itemsByDay, layoutDay, type CalendarState } from "../view-model";
import { ItemChip, ItemRow, TimedBlock } from "./calendar-items";

/** Height of one hour in the grid, in pixels. */
const HOUR_PX = 48;
const ALL_DAY_VISIBLE = 3;

/**
 * Hours down the side, one column per day, timed items positioned by their
 * local start/end and placed side by side when they overlap; all-day items
 * (and tasks) in a row on top. Used by the week (desktop) and day views.
 */
export function TimeGrid({
  days,
  items,
  today,
  state,
}: {
  days: IsoDay[];
  items: CalendarItem[];
  today: IsoDay;
  state: CalendarState;
}) {
  const byDay = itemsByDay(items, days);
  const layouts = days.map((day) => ({ day, ...layoutDay(byDay.get(day) ?? [], day) }));
  const { first, last } = hourBounds(layouts.flatMap((layout) => layout.timed));
  const hours = Array.from({ length: last - first }, (_, i) => first + i);
  const columns = { gridTemplateColumns: `3rem repeat(${days.length}, minmax(0, 1fr))` };
  const single = days.length === 1;

  return (
    <div className="min-w-0">
      {/* Day headers (week view only) */}
      {!single && (
        <div className="grid border-b border-line" style={columns}>
          <span />
          {days.map((day) => (
            <Link
              key={day}
              href={calendarHref({ ...state, view: "day", date: day, page: undefined })}
              aria-label={formatDayHeading(day)}
              aria-current={day === today ? "date" : undefined}
              className="flex flex-col items-center gap-0.5 py-2 text-xs outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
            >
              <span className="font-semibold uppercase tracking-wide text-ink-subtle">{weekdayShort(day)}</span>
              <span
                className={`grid size-7 place-items-center rounded-full text-sm font-semibold tabular-nums ${
                  day === today ? "bg-accent text-accent-ink" : "text-ink"
                }`}
              >
                {Number(day.slice(8))}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* All-day row */}
      <div className="grid border-b border-line bg-surface-muted/40" style={columns}>
        <span className="px-1 py-1.5 text-[10px] font-medium uppercase leading-tight tracking-wide text-ink-subtle">Todo el día</span>
        {layouts.map(({ day, allDay }) => {
          const hidden = allDay.length - ALL_DAY_VISIBLE;
          return (
            <ul key={day} aria-label={`Todo el día, ${formatDayHeading(day)}`} className="flex min-w-0 flex-col gap-0.5 border-l border-line p-1">
              {(single ? allDay : allDay.slice(0, ALL_DAY_VISIBLE)).map((item) => (
                <li key={item.key} className="min-w-0">
                  <ItemChip item={item} />
                </li>
              ))}
              {!single && hidden > 0 && (
                <li>
                  <Link
                    href={calendarHref({ ...state, view: "day", date: day, page: undefined })}
                    aria-label={`Ver ${pluralize(hidden, "elemento más", "elementos más")} del ${formatDayHeading(day)}`}
                    className="block rounded px-1.5 text-xs font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    +{hidden} más
                  </Link>
                </li>
              )}
            </ul>
          );
        })}
      </div>

      {/* Hours */}
      <div className="grid" style={columns}>
        <div aria-hidden="true" className="relative" style={{ height: hours.length * HOUR_PX }}>
          {hours.map((hour, i) => (
            <span
              key={hour}
              className="absolute right-1.5 -translate-y-1/2 text-[11px] tabular-nums text-ink-subtle first:translate-y-0"
              style={{ top: i * HOUR_PX }}
            >
              {String(hour).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        {layouts.map(({ day, timed }) => (
          <div
            key={day}
            className={`relative border-l border-line ${day === today && !single ? "bg-accent-soft/20" : ""}`}
            style={{
              height: hours.length * HOUR_PX,
              backgroundImage: `repeating-linear-gradient(to bottom, var(--line) 0, var(--line) 1px, transparent 1px, transparent ${HOUR_PX}px)`,
            }}
          >
            <ol aria-label={`Eventos con hora, ${formatDayHeading(day)}`}>
              {timed.map((segment) => {
                const top = ((segment.startMinute - first * 60) / 60) * HOUR_PX;
                const height = ((segment.endMinute - segment.startMinute) / 60) * HOUR_PX;
                return (
                  <li
                    key={segment.item.key}
                    className="absolute px-0.5 py-px"
                    style={{
                      top,
                      height,
                      left: `${(segment.lane / segment.lanes) * 100}%`,
                      width: `${100 / segment.lanes}%`,
                    }}
                  >
                    <TimedBlock item={segment.item} compact={height < 40} />
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact alternative to the week grid on phones: one list per day. */
export function DayList({ days, items, today }: { days: IsoDay[]; items: CalendarItem[]; today: IsoDay }) {
  const byDay = itemsByDay(items, days);
  return (
    <ol className="divide-y divide-line">
      {days.map((day) => {
        const dayItems = byDay.get(day) ?? [];
        return (
          <li key={day} className="px-4 py-3">
            <h3 className="mb-2 text-sm font-semibold text-ink">
              {formatDayHeading(day)}
              {day === today && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">Hoy</span>}
            </h3>
            {dayItems.length === 0 ? (
              <p className="text-sm text-ink-subtle">Sin eventos ni tareas.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {dayItems.map((item) => (
                  <li key={item.key}>
                    <ItemRow item={item} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
