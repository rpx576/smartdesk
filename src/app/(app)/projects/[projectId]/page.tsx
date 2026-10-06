import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { z } from "zod";
import { todayCalendarDate } from "@/lib/dates";
import { formatCurrency, formatDate, formatDay, formatHours } from "@/lib/format";
import { getAppContext } from "@/server/auth/organization-context";
import { projectCapabilities, taskCapabilities } from "@/server/auth/permissions";
import { ForbiddenError, NotFoundError } from "@/server/errors/app-error";
import { projectService } from "@/server/services/project.service";
import { taskService } from "@/server/services/task.service";
import { ConfirmDeleteButton } from "../../_components/confirm-delete-button";
import { ArrowLeftIcon, CheckSquareIcon, LockIcon, PencilIcon, PlusIcon } from "../../_components/icons";
import { NoOrganization } from "../../_components/no-organization";
import { Notice } from "../../_components/notice";
import { buttonClass, Card, CardHeader, EmptyState } from "../../_components/ui";
import { TasksTable } from "../../tasks/_components/tasks-table";
import { deleteProject } from "../actions";
import {
  ProgressBar,
  ProjectPriorityBadge,
  ProjectStatusBadge,
  progressHint,
} from "../_components/project-badges";
import { noticeMessage } from "../form-data";

export const metadata: Metadata = { title: "Proyecto · SmartDesk" };

/** Project sections: summary and tasks exist; the rest are planned for later phases. */
const SECTIONS = [
  { label: "Resumen", href: "#resumen" },
  { label: "Tareas", href: "#tareas" },
  { label: "Calendario" },
  { label: "Documentos" },
  { label: "Equipo" },
  { label: "Actividad" },
] as const;

const PROJECT_TASKS_LIMIT = 100;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-ink sm:col-span-2 sm:mt-0">
        {children ?? <span className="text-ink-subtle">—</span>}
      </dd>
    </div>
  );
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]">) {
  const { projectId } = await params;
  if (!z.uuid().safeParse(projectId).success) notFound();

  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  let project;
  try {
    // Scoped to the active organization: another tenant's id resolves to 404.
    project = await projectService.get(user, organization.id, projectId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (!(error instanceof ForbiddenError)) throw error;
    return (
      <Card>
        <EmptyState
          icon={LockIcon}
          title="Sin acceso a este proyecto"
          description="Tu rol en esta organización no permite consultar proyectos."
        />
      </Card>
    );
  }

  // UI hints only; the server authorizes edit/delete again.
  const { canWrite, canDelete } = projectCapabilities(organization.role);
  const taskCaps = taskCapabilities(organization.role);
  const notice = noticeMessage((await searchParams).notice);
  const owner = project.createdBy ? (project.createdBy.name ?? project.createdBy.email) : null;
  // Same tenant and permission checks as the task list (one query for the whole section).
  const tasks = taskCaps.canRead
    ? await taskService.listForProject(user, organization.id, project.id, PROJECT_TASKS_LIMIT)
    : null;

  return (
    <>
      {notice && <Notice message={notice} />}
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4" />
        Proyectos
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-words text-2xl font-semibold tracking-tight text-ink">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Cliente:{" "}
            <Link href={`/clients/${project.client.id}`} className="font-medium text-accent hover:underline">
              {project.client.name}
            </Link>
          </p>
        </div>
        {(canWrite || canDelete) && (
          <div className="flex gap-2">
            {canWrite && (
              <Link href={`/projects/${project.id}/edit`} className={buttonClass.secondary}>
                <PencilIcon className="size-4" />
                Editar
              </Link>
            )}
            {canDelete && (
              <ConfirmDeleteButton
                action={deleteProject}
                fields={{ projectId: project.id }}
                itemName={project.name}
                title="¿Eliminar este proyecto?"
                confirmLabel="Eliminar proyecto"
                consequence="También se eliminarán todas sus tareas. Esta acción no se puede deshacer."
              />
            )}
          </div>
        )}
      </div>

      {/* Section navigation: summary and tasks are on this page; the rest come in later phases. */}
      <nav aria-label="Secciones del proyecto" className="mb-6 overflow-x-auto border-b border-line">
        <ul className="flex min-w-max gap-1">
          {SECTIONS.map((section) =>
            "href" in section ? (
              <li key={section.label}>
                <a
                  href={section.href}
                  className="inline-block border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-ink-muted outline-none hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {section.label}
                  {section.label === "Tareas" && tasks && (
                    <span className="ml-1.5 rounded-full bg-surface-muted px-1.5 py-px text-[11px] tabular-nums text-ink-muted">
                      {tasks.length}
                    </span>
                  )}
                </a>
              </li>
            ) : (
              <li key={section.label}>
                <span
                  aria-disabled="true"
                  title="Próximamente"
                  className="inline-flex cursor-not-allowed items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-ink-subtle"
                >
                  {section.label}
                  <span className="rounded-full border border-line px-1.5 py-px text-[10px] uppercase tracking-wide">
                    Pronto
                  </span>
                </span>
              </li>
            ),
          )}
        </ul>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="min-w-0 scroll-mt-20 lg:col-span-2">
          <div id="resumen" className="scroll-mt-20" />
          <CardHeader title="Resumen" />
          <dl className="divide-y divide-line">
            <Field label="Descripción">
              {project.description && <p className="whitespace-pre-line">{project.description}</p>}
            </Field>
            <Field label="Cliente">{project.client.name}</Field>
            <Field label="Estado">
              <ProjectStatusBadge status={project.status} />
            </Field>
            <Field label="Prioridad">
              <ProjectPriorityBadge priority={project.priority} />
            </Field>
            <Field label="Responsable">{owner}</Field>
            <Field label="Fecha de inicio">{project.startDate && formatDay(project.startDate)}</Field>
            <Field label="Fecha prevista de finalización">
              {project.dueDate && formatDay(project.dueDate)}
            </Field>
            <Field label="Presupuesto">
              {project.budget === null ? null : formatCurrency(project.budget)}
            </Field>
            <Field label="Horas estimadas">
              {project.estimatedHours === null ? null : formatHours(project.estimatedHours)}
            </Field>
            <Field label="Creado">{formatDate(project.createdAt)}</Field>
            <Field label="Última actualización">{formatDate(project.updatedAt)}</Field>
          </dl>
        </Card>

        <Card className="h-fit min-w-0">
          <CardHeader title="Progreso" description="Tareas completadas sobre el total (sin contar canceladas)" />
          <div className="px-5 py-4">
            <ProgressBar value={project.progress} hint={progressHint(project)} />
            <p className="mt-3 text-xs text-ink-muted">
              {project.taskStats.considered === 0
                ? "Este proyecto todavía no tiene tareas."
                : `${progressHint(project).replace(/^./, (c) => c.toUpperCase())}.`}
            </p>
          </div>
        </Card>
      </div>

      {tasks && (
        <section id="tareas" aria-labelledby="project-tasks" className="mt-6 scroll-mt-20">
          <Card className="min-w-0">
            <CardHeader
              id="project-tasks"
              title="Tareas"
              description={`Trabajo de este proyecto${tasks.length >= PROJECT_TASKS_LIMIT ? ` (primeras ${PROJECT_TASKS_LIMIT})` : ""}`}
              action={
                taskCaps.canWrite ? (
                  <Link href={`/tasks/new?projectId=${project.id}`} className={buttonClass.primary}>
                    <PlusIcon className="size-4" />
                    Crear tarea
                  </Link>
                ) : undefined
              }
            />
            {tasks.length === 0 ? (
              <EmptyState
                icon={CheckSquareIcon}
                title="Este proyecto todavía no tiene tareas"
                description="Divide el trabajo en tareas y asígnalas a tu equipo para seguir el progreso."
              />
            ) : (
              <>
                <TasksTable
                  tasks={tasks}
                  today={todayCalendarDate()}
                  caption={`Tareas del proyecto ${project.name}`}
                  showProject={false}
                />
                <div className="border-t border-line px-5 py-3 text-sm">
                  <Link href={`/tasks?projectId=${project.id}`} className={buttonClass.ghost}>
                    Ver en el listado de tareas
                  </Link>
                </div>
              </>
            )}
          </Card>
        </section>
      )}
    </>
  );
}
