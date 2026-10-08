import Link from "next/link";
import type { ReactNode } from "react";
import { calendarEventTypeLabels, personLabel, taskStatusLabels } from "@/lib/format";
import {
  CALENDAR_EVENT_TYPES,
  type CalendarFilter,
  type CalendarFormOptions,
  type CalendarView,
} from "@/server/domain/calendar-event";
import { TASK_STATUSES } from "@/server/domain/task";
import { FilterIcon, SearchIcon } from "../../_components/icons";
import { buttonClass } from "../../_components/ui";
import { activeFilterCount, calendarHref } from "../view-model";

const controlClass =
  "w-full min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function Select({ label, name, value, children }: { label: string; name: string; value?: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      <select name={name} defaultValue={value ?? ""} className={controlClass}>
        {children}
      </select>
    </label>
  );
}

/**
 * Search and filters as a plain GET form: the query string drives
 * server-side, tenant-scoped queries (nothing is filtered in the browser).
 * The detailed filters fold away to keep the calendar visible on phones.
 */
export function CalendarFilters({
  filter,
  view,
  date,
  projects,
  users,
}: {
  filter: CalendarFilter;
  view: CalendarView;
  date: string;
  projects: CalendarFormOptions["projects"];
  users: CalendarFormOptions["assignees"];
}) {
  const count = activeFilterCount(filter);

  return (
    <form role="search" action="/smartdesk/calendar" className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:px-5">
      <input type="hidden" name="view" value={view} />
      <input type="hidden" name="date" value={date} />
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <label className="relative min-w-0 flex-1 basis-56">
          <span className="sr-only">Buscar en el calendario</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            name="search"
            defaultValue={filter.search}
            maxLength={200}
            placeholder="Buscar evento, tarea, proyecto o cliente"
            className={`${controlClass} pl-9 placeholder:text-ink-subtle`}
          />
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="mine"
            value="1"
            defaultChecked={filter.mine}
            className="size-4 rounded border-line accent-accent"
          />
          Mis elementos
        </label>
        <button type="submit" className={buttonClass.secondary}>
          Aplicar
        </button>
        {count > 0 && (
          <Link
            href={calendarHref({ view, date })}
            className="rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            Limpiar filtros
          </Link>
        )}
      </div>

      <details className="group" open={Boolean(filter.show || filter.projectId || filter.userId || filter.eventType || filter.taskStatus)}>
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
          <FilterIcon className="size-4" />
          Más filtros
          {count > 0 && (
            <span className="rounded-full bg-accent-soft px-1.5 py-px text-[11px] font-semibold text-accent">
              {count} {count === 1 ? "activo" : "activos"}
            </span>
          )}
        </summary>
        <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2.5 min-[420px]:grid-cols-2 lg:grid-cols-5">
          <Select label="Mostrar" name="show" value={filter.show}>
            <option value="">Todos</option>
            <option value="events">Eventos</option>
            <option value="tasks">Tareas</option>
          </Select>
          <Select label="Proyecto" name="projectId" value={filter.projectId}>
            <option value="">Todos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select label="Usuario" name="userId" value={filter.userId}>
            <option value="">Todos</option>
            {users.map((person) => (
              <option key={person.id} value={person.id}>
                {personLabel(person)}
              </option>
            ))}
          </Select>
          <Select label="Tipo de evento" name="eventType" value={filter.eventType}>
            <option value="">Todos</option>
            {CALENDAR_EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {calendarEventTypeLabels[type]}
              </option>
            ))}
          </Select>
          <Select label="Estado de tarea" name="taskStatus" value={filter.taskStatus}>
            <option value="">Activas y completadas</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {taskStatusLabels[status]}
              </option>
            ))}
          </Select>
        </div>
      </details>
    </form>
  );
}
