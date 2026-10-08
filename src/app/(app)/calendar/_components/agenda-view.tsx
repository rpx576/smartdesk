import Link from "next/link";
import type { IsoDay } from "@/lib/dates";
import { formatDayHeading, formatNumber } from "@/lib/format";
import type { CalendarItem } from "@/server/domain/calendar-event";
import { buttonClass } from "../../_components/ui";
import { agendaPage, calendarHref, type CalendarPeriod, type CalendarState } from "../view-model";
import { ItemRow } from "./calendar-items";

/** Chronological list grouped by day, paginated. The most usable view on phones. */
export function AgendaView({
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
  const { groups, page, totalPages, total } = agendaPage(items, period.from, state.page ?? 1);
  const pageHref = (target: number) => calendarHref({ ...state, view: "agenda", date: period.anchor, page: target });

  return (
    <>
      <ol aria-label={`Agenda de ${period.label}`} className="divide-y divide-line">
        {groups.map(({ day, items: dayItems }) => (
          <li key={day} className="px-4 py-3 sm:px-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <time dateTime={day}>{formatDayHeading(day)}</time>
              {day === today && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">Hoy</span>}
            </h3>
            <ul className="flex flex-col gap-1.5">
              {dayItems.map((item) => (
                <li key={item.key}>
                  <ItemRow item={item} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {totalPages > 1 && (
        <nav
          aria-label="Paginación de la agenda"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-ink-muted sm:px-5"
        >
          <p>
            {formatNumber(total)} elementos · Página {formatNumber(page)} de {formatNumber(totalPages)}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageHref(page - 1)} className={buttonClass.secondary} rel="prev">
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link href={pageHref(page + 1)} className={buttonClass.secondary} rel="next">
                Siguiente
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
