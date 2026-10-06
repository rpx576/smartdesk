import type { Metadata } from "next";
import Link from "next/link";
import { getAppContext } from "@/server/auth/organization-context";
import { projectCapabilities } from "@/server/auth/permissions";
import { projectService } from "@/server/services/project.service";
import { ArrowLeftIcon, LockIcon, UsersIcon } from "../../_components/icons";
import { NoOrganization } from "../../_components/no-organization";
import { buttonClass, Card, EmptyState, PageHeader } from "../../_components/ui";
import { ProjectForm } from "../_components/project-form";
import { createProject } from "../actions";

export const metadata: Metadata = { title: "Nuevo proyecto · SmartDesk" };

export default async function NewProjectPage() {
  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  // The create action is authorized again by the service.
  if (!projectCapabilities(organization.role).canWrite) {
    return (
      <Card>
        <EmptyState
          icon={LockIcon}
          title="No puedes crear proyectos"
          description="Tu rol en esta organización no permite crear proyectos."
        />
      </Card>
    );
  }

  const clients = await projectService.clientOptions(user, organization.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4" />
        Proyectos
      </Link>
      <PageHeader
        title="Nuevo proyecto"
        description={`Se añadirá a ${organization.name}. Los campos con * son obligatorios.`}
      />
      {clients.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersIcon}
            title="Primero necesitas un cliente"
            description="Cada proyecto pertenece a un cliente. Da de alta uno y vuelve aquí."
            action={
              <Link href="/clients/new" className={buttonClass.primary}>
                Nuevo cliente
              </Link>
            }
          />
        </Card>
      ) : (
        <ProjectForm
          action={createProject}
          clients={clients}
          submitLabel="Crear proyecto"
          pendingLabel="Creando…"
          cancelHref="/projects"
        />
      )}
    </div>
  );
}
