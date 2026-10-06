import Link from "next/link";
import { formatDate, personLabel } from "@/lib/format";
import type { Task } from "@/server/domain/task";
import { ConfirmDeleteButton } from "../../_components/confirm-delete-button";
import { ArrowRightIcon, PencilIcon } from "../../_components/icons";
import { PriorityBadge } from "../../_components/priority-badge";
import { deleteTask } from "../actions";
import { DueDate, TaskStatusBadge } from "./task-badges";

type Props = {
  tasks: Task[];
  /** Calendar date used to flag overdue tasks. */
  today: Date;
  caption: string;
  /** Purely presentational: the server authorizes every edit/delete again. */
  actions?: { edit: boolean; delete: boolean };
  /** Current list position, so deleting a row returns to the same view. */
  listState?: Record<string, string | number | undefined>;
  /** Inside a project page the project column is redundant. */
  showProject?: boolean;
};

const actionClass =
  "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent";

/** Task rows; secondary columns collapse into the first cell on small screens. */
export function TasksTable({ tasks, today, caption, actions, listState, showProject = true }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="whitespace-nowrap border-b border-line text-xs font-medium uppercase tracking-wide text-ink-subtle">
            <th scope="col" className="px-5 py-3 font-medium">Tarea</th>
            {showProject && <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Proyecto</th>}
            <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">Responsable</th>
            <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">Estado</th>
            <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Prioridad</th>
            <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">Fecha límite</th>
            {showProject && <th scope="col" className="hidden px-5 py-3 font-medium 2xl:table-cell">Creación</th>}
            <th scope="col" className="px-5 py-3 text-right font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {tasks.map((task) => (
            <tr key={task.id} className="transition-colors hover:bg-surface-muted/60">
              <td className="w-full max-w-0 px-5 py-3.5 sm:w-auto sm:max-w-56 xl:max-w-64">
                <Link
                  href={`/tasks/${task.id}`}
                  className="block truncate rounded font-medium text-ink outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {task.title}
                </Link>
                {/* Collapsed details for small screens. */}
                <p className="mt-0.5 truncate text-xs text-ink-muted md:hidden">
                  {[showProject ? task.project.name : null, personLabel(task.assignee)].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 sm:hidden">
                  <TaskStatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="mt-1 text-xs text-ink-muted md:hidden">
                  {task.dueDate && <DueDate task={task} today={today} />}
                </div>
              </td>
              {showProject && (
                <td className="hidden max-w-40 px-5 py-3.5 lg:table-cell">
                  <Link href={`/projects/${task.project.id}`} className="block truncate text-ink-muted hover:text-accent hover:underline">
                    {task.project.name}
                  </Link>
                </td>
              )}
              <td className="hidden max-w-36 truncate px-5 py-3.5 text-ink-muted md:table-cell">
                {personLabel(task.assignee)}
              </td>
              <td className="hidden px-5 py-3.5 sm:table-cell">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className="hidden px-5 py-3.5 lg:table-cell">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="hidden px-5 py-3.5 text-ink-muted md:table-cell">
                <DueDate task={task} today={today} />
              </td>
              {showProject && (
                <td className="hidden whitespace-nowrap px-5 py-3.5 text-ink-muted 2xl:table-cell">
                  <time dateTime={task.createdAt.toISOString()}>{formatDate(task.createdAt)}</time>
                </td>
              )}
              <td className="px-3 py-3.5 text-right sm:pl-2 sm:pr-4">
                <div className="flex items-center justify-end gap-0.5">
                  <Link
                    href={`/tasks/${task.id}`}
                    className={`${actionClass} text-accent hover:bg-accent-soft`}
                    aria-label={`Ver ${task.title}`}
                    title="Ver"
                  >
                    <ArrowRightIcon className="size-4" />
                  </Link>
                  {actions?.edit && (
                    <Link
                      href={`/tasks/${task.id}/edit`}
                      className={`${actionClass} text-ink-muted hover:bg-surface-muted hover:text-ink`}
                      aria-label={`Editar ${task.title}`}
                      title="Editar"
                    >
                      <PencilIcon className="size-4" />
                    </Link>
                  )}
                  {actions?.delete && (
                    <ConfirmDeleteButton
                      variant="icon"
                      action={deleteTask}
                      fields={{ taskId: task.id, ...listState }}
                      itemName={task.title}
                      title="¿Eliminar esta tarea?"
                      confirmLabel="Eliminar tarea"
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
