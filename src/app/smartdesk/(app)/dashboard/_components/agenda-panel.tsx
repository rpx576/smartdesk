import Link from "next/link";
import { formatDay, taskStatusLabels } from "@/lib/format";
import type { CalendarTask, UpcomingEvent } from "@/server/domain/calendar-event";
import { UpcomingEventsList } from "../../calendar/_components/upcoming-events";
import { ArrowRightIcon, CalendarIcon } from "../../_components/icons";
import { Card, CardHeader, TextLink } from "../../_components/ui";

/** The signed-in member's next events and the tasks assigned to them that are due this week. */
export function AgendaPanel({ events, deadlines }: { events: UpcomingEvent[]; deadlines: CalendarTask[] | null }) {
  const empty = events.length === 0 && (deadlines?.length ?? 0) === 0;
  return (
    <section aria-labelledby="my-agenda">
      <Card>
        <CardHeader
          id="my-agenda"
          title="Tu agenda"
          description="Tus próximos eventos y vencimientos de los próximos 7 días"
          action={
            <TextLink href="/smartdesk/calendar?view=agenda&mine=1">
              Calendario
              <ArrowRightIcon className="size-4" />
            </TextLink>
          }
        />
        {empty ? (
          <div className="flex items-center gap-3 px-5 py-6 text-sm text-ink-muted">
            <CalendarIcon className="size-5 shrink-0 text-ink-subtle" />
            No tienes eventos ni vencimientos próximos.
          </div>
        ) : (
          <>
            {events.length > 0 && (
              <>
                <h3 className="px-5 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-subtle">Próximos eventos</h3>
                <UpcomingEventsList events={events} />
              </>
            )}
            {deadlines && deadlines.length > 0 && (
              <>
                <h3 className="border-t border-line px-5 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Próximos vencimientos
                </h3>
                <ul className="divide-y divide-line">
                  {deadlines.map((task) => (
                    <li key={task.id}>
                      <Link
                        href={`/smartdesk/tasks/${task.id}`}
                        className="flex min-w-0 items-center gap-3 px-5 py-3 outline-none hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                      >
                        <span className="w-20 shrink-0 text-xs font-semibold text-ink">{task.dueDate && formatDay(task.dueDate)}</span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium text-ink">{task.title}</span>
                          <span className="truncate text-xs text-ink-muted">
                            {task.project.name} · {taskStatusLabels[task.status]}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </Card>
    </section>
  );
}
