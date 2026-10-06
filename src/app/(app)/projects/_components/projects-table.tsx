import Link from "next/link";
import { formatDay } from "@/lib/format";
import type { Project } from "@/server/domain/project";
import { ConfirmDeleteButton } from "../../_components/confirm-delete-button";
import { ArrowRightIcon, PencilIcon } from "../../_components/icons";
import { deleteProject } from "../actions";
import { ProgressBar, ProjectPriorityBadge, ProjectStatusBadge, progressHint } from "./project-badges";

type Props = {
  projects: Project[];
  /** Purely presentational: the server authorizes every edit/delete again. */
  actions: { edit: boolean; delete: boolean };
  /** Current list position, so deleting a row returns to the same view. */
  listState: { search?: string; status?: string; priority?: string; clientId?: string; page: number };
};

const actionClass =
  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent";

const dash = <span className="text-ink-subtle">—</span>;

function personName(project: Project) {
  return project.createdBy ? (project.createdBy.name ?? project.createdBy.email) : null;
}

/** Project rows; secondary columns collapse into the first cell on small screens. */
export function ProjectsTable({ projects, actions, listState }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Proyectos de la organización</caption>
        <thead>
          <tr className="whitespace-nowrap border-b border-line text-xs font-medium uppercase tracking-wide text-ink-subtle">
            <th scope="col" className="px-5 py-3 font-medium">Proyecto</th>
            <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">Cliente</th>
            <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">Estado</th>
            <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Prioridad</th>
            <th scope="col" className="hidden px-5 py-3 font-medium 2xl:table-cell">Responsable</th>
            <th scope="col" className="hidden px-5 py-3 font-medium 2xl:table-cell">Inicio</th>
            <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Fecha límite</th>
            <th scope="col" className="hidden px-5 py-3 font-medium xl:table-cell">Progreso</th>
            <th scope="col" className="px-5 py-3 text-right font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {projects.map((project) => (
            <tr key={project.id} className="transition-colors hover:bg-surface-muted/60">
              <td className="w-full max-w-0 px-5 py-3.5 sm:w-auto sm:max-w-xs">
                <Link
                  href={`/projects/${project.id}`}
                  className="block truncate rounded font-medium text-ink outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {project.name}
                </Link>
                <p className="mt-0.5 truncate text-xs text-ink-muted md:hidden">{project.client.name}</p>
                <div className="mt-1.5 flex items-center gap-3 sm:hidden">
                  <ProjectStatusBadge status={project.status} />
                  <ProjectPriorityBadge priority={project.priority} />
                </div>
              </td>
              <td className="hidden max-w-48 truncate px-5 py-3.5 text-ink-muted md:table-cell">
                {project.client.name}
              </td>
              <td className="hidden px-5 py-3.5 sm:table-cell">
                <ProjectStatusBadge status={project.status} />
              </td>
              <td className="hidden px-5 py-3.5 lg:table-cell">
                <ProjectPriorityBadge priority={project.priority} />
              </td>
              <td className="hidden max-w-40 truncate px-5 py-3.5 text-ink-muted 2xl:table-cell">
                {personName(project) ?? dash}
              </td>
              <td className="hidden whitespace-nowrap px-5 py-3.5 text-ink-muted 2xl:table-cell">
                {project.startDate ? (
                  <time dateTime={project.startDate.toISOString().slice(0, 10)}>{formatDay(project.startDate)}</time>
                ) : (
                  dash
                )}
              </td>
              <td className="hidden whitespace-nowrap px-5 py-3.5 text-ink-muted lg:table-cell">
                {project.dueDate ? (
                  <time dateTime={project.dueDate.toISOString().slice(0, 10)}>{formatDay(project.dueDate)}</time>
                ) : (
                  dash
                )}
              </td>
              <td className="hidden px-5 py-3.5 xl:table-cell">
                <ProgressBar value={project.progress} hint={progressHint(project)} />
              </td>
              <td className="px-3 py-3.5 text-right sm:px-5">
                <div className="flex items-center justify-end gap-0.5">
                  <Link
                    href={`/projects/${project.id}`}
                    className={`${actionClass} text-accent hover:bg-accent-soft`}
                    aria-label={`Ver ${project.name}`}
                    title="Ver"
                  >
                    <span className={actions.edit || actions.delete ? "hidden 2xl:inline" : ""}>Ver</span>
                    <ArrowRightIcon className="size-4" />
                  </Link>
                  {actions.edit && (
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className={`${actionClass} text-ink-muted hover:bg-surface-muted hover:text-ink`}
                      aria-label={`Editar ${project.name}`}
                      title="Editar"
                    >
                      <PencilIcon className="size-4" />
                    </Link>
                  )}
                  {actions.delete && (
                    <ConfirmDeleteButton
                      variant="icon"
                      action={deleteProject}
                      fields={{ projectId: project.id, ...listState }}
                      itemName={project.name}
                      title="¿Eliminar este proyecto?"
                      confirmLabel="Eliminar proyecto"
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
