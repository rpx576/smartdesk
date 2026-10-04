import type { Metadata } from "next";
import Link from "next/link";
import { roleHasPermission } from "@/server/auth/permissions";
import { getAppContext } from "@/server/auth/organization-context";
import { ArrowLeftIcon, LockIcon } from "../../_components/icons";
import { NoOrganization } from "../../_components/no-organization";
import { Card, EmptyState, PageHeader } from "../../_components/ui";
import { ClientForm } from "../_components/client-form";
import { createClient } from "../actions";

export const metadata: Metadata = { title: "Nuevo cliente · SmartDesk" };

export default async function NewClientPage() {
  const { organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  // The create action is authorized again by the service.
  if (!roleHasPermission(organization.role, "client:write")) {
    return (
      <Card>
        <EmptyState
          icon={LockIcon}
          title="No puedes crear clientes"
          description="Tu rol en esta organización no permite dar de alta clientes."
        />
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/clients"
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4" />
        Clientes
      </Link>
      <PageHeader
        title="Nuevo cliente"
        description={`Se añadirá al directorio de ${organization.name}. Los campos con * son obligatorios.`}
      />
      <ClientForm
        action={createClient}
        submitLabel="Crear cliente"
        pendingLabel="Creando…"
        cancelHref="/clients"
      />
    </div>
  );
}
