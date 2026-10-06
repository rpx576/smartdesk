import Link from "next/link";
import { projectPriorityLabels, projectStatusLabels } from "@/lib/format";
import type { ClientOption } from "@/server/domain/client";
import { PROJECT_PRIORITIES, PROJECT_STATUSES, type ProjectListFilter } from "@/server/domain/project";
import { SearchIcon } from "../../_components/icons";
import { buttonClass } from "../../_components/ui";

const selectClass =
  "min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

/**
 * Search + filters as a plain GET form: the query string drives a
 * server-side, tenant-scoped query (nothing is filtered in the browser).
 */
export function ProjectFilters({
  filter,
  clients,
}: {
  filter: Omit<ProjectListFilter, "page" | "pageSize">;
  clients: ClientOption[];
}) {
  const active = Boolean(filter.search || filter.status || filter.priority || filter.clientId);

  return (
    <form role="search" action="/projects" className="flex flex-col gap-3 border-b border-line px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-60">
          <span className="sr-only">Buscar proyectos</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            name="search"
            defaultValue={filter.search}
            maxLength={200}
            placeholder="Buscar por proyecto o cliente"
            className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <button type="submit" className={buttonClass.secondary}>
          Buscar
        </button>
        {active && (
          <Link
            href="/projects"
            className="rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            Limpiar filtros
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Estado</span>
          <select name="status" defaultValue={filter.status ?? ""} className={selectClass}>
            <option value="">Todos</option>
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {projectStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Prioridad</span>
          <select name="priority" defaultValue={filter.priority ?? ""} className={selectClass}>
            <option value="">Todas</option>
            {PROJECT_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {projectPriorityLabels[priority]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Cliente</span>
          <select name="clientId" defaultValue={filter.clientId ?? ""} className={selectClass}>
            <option value="">Todos</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </form>
  );
}
