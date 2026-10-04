import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { z } from "zod";
import { formatDate } from "@/lib/format";
import { roleHasPermission } from "@/server/auth/permissions";
import { getAppContext } from "@/server/auth/organization-context";
import { ForbiddenError, NotFoundError } from "@/server/errors/app-error";
import { clientService } from "@/server/services/client.service";
import { ArrowLeftIcon, LockIcon, PencilIcon } from "../../_components/icons";
import { NoOrganization } from "../../_components/no-organization";
import { buttonClass, Card, CardHeader, EmptyState, StatusBadge } from "../../_components/ui";
import { DeleteClientButton } from "../_components/delete-client-button";
import { Notice } from "../_components/notice";
import { noticeMessage } from "../form-data";

export const metadata: Metadata = { title: "Cliente · SmartDesk" };

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

export default async function ClientDetailPage({
  params,
  searchParams,
}: PageProps<"/clients/[clientId]">) {
  const { clientId } = await params;
  if (!z.uuid().safeParse(clientId).success) notFound();

  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  let client;
  try {
    // Scoped to the active organization: another tenant's id resolves to 404.
    client = await clientService.get(user, organization.id, clientId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (!(error instanceof ForbiddenError)) throw error;
    return (
      <Card>
        <EmptyState
          icon={LockIcon}
          title="Sin acceso a este cliente"
          description="Tu rol en esta organización no permite consultar clientes."
        />
      </Card>
    );
  }

  // UI hints only; the server authorizes edit/delete again.
  const canWrite = roleHasPermission(organization.role, "client:write");
  const canDelete = roleHasPermission(organization.role, "client:delete");
  const notice = noticeMessage((await searchParams).notice);

  return (
    <>
      {notice && <Notice message={notice} />}
      <Link
        href="/clients"
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4" />
        Clientes
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-ink">{client.name}</h1>
          <StatusBadge status={client.status} />
        </div>
        {(canWrite || canDelete) && (
          <div className="flex gap-2">
            {canWrite && (
              <Link href={`/clients/${client.id}/edit`} className={buttonClass.secondary}>
                <PencilIcon className="size-4" />
                Editar
              </Link>
            )}
            {canDelete && <DeleteClientButton clientId={client.id} clientName={client.name} />}
          </div>
        )}
      </div>

      <Card>
        <CardHeader title="Datos del cliente" />
        <dl className="divide-y divide-line">
          <Field label="Nombre">{client.name}</Field>
          <Field label="Estado">
            <StatusBadge status={client.status} />
          </Field>
          <Field label="Empresa">{client.company}</Field>
          <Field label="Email">
            {client.email && (
              <a href={`mailto:${client.email}`} className="text-accent hover:underline">
                {client.email}
              </a>
            )}
          </Field>
          <Field label="Teléfono">
            {client.phone && (
              <a href={`tel:${client.phone.replace(/\s+/g, "")}`} className="text-accent hover:underline">
                {client.phone}
              </a>
            )}
          </Field>
          <Field label="Notas">
            {client.notes && <p className="whitespace-pre-line">{client.notes}</p>}
          </Field>
          <Field label="Alta">{formatDate(client.createdAt)}</Field>
          <Field label="Última actualización">{formatDate(client.updatedAt)}</Field>
        </dl>
      </Card>
    </>
  );
}
