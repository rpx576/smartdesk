import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { roleHasPermission } from "@/server/auth/permissions";
import { getAppContext } from "@/server/auth/organization-context";
import { ForbiddenError, NotFoundError } from "@/server/errors/app-error";
import { clientService } from "@/server/services/client.service";
import { ArrowLeftIcon, LockIcon } from "../../../_components/icons";
import { NoOrganization } from "../../../_components/no-organization";
import { Card, EmptyState, PageHeader } from "../../../_components/ui";
import { ClientForm } from "../../_components/client-form";
import { updateClient } from "../../actions";

export const metadata: Metadata = { title: "Editar cliente · SmartDesk" };

const forbidden = (
  <Card>
    <EmptyState
      icon={LockIcon}
      title="No puedes editar clientes"
      description="Tu rol en esta organización no permite modificar clientes."
    />
  </Card>
);

export default async function EditClientPage({ params }: PageProps<"/clients/[clientId]/edit">) {
  const { clientId } = await params;
  if (!z.uuid().safeParse(clientId).success) notFound();

  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;
  if (!roleHasPermission(organization.role, "client:write")) return forbidden;

  let client;
  try {
    // Scoped to the active organization: another tenant's id resolves to 404.
    client = await clientService.get(user, organization.id, clientId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) return forbidden;
    throw error;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/clients/${client.id}`}
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4" />
        {client.name}
      </Link>
      <PageHeader title="Editar cliente" description="Los campos con * son obligatorios." />
      <ClientForm
        // The id is bound here but re-validated and re-authorized by the action.
        action={updateClient.bind(null, client.id)}
        initial={{
          name: client.name,
          email: client.email ?? "",
          phone: client.phone ?? "",
          company: client.company ?? "",
          status: client.status,
          notes: client.notes ?? "",
        }}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando…"
        cancelHref={`/clients/${client.id}`}
      />
    </div>
  );
}
