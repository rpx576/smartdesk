import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getAppContext } from "@/server/auth/organization-context";
import { projectCapabilities } from "@/server/auth/permissions";
import { ForbiddenError, NotFoundError } from "@/server/errors/app-error";
import { projectService } from "@/server/services/project.service";
import { ArrowLeftIcon, LockIcon } from "../../../_components/icons";
import { NoOrganization } from "../../../_components/no-organization";
import { Card, EmptyState, PageHeader } from "../../../_components/ui";
import { ProjectForm } from "../../_components/project-form";
import { updateProject } from "../../actions";
import { projectToFormValues } from "../../form-data";

export const metadata: Metadata = { title: "Editar proyecto · SmartDesk" };

const forbidden = (
  <Card>
    <EmptyState
      icon={LockIcon}
      title="No puedes editar proyectos"
      description="Tu rol en esta organización no permite modificar proyectos."
    />
  </Card>
);

export default async function EditProjectPage({ params }: PageProps<"/projects/[projectId]/edit">) {
  const { projectId } = await params;
  if (!z.uuid().safeParse(projectId).success) notFound();

  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;
  if (!projectCapabilities(organization.role).canWrite) return forbidden;

  let project;
  let clients;
  try {
    // Scoped to the active organization: another tenant's id resolves to 404.
    [project, clients] = await Promise.all([
      projectService.get(user, organization.id, projectId),
      projectService.clientOptions(user, organization.id),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) return forbidden;
    throw error;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/projects/${project.id}`}
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4" />
        {project.name}
      </Link>
      <PageHeader title="Editar proyecto" description="Los campos con * son obligatorios." />
      <ProjectForm
        // The id is bound here but re-validated and re-authorized by the action.
        action={updateProject.bind(null, project.id)}
        clients={clients}
        initial={projectToFormValues(project)}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando…"
        cancelHref={`/projects/${project.id}`}
      />
    </div>
  );
}
