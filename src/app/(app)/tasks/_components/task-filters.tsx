import Link from "next/link";
import { personLabel, taskPriorityLabels, taskSortLabels, taskStatusLabels } from "@/lib/format";
import {
  TASK_PRIORITIES,
  TASK_SORTS,
  TASK_STATUSES,
  type AssigneeOption,
  type ProjectOption,
  type TaskListFilter,
} from "@/server/domain/task";
import { SearchIcon } from "../../_components/icons";
import { buttonClass } from "../../_components/ui";

const controlClass =
  "w-full min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

const day = (date?: Date) => (date ? date.toISOString().slice(0, 10) : "");

function Select({ label, name, value, children }: { label: string; name: string; value?: string; children: React.ReactNode }) {
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
 * Search, filters and sort as a plain GET form: the query string drives a
 * server-side, tenant-scoped query (nothing is filtered in the browser).
 */
export function TaskFilters({
  filter,
  projects,
  assignees,
}: {
  filter: Omit<TaskListFilter, "page" | "pageSize">;
  projects: ProjectOption[];
  assignees: AssigneeOption[];
}) {
  const active = Boolean(
    filter.search || filter.status || filter.priority || filter.projectId || filter.assigneeId || filter.dueFrom || filter.dueTo,
  );

  return (
    <form role="search" action="/tasks" className="flex flex-col gap-3 border-b border-line px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-60">
          <span className="sr-only">Buscar tareas</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            name="search"
            defaultValue={filter.search}
            maxLength={200}
            placeholder="Buscar por tarea o proyecto"
            className={`${controlClass} pl-9 placeholder:text-ink-subtle`}
          />
        </label>
        <button type="submit" className={buttonClass.secondary}>
          Aplicar
        </button>
        {active && (
          <Link
            href={filter.sort ? `/tasks?sort=${filter.sort}` : "/tasks"}
            className="rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            Limpiar filtros
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 lg:grid-cols-4">
        <Select label="Proyecto" name="projectId" value={filter.projectId}>
          <option value="">Todos</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <Select label="Responsable" name="assigneeId" value={filter.assigneeId}>
          <option value="">Todos</option>
          {assignees.map((person) => (
            <option key={person.id} value={person.id}>
              {personLabel(person)}
            </option>
          ))}
        </Select>
        <Select label="Estado" name="status" value={filter.status}>
          <option value="">Todos</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {taskStatusLabels[status]}
            </option>
          ))}
        </Select>
        <Select label="Prioridad" name="priority" value={filter.priority}>
          <option value="">Todas</option>
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {taskPriorityLabels[priority]}
            </option>
          ))}
        </Select>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Fecha límite desde</span>
          <input type="date" name="dueFrom" defaultValue={day(filter.dueFrom)} className={controlClass} />
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Fecha límite hasta</span>
          <input type="date" name="dueTo" defaultValue={day(filter.dueTo)} className={controlClass} />
        </label>
        <Select label="Ordenar por" name="sort" value={filter.sort ?? "recent"}>
          {TASK_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {taskSortLabels[sort]}
            </option>
          ))}
        </Select>
      </div>
    </form>
  );
}
