import type { Metadata } from "next";
import Link from "next/link";
import { getAppContext } from "@/server/auth/organization-context";
import { taskCapabilities } from "@/server/auth/permissions";
import { taskService } from "@/server/services/task.service";
import { ArrowLeftIcon, FolderIcon, LockIcon } from "../../_components/icons";
import { NoOrganization } from "../../_components/no-organization";
import { buttonClass, Card, EmptyState, PageHeader } from "../../_components/ui";
import { TaskForm } from "../_components/task-form";
import { createTask } from "../actions";

export const metadata: Metadata = { title: "Nueva tarea · SmartDesk" };

export default async function NewTaskPage({ searchParams }: PageProps<"/tasks/new">) {
  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  // The create action is authorized again by the service.
  if (!taskCapabilities(organization.role).canWrite) {
    return (
      <Card>
        <EmptyState
          icon={LockIcon}
          title="No puedes crear tareas"
          description="Tu rol en esta organización no permite crear tareas."
        />
      </Card>
    );
  }

  const { projects, assignees } = await taskService.formOptions(user, organization.id);
  // `?projectId=` (from a project page) only preselects an option the user can
  // already see; anything else is ignored. The server re-validates on submit.
  const requested = (await searchParams).projectId;
  const preselected = projects.find((project) => project.id === requested);
  const backHref = preselected ? `/projects/${preselected.id}#tareas` : "/tasks";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4" />
        {preselected ? preselected.name : "Tareas"}
      </Link>
      <PageHeader
        title="Nueva tarea"
        description={`Se añadirá a ${organization.name}. Los campos con * son obligatorios.`}
      />
      {projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderIcon}
            title="Primero necesitas un proyecto"
            description="Cada tarea pertenece a un proyecto. Crea uno y vuelve aquí."
            action={
              <Link href="/projects/new" className={buttonClass.primary}>
                Nuevo proyecto
              </Link>
            }
          />
        </Card>
      ) : (
        <TaskForm
          action={createTask}
          projects={projects}
          assignees={assignees}
          // Default: the creator is in charge, unless they cannot be assigned.
          initial={{
            projectId: preselected?.id ?? "",
            assigneeId: assignees.some((a) => a.id === user.id) ? user.id : "",
          }}
          submitLabel="Crear tarea"
          pendingLabel="Creando…"
          cancelHref={backHref}
        />
      )}
    </div>
  );
}
