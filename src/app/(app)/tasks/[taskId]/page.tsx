import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { z } from "zod";
import { todayCalendarDate } from "@/lib/dates";
import { formatDate, formatDateTime, formatDay, formatHours, personLabel } from "@/lib/format";
import { getAppContext } from "@/server/auth/organization-context";
import { taskCapabilities } from "@/server/auth/permissions";
import { ForbiddenError, NotFoundError } from "@/server/errors/app-error";
import { taskService } from "@/server/services/task.service";
import { ConfirmDeleteButton } from "../../_components/confirm-delete-button";
import { ArrowLeftIcon, LockIcon, PencilIcon } from "../../_components/icons";
import { NoOrganization } from "../../_components/no-organization";
import { Notice } from "../../_components/notice";
import { PriorityBadge } from "../../_components/priority-badge";
import { buttonClass, Card, CardHeader, EmptyState } from "../../_components/ui";
import { assignTask, changeTaskPriority, changeTaskStatus, deleteTask } from "../actions";
import { QuickUpdate } from "../_components/quick-update";
import { DueDate, TaskStatusBadge } from "../_components/task-badges";
import { noticeMessage } from "../form-data";

export const metadata: Metadata = { title: "Tarea · SmartDesk" };

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="mt-1 min-w-0 break-words text-sm text-ink sm:col-span-2 sm:mt-0">
        {children ?? <span className="text-ink-subtle">—</span>}
      </dd>
    </div>
  );
}

export default async function TaskDetailPage({ params, searchParams }: PageProps<"/tasks/[taskId]">) {
  const { taskId } = await params;
  if (!z.uuid().safeParse(taskId).success) notFound();

  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  // UI hints only; the server authorizes every change again.
  const { canWrite, canDelete } = taskCapabilities(organization.role);

  let task;
  let assignees;
  try {
    // Scoped to the active organization: another tenant's id resolves to 404.
    [task, assignees] = await Promise.all([
      taskService.get(user, organization.id, taskId),
      canWrite ? taskService.formOptions(user, organization.id).then((o) => o.assignees) : Promise.resolve([]),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (!(error instanceof ForbiddenError)) throw error;
    return (
      <Card>
        <EmptyState
          icon={LockIcon}
          title="Sin acceso a esta tarea"
          description="Tu rol en esta organización no permite consultar tareas."
        />
      </Card>
    );
  }

  const notice = noticeMessage((await searchParams).notice);

  return (
    <>
      {notice && <Notice message={notice} />}
      <Link
        href="/tasks"
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4" />
        Tareas
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-words text-2xl font-semibold tracking-tight text-ink">{task.title}</h1>
            <TaskStatusBadge status={task.status} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Proyecto:{" "}
            <Link href={`/projects/${task.project.id}`} className="font-medium text-accent hover:underline">
              {task.project.name}
            </Link>
            {" · "}Cliente:{" "}
            <Link href={`/clients/${task.project.client.id}`} className="font-medium text-accent hover:underline">
              {task.project.client.name}
            </Link>
          </p>
        </div>
        {(canWrite || canDelete) && (
          <div className="flex gap-2">
            {canWrite && (
              <Link href={`/tasks/${task.id}/edit`} className={buttonClass.secondary}>
                <PencilIcon className="size-4" />
                Editar
              </Link>
            )}
            {canDelete && (
              <ConfirmDeleteButton
                action={deleteTask}
                fields={{ taskId: task.id }}
                itemName={task.title}
                title="¿Eliminar esta tarea?"
                confirmLabel="Eliminar tarea"
              />
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader title="Detalle" />
          <dl className="divide-y divide-line">
            <Field label="Descripción">
              {task.description && <p className="whitespace-pre-line">{task.description}</p>}
            </Field>
            <Field label="Proyecto">{task.project.name}</Field>
            <Field label="Cliente">{task.project.client.name}</Field>
            <Field label="Responsable">{personLabel(task.assignee)}</Field>
            <Field label="Estado">
              <TaskStatusBadge status={task.status} />
            </Field>
            <Field label="Prioridad">
              <PriorityBadge priority={task.priority} />
            </Field>
            <Field label="Fecha de inicio">{task.startDate && formatDay(task.startDate)}</Field>
            <Field label="Fecha límite">
              {task.dueDate ? <DueDate task={task} today={todayCalendarDate()} /> : null}
            </Field>
            <Field label="Horas estimadas">
              {task.estimatedHours === null ? null : formatHours(task.estimatedHours)}
            </Field>
            <Field label="Horas reales">{task.actualHours === null ? null : formatHours(task.actualHours)}</Field>
            <Field label="Finalizada">{task.completedAt && formatDateTime(task.completedAt)}</Field>
            <Field label="Creada">
              {formatDate(task.createdAt)}
              {task.createdBy && <span className="text-ink-muted"> · por {personLabel(task.createdBy)}</span>}
            </Field>
            <Field label="Última actualización">{formatDate(task.updatedAt)}</Field>
          </dl>
        </Card>

        {canWrite && (
          <Card className="h-fit min-w-0">
            <CardHeader title="Gestión rápida" description="Cambia estado, prioridad o responsable" />
            <QuickUpdate
              status={task.status}
              priority={task.priority}
              assigneeId={task.assigneeId}
              assignees={assignees}
              // Each action is bound to this task id; the id is re-validated on the server.
              changeStatus={changeTaskStatus.bind(null, task.id)}
              changePriority={changeTaskPriority.bind(null, task.id)}
              assign={assignTask.bind(null, task.id)}
            />
          </Card>
        )}
      </div>
    </>
  );
}
