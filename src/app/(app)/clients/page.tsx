import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatNumber } from "@/lib/format";
import { clientCapabilities } from "@/server/auth/permissions";
import { getAppContext } from "@/server/auth/organization-context";
import { ForbiddenError } from "@/server/errors/app-error";
import { clientService } from "@/server/services/client.service";
import { clientListQuerySchema } from "@/server/validation/client.schema";
import { ClientsTable } from "../_components/clients-table";
import { LockIcon, PlusIcon, SearchIcon, UsersIcon } from "../_components/icons";
import { NoOrganization } from "../_components/no-organization";
import { buttonClass, Card, EmptyState, PageHeader } from "../_components/ui";
import { Notice } from "../_components/notice";
import { clientsListHref, noticeMessage } from "./form-data";

export const metadata: Metadata = { title: "Clientes · SmartDesk" };

const PAGE_SIZE = 20;

export default async function ClientsPage({ searchParams }: PageProps<"/clients">) {
  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  const params = await searchParams;
  const notice = noticeMessage(params.notice);
  // Invalid query strings fall back to the first page instead of erroring.
  const query = clientListQuerySchema.safeParse(params);
  const filter = query.success
    ? { ...query.data, pageSize: PAGE_SIZE }
    : { page: 1, pageSize: PAGE_SIZE };

  let result;
  try {
    result = await clientService.list(user, organization.id, filter);
  } catch (error) {
    if (!(error instanceof ForbiddenError)) throw error;
    return (
      <>
        <PageHeader title="Clientes" />
        <Card>
          <EmptyState
            icon={LockIcon}
            title="Sin acceso al directorio de clientes"
            description="Tu rol en esta organización no permite consultar clientes."
          />
        </Card>
      </>
    );
  }

  const { data, meta } = result;
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));
  // E.g. after deleting the last client of the last page.
  if (data.length === 0 && meta.total > 0 && meta.page > totalPages) {
    redirect(clientsListHref({ search: filter.search, page: totalPages }));
  }

  // UI hints only; the service authorizes every create/edit/delete again.
  const { canWrite, canDelete } = clientCapabilities(organization.role);
  const firstItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const lastItem = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <>
      {notice && <Notice message={notice} />}
      <PageHeader
        title="Clientes"
        description={`Gestiona el directorio de clientes de ${organization.name}.`}
        action={
          canWrite && (
            <Link href="/clients/new" className={buttonClass.primary}>
              <PlusIcon className="size-4" />
              Nuevo cliente
            </Link>
          )
        }
      />

      <Card>
        <form
          role="search"
          action="/clients"
          className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4"
        >
          <label className="relative min-w-0 flex-1 basis-60">
            <span className="sr-only">Buscar clientes</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
            <input
              type="search"
              name="search"
              defaultValue={filter.search}
              maxLength={200}
              placeholder="Buscar por nombre, email o empresa"
              className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <button type="submit" className={buttonClass.secondary}>
            Buscar
          </button>
          {filter.search && (
            <Link href="/clients" className="rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent">
              Limpiar
            </Link>
          )}
        </form>

        {data.length === 0 ? (
          filter.search ? (
            <EmptyState
              icon={SearchIcon}
              title="Sin resultados"
              description={`Ningún cliente coincide con «${filter.search}».`}
              action={
                <Link href="/clients" className={buttonClass.secondary}>
                  Ver todos los clientes
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={UsersIcon}
              title="Todavía no hay clientes"
              description="Da de alta tu primer cliente para empezar a gestionar tu cartera."
              action={
                canWrite && (
                  <Link href="/clients/new" className={buttonClass.primary}>
                    <PlusIcon className="size-4" />
                    Nuevo cliente
                  </Link>
                )
              }
            />
          )
        ) : (
          <>
            <ClientsTable
              clients={data}
              caption="Clientes de la organización"
              actions={{ edit: canWrite, delete: canDelete }}
              listState={{ search: filter.search, page: meta.page }}
            />
            <nav
              aria-label="Paginación"
              className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-ink-muted"
            >
              <p>
                Mostrando {formatNumber(firstItem)}–{formatNumber(lastItem)} de {formatNumber(meta.total)}
                {totalPages > 1 && (
                  <span className="text-ink-subtle">
                    {" "}· Página {formatNumber(meta.page)} de {formatNumber(totalPages)}
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                {meta.page > 1 && (
                  <Link
                    href={clientsListHref({ search: filter.search, page: meta.page - 1 })}
                    className={buttonClass.secondary}
                    rel="prev"
                  >
                    Anterior
                  </Link>
                )}
                {meta.page < totalPages && (
                  <Link
                    href={clientsListHref({ search: filter.search, page: meta.page + 1 })}
                    className={buttonClass.secondary}
                    rel="next"
                  >
                    Siguiente
                  </Link>
                )}
              </div>
            </nav>
          </>
        )}
      </Card>
    </>
  );
}
