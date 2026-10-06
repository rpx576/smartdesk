import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getAppContext } from "@/server/auth/organization-context";
import { taskCapabilities } from "@/server/auth/permissions";
import { ForbiddenError, NotFoundError } from "@/server/errors/app-error";
import { taskService } from "@/server/services/task.service";
import { ArrowLeftIcon, LockIcon } from "../../../_components/icons";
import { NoOrganization } from "../../../_components/no-organization";
import { Card, EmptyState, PageHeader } from "../../../_components/ui";
import { TaskForm } from "../../_components/task-form";
import { updateTask } from "../../actions";
import { taskToFormValues } from "../../form-data";

export const metadata: Metadata = { title: "Editar tarea · SmartDesk" };

const forbidden = (
  <Card>
    <EmptyState
      icon={LockIcon}
      title="No puedes editar tareas"
      description="Tu rol en esta organización no permite modificar tareas."
    />
  </Card>
);

export default async function EditTaskPage({ params }: PageProps<"/tasks/[taskId]/edit">) {
  const { taskId } = await params;
  if (!z.uuid().safeParse(taskId).success) notFound();

  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;
  if (!taskCapabilities(organization.role).canWrite) return forbidden;

  let task;
  let options;
  try {
    // Scoped to the active organization: another tenant's id resolves to 404.
    [task, options] = await Promise.all([
      taskService.get(user, organization.id, taskId),
      taskService.formOptions(user, organization.id),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) return forbidden;
    throw error;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/tasks/${task.id}`}
        className="mb-4 inline-flex max-w-full items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4 shrink-0" />
        <span className="truncate">{task.title}</span>
      </Link>
      <PageHeader title="Editar tarea" description="Los campos con * son obligatorios." />
      <TaskForm
        // The id is bound here but re-validated and re-authorized by the action.
        action={updateTask.bind(null, task.id)}
        projects={options.projects}
        assignees={options.assignees}
        initial={taskToFormValues(task)}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando…"
        cancelHref={`/tasks/${task.id}`}
      />
    </div>
  );
}
