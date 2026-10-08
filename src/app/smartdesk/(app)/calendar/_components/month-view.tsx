import Link from "next/link";
import { weekdayIndex, type IsoDay } from "@/lib/dates";
import { formatDayHeading, pluralize, weekdayShort } from "@/lib/format";
import type { CalendarItem } from "@/server/domain/calendar-event";
import { calendarHref, itemsByDay, monthWeeks, type CalendarPeriod, type CalendarState } from "../view-model";
import { ItemChip } from "./calendar-items";

/** Items listed per day cell before "+N más". */
export const MONTH_VISIBLE_ITEMS = 3;

/**
 * Month grid (Monday first) as a table: one row per week, one cell per day.
 * Each day number links to that day's view; on phones the cells only show how
 * many items there are, the list lives in the day and agenda views.
 */
export function MonthView({
  period,
  items,
  today,
  state,
}: {
  period: CalendarPeriod;
  items: CalendarItem[];
  today: IsoDay;
  state: CalendarState;
}) {
  const weeks = monthWeeks(period);
  const byDay = itemsByDay(items, weeks.flat());
  const month = period.anchor.slice(0, 7);
  const dayHref = (day: IsoDay) => calendarHref({ ...state, view: "day", date: day, page: undefined });

  return (
    <table className="w-full table-fixed border-collapse">
      <caption className="sr-only">Calendario de {period.label}</caption>
      <thead>
        <tr>
          {weeks[0].map((day) => (
            <th key={day} scope="col" className="border-b border-line py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              {weekdayShort(day)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week[0]}>
            {week.map((day) => {
              const dayItems = byDay.get(day) ?? [];
              const hidden = dayItems.length - MONTH_VISIBLE_ITEMS;
              const outside = day.slice(0, 7) !== month;
              const isToday = day === today;
              const weekend = weekdayIndex(day) >= 5;
              return (
                <td
                  key={day}
                  className={`h-20 border-b border-r border-line p-1 align-top last:border-r-0 sm:h-28 sm:p-1.5 ${
                    outside ? "bg-surface-muted/60" : weekend ? "bg-surface-muted/25" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-0.5 gap-y-1">
                    <Link
                      href={dayHref(day)}
                      aria-label={`${formatDayHeading(day)}${isToday ? " (hoy)" : ""}: ${pluralize(dayItems.length, "elemento", "elementos")}`}
                      aria-current={isToday ? "date" : undefined}
                      className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums outline-none sm:size-7 focus-visible:ring-2 focus-visible:ring-accent ${
                        isToday ? "bg-accent text-accent-ink" : outside ? "text-ink-subtle hover:bg-surface-muted" : "text-ink hover:bg-surface-muted"
                      }`}
                    >
                      {Number(day.slice(8))}
                    </Link>
                    {dayItems.length > 0 && (
                      <span aria-hidden="true" className="shrink-0 rounded-full bg-surface-muted px-1.5 text-[10px] font-semibold tabular-nums text-ink-muted sm:hidden">
                        {dayItems.length}
                      </span>
                    )}
                  </div>
                  {dayItems.length > 0 && (
                    <ul className="mt-1 hidden flex-col gap-0.5 sm:flex">
                      {dayItems.slice(0, MONTH_VISIBLE_ITEMS).map((item) => (
                        <li key={item.key} className="min-w-0">
                          <ItemChip item={item} />
                        </li>
                      ))}
                      {hidden > 0 && (
                        <li>
                          <Link
                            href={dayHref(day)}
                            aria-label={`Ver ${pluralize(hidden, "elemento más", "elementos más")} del ${formatDayHeading(day)}`}
                            className="block rounded px-1.5 text-xs font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            +{hidden} más
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
