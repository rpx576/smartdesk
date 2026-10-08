import Link from "next/link";
import { zonedDay } from "@/lib/dates";
import { formatDayShort, formatTimeRange } from "@/lib/format";
import type { UpcomingEvent } from "@/server/domain/calendar-event";
import { MapPinIcon } from "../../_components/icons";
import { EventTypeBadge } from "./calendar-items";

/** Short list of upcoming events (dashboard, project page). */
export function UpcomingEventsList({ events, showProject = true }: { events: UpcomingEvent[]; showProject?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {events.map((event) => (
        <li key={event.id}>
          <Link
            href={`/smartdesk/calendar/${event.id}`}
            className="flex min-w-0 gap-3 px-5 py-3 outline-none hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
          >
            <span className="w-20 shrink-0 text-xs text-ink-muted">
              <span className="block font-semibold text-ink">{formatDayShort(zonedDay(event.startDateTime))}</span>
              <span className="tabular-nums">{formatTimeRange(event.startDateTime, event.endDateTime, event.allDay)}</span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium text-ink">{event.title}</span>
              <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                <EventTypeBadge type={event.type} />
                {showProject && event.project && <span className="min-w-0 truncate">{event.project.name}</span>}
                {event.location && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <MapPinIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </span>
                )}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
