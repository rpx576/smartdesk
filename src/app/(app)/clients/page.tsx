import type { Metadata } from "next";
import Link from "next/link";
import { formatNumber } from "@/lib/format";
import { getAppContext } from "@/server/auth/organization-context";
import { ForbiddenError } from "@/server/errors/app-error";
import { clientService } from "@/server/services/client.service";
import { clientListQuerySchema } from "@/server/validation/client.schema";
import { ClientsTable } from "../_components/clients-table";
import { LockIcon, SearchIcon, UsersIcon } from "../_components/icons";
import { NoOrganization } from "../_components/no-organization";
import { buttonClass, Card, EmptyState, PageHeader } from "../_components/ui";

export const metadata: Metadata = { title: "Clientes · SmartDesk" };

const PAGE_SIZE = 20;

function pageHref(search: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/clients?${query}` : "/clients";
}

export default async function ClientsPage({ searchParams }: PageProps<"/clients">) {
  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  // Invalid query strings fall back to the first page instead of erroring.
  const query = clientListQuerySchema.safeParse(await searchParams);
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
  const firstItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const lastItem = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <>
      <PageHeader
        title="Clientes"
        description={`Directorio de clientes de ${organization.name}`}
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
              placeholder="Buscar por nombre, email o empresa"
              className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <button type="submit" className={buttonClass.secondary}>
            Buscar
          </button>
          {filter.search && (
            <Link href="/clients" className="text-sm font-medium text-ink-muted hover:text-ink">
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
            />
          ) : (
            <EmptyState
              icon={UsersIcon}
              title="Todavía no hay clientes"
              description="Los clientes que se den de alta en tu organización aparecerán aquí."
            />
          )
        ) : (
          <>
            <ClientsTable clients={data} caption="Clientes de la organización" />
            <nav
              aria-label="Paginación"
              className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-ink-muted"
            >
              <p>
                {formatNumber(firstItem)}–{formatNumber(lastItem)} de {formatNumber(meta.total)}
              </p>
              <div className="flex gap-2">
                {meta.page > 1 && (
                  <Link href={pageHref(filter.search, meta.page - 1)} className={buttonClass.secondary}>
                    Anterior
                  </Link>
                )}
                {meta.page < totalPages && (
                  <Link href={pageHref(filter.search, meta.page + 1)} className={buttonClass.secondary}>
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
