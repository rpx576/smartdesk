import type { Metadata } from "next";
import Link from "next/link";
import { todayIsoDay } from "@/lib/dates";
import { getAppContext } from "@/server/auth/organization-context";
import { calendarCapabilities } from "@/server/auth/permissions";
import { ForbiddenError } from "@/server/errors/app-error";
import { calendarEventService } from "@/server/services/calendar-event.service";
import { calendarQuerySchema } from "@/server/validation/calendar-event.schema";
import { CalendarIcon, LockIcon, PlusIcon, SearchIcon } from "../_components/icons";
import { NoOrganization } from "../_components/no-organization";
import { Notice } from "../_components/notice";
import { buttonClass, Card, EmptyState, PageHeader } from "../_components/ui";
import { AgendaView } from "./_components/agenda-view";
import { CalendarFilters } from "./_components/calendar-filters";
import { CalendarLegend } from "./_components/calendar-items";
import { CalendarToolbar } from "./_components/calendar-toolbar";
import { MonthView } from "./_components/month-view";
import { DayList, TimeGrid } from "./_components/time-grid";
import { noticeMessage } from "./form-data";
import { activeFilterCount, calendarHref, daysBetween, periodFor, type CalendarState } from "./view-model";

export const metadata: Metadata = { title: "Calendario · SmartDesk" };

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  const params = await searchParams;
  const notice = noticeMessage(params.notice);
  // Invalid query strings fall back to this month without filters instead of erroring.
  const query = calendarQuerySchema.safeParse(params);
  const { view = "month", date, page, ...filter } = query.success ? query.data : { page: 1 };
  const today = todayIsoDay();
  const period = periodFor(view, date ?? today);
  const state: CalendarState = { ...filter, view, date: period.anchor, page };

  let calendar;
  let options;
  try {
    // Both calls authorize `calendar:read` against the active organization.
    [calendar, options] = await Promise.all([
      calendarEventService.getCalendar(user, organization.id, { from: period.from, to: period.to }, filter),
      calendarEventService.formOptions(user, organization.id),
    ]);
  } catch (error) {
    if (!(error instanceof ForbiddenError)) throw error;
    return (
      <>
        <PageHeader title="Calendario" />
        <Card>
          <EmptyState
            icon={LockIcon}
            title="Sin acceso al calendario"
            description="Tu rol en esta organización no permite consultar el calendario."
          />
        </Card>
      </>
    );
  }

  const { canCreate } = calendarCapabilities(organization.role);
  const { items, truncated } = calendar;
  const filtered = activeFilterCount(filter) > 0;
  const newHref = `/calendar/new?date=${view === "month" || view === "agenda" ? (period.anchor.slice(0, 7) === today.slice(0, 7) ? today : period.anchor) : period.anchor}`;

  return (
    <>
      {notice && <Notice message={notice} />}
      <PageHeader
        title="Calendario"
        description={`Eventos y fechas de las tareas de ${organization.name}.`}
        action={
          canCreate && (
            <Link href={newHref} className={buttonClass.primary}>
              <PlusIcon className="size-4" />
              Nuevo evento
            </Link>
          )
        }
      />
      <Card className="min-w-0 overflow-hidden">
        <CalendarToolbar period={period} state={state} today={today} />
        <CalendarFilters filter={filter} view={view} date={period.anchor} projects={options.projects} users={options.assignees} />
        {truncated && (
          <p role="status" className="border-b border-line bg-danger-soft px-5 py-2 text-sm text-danger">
            Hay demasiados elementos en este periodo: se muestran solo los primeros. Usa los filtros para acotar.
          </p>
        )}

        {view === "agenda" && items.length === 0 ? (
          <EmptyState
            icon={filtered ? SearchIcon : CalendarIcon}
            title={filtered ? "Sin resultados" : "Nada programado este mes"}
            description={filtered ? "Ningún evento ni tarea coincide con los filtros." : "Crea un evento o pon fechas a tus tareas."}
            action={
              filtered ? (
                <Link href={calendarHref({ view, date: period.anchor })} className={buttonClass.secondary}>
                  Quitar filtros
                </Link>
              ) : undefined
            }
          />
        ) : view === "agenda" ? (
          <AgendaView period={period} items={items} today={today} state={state} />
        ) : view === "month" ? (
          <MonthView period={period} items={items} today={today} state={state} />
        ) : view === "week" ? (
          <>
            <div className="hidden md:block">
              <TimeGrid days={daysBetween(period.from, period.to)} items={items} today={today} state={state} />
            </div>
            <div className="md:hidden">
              <DayList days={daysBetween(period.from, period.to)} items={items} today={today} />
            </div>
          </>
        ) : (
          <TimeGrid days={[period.from]} items={items} today={today} state={state} />
        )}

        <div className="border-t border-line px-4 py-3 sm:px-5">
          <CalendarLegend />
        </div>
      </Card>
    </>
  );
}
