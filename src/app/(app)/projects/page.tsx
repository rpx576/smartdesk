import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatNumber } from "@/lib/format";
import { getAppContext } from "@/server/auth/organization-context";
import { projectCapabilities } from "@/server/auth/permissions";
import { ForbiddenError } from "@/server/errors/app-error";
import { projectService } from "@/server/services/project.service";
import { projectListQuerySchema } from "@/server/validation/project.schema";
import { FolderIcon, LockIcon, PlusIcon, SearchIcon } from "../_components/icons";
import { NoOrganization } from "../_components/no-organization";
import { Notice } from "../_components/notice";
import { buttonClass, Card, EmptyState, PageHeader } from "../_components/ui";
import { ProjectFilters } from "./_components/project-filters";
import { ProjectsTable } from "./_components/projects-table";
import { noticeMessage, projectsListHref } from "./form-data";

export const metadata: Metadata = { title: "Proyectos · SmartDesk" };

const PAGE_SIZE = 20;

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  const params = await searchParams;
  const notice = noticeMessage(params.notice);
  // Invalid query strings fall back to the unfiltered first page instead of erroring.
  const query = projectListQuerySchema.safeParse(params);
  const filter = query.success
    ? { ...query.data, pageSize: PAGE_SIZE }
    : { page: 1, pageSize: PAGE_SIZE };

  let result;
  let clients;
  try {
    // Both calls authorize `project:read` against the active organization.
    [result, clients] = await Promise.all([
      projectService.list(user, organization.id, filter),
      projectService.clientOptions(user, organization.id),
    ]);
  } catch (error) {
    if (!(error instanceof ForbiddenError)) throw error;
    return (
      <>
        <PageHeader title="Proyectos" />
        <Card>
          <EmptyState
            icon={LockIcon}
            title="Sin acceso a los proyectos"
            description="Tu rol en esta organización no permite consultar proyectos."
          />
        </Card>
      </>
    );
  }

  const { data, meta } = result;
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));
  const listState = {
    search: filter.search,
    status: filter.status,
    priority: filter.priority,
    clientId: filter.clientId,
  };
  // E.g. after deleting the last project of the last page.
  if (data.length === 0 && meta.total > 0 && meta.page > totalPages) {
    redirect(projectsListHref({ ...listState, page: totalPages }));
  }

  // UI hints only; the service authorizes every create/edit/delete again.
  const { canWrite, canDelete } = projectCapabilities(organization.role);
  const filtered = Boolean(filter.search || filter.status || filter.priority || filter.clientId);
  const firstItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const lastItem = Math.min(meta.page * meta.pageSize, meta.total);
  const newProjectButton = canWrite && (
    <Link href="/projects/new" className={buttonClass.primary}>
      <PlusIcon className="size-4" />
      Nuevo proyecto
    </Link>
  );

  return (
    <>
      {notice && <Notice message={notice} />}
      <PageHeader
        title="Proyectos"
        description={`Planifica y sigue el trabajo para los clientes de ${organization.name}.`}
        action={newProjectButton}
      />

      <Card>
        <ProjectFilters filter={listState} clients={clients} />

        {data.length === 0 ? (
          filtered ? (
            <EmptyState
              icon={SearchIcon}
              title="Sin resultados"
              description={
                filter.search
                  ? `Ningún proyecto coincide con «${filter.search}» y los filtros aplicados.`
                  : "Ningún proyecto coincide con los filtros aplicados."
              }
              action={
                <Link href="/projects" className={buttonClass.secondary}>
                  Ver todos los proyectos
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={FolderIcon}
              title="Todavía no hay proyectos"
              description={
                clients.length === 0
                  ? "Para crear un proyecto primero necesitas al menos un cliente."
                  : "Crea tu primer proyecto para empezar a organizar el trabajo."
              }
              action={
                clients.length === 0 ? (
                  <Link href="/clients" className={buttonClass.secondary}>
                    Ir a clientes
                  </Link>
                ) : (
                  newProjectButton
                )
              }
            />
          )
        ) : (
          <>
            <ProjectsTable
              projects={data}
              actions={{ edit: canWrite, delete: canDelete }}
              listState={{ ...listState, page: meta.page }}
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
                    href={projectsListHref({ ...listState, page: meta.page - 1 })}
                    className={buttonClass.secondary}
                    rel="prev"
                  >
                    Anterior
                  </Link>
                )}
                {meta.page < totalPages && (
                  <Link
                    href={projectsListHref({ ...listState, page: meta.page + 1 })}
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
