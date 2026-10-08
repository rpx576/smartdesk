import Link from "next/link";
import type { IsoDay } from "@/lib/dates";
import type { CalendarView } from "@/server/domain/calendar-event";
import { ChevronLeftIcon, ChevronRightIcon } from "../../_components/icons";
import { buttonClass } from "../../_components/ui";
import { calendarHref, type CalendarPeriod, type CalendarState } from "../view-model";

const VIEW_LABELS: Record<CalendarView, string> = { month: "Mes", week: "Semana", day: "Día", agenda: "Agenda" };
const PERIOD_NAMES: Record<CalendarView, [string, string]> = {
  month: ["Mes anterior", "Mes siguiente"],
  week: ["Semana anterior", "Semana siguiente"],
  day: ["Día anterior", "Día siguiente"],
  agenda: ["Mes anterior", "Mes siguiente"],
};

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent";

/**
 * Previous / Today / Next, the current period and the view switcher. Plain
 * links (they work without JavaScript and keep the filters in the URL).
 */
export function CalendarToolbar({
  period,
  state,
  today,
}: {
  period: CalendarPeriod;
  /** Filters to keep when navigating. */
  state: CalendarState;
  today: IsoDay;
}) {
  const [previousLabel, nextLabel] = PERIOD_NAMES[period.view];
  const link = (changes: CalendarState) => calendarHref({ ...state, view: period.view, date: period.anchor, page: undefined, ...changes });

  return (
    <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <nav aria-label="Navegación del calendario" className="flex shrink-0 items-center gap-1.5">
          <Link href={link({ date: period.previous })} className={iconButton} aria-label={previousLabel} title={previousLabel}>
            <ChevronLeftIcon className="size-4" />
          </Link>
          <Link href={link({ date: today })} className={`${buttonClass.secondary} h-9 px-3`}>
            Hoy
          </Link>
          <Link href={link({ date: period.next })} className={iconButton} aria-label={nextLabel} title={nextLabel}>
            <ChevronRightIcon className="size-4" />
          </Link>
        </nav>
        <h2 className="ml-1 min-w-0 truncate text-base font-semibold text-ink sm:text-lg" aria-live="polite">
          {period.label}
        </h2>
      </div>

      <nav aria-label="Vista del calendario">
        <ul className="grid grid-cols-4 rounded-lg border border-line bg-surface-muted p-0.5 text-sm">
          {(Object.keys(VIEW_LABELS) as CalendarView[]).map((view) => {
            const active = view === period.view;
            return (
              <li key={view}>
                <Link
                  href={link({ view })}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-md px-3 py-1.5 text-center font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {VIEW_LABELS[view]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
