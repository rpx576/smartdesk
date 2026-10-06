import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { todayCalendarDate } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { getAppContext } from "@/server/auth/organization-context";
import { taskCapabilities } from "@/server/auth/permissions";
import { ForbiddenError } from "@/server/errors/app-error";
import { taskService } from "@/server/services/task.service";
import { taskListQuerySchema } from "@/server/validation/task.schema";
import { CheckSquareIcon, LockIcon, PlusIcon, SearchIcon } from "../_components/icons";
import { NoOrganization } from "../_components/no-organization";
import { Notice } from "../_components/notice";
import { buttonClass, Card, EmptyState, PageHeader } from "../_components/ui";
import { TaskFilters } from "./_components/task-filters";
import { TasksTable } from "./_components/tasks-table";
import { noticeMessage, tasksListHref } from "./form-data";

export const metadata: Metadata = { title: "Tareas · SmartDesk" };

const PAGE_SIZE = 20;

const day = (date?: Date) => (date ? date.toISOString().slice(0, 10) : undefined);

export default async function TasksPage({ searchParams }: PageProps<"/tasks">) {
  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  const params = await searchParams;
  const notice = noticeMessage(params.notice);
  // Invalid query strings fall back to the unfiltered first page instead of erroring.
  const query = taskListQuerySchema.safeParse(params);
  const filter = query.success ? { ...query.data, pageSize: PAGE_SIZE } : { page: 1, pageSize: PAGE_SIZE };

  let result;
  let options;
  try {
    // Both calls authorize `task:read` against the active organization.
    [result, options] = await Promise.all([
      taskService.list(user, organization.id, filter),
      taskService.formOptions(user, organization.id),
    ]);
  } catch (error) {
    if (!(error instanceof ForbiddenError)) throw error;
    return (
      <>
        <PageHeader title="Tareas" />
        <Card>
          <EmptyState
            icon={LockIcon}
            title="Sin acceso a las tareas"
            description="Tu rol en esta organización no permite consultar tareas."
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
    projectId: filter.projectId,
    assigneeId: filter.assigneeId,
    dueFrom: filter.dueFrom,
    dueTo: filter.dueTo,
    sort: filter.sort,
  };
  // E.g. after deleting the last task of the last page.
  if (data.length === 0 && meta.total > 0 && meta.page > totalPages) {
    redirect(tasksListHref({ ...listState, page: totalPages }));
  }

  // UI hints only; the service authorizes every create/edit/delete again.
  const { canWrite, canDelete } = taskCapabilities(organization.role);
  const filtered = Boolean(
    filter.search || filter.status || filter.priority || filter.projectId || filter.assigneeId || filter.dueFrom || filter.dueTo,
  );
  const firstItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const lastItem = Math.min(meta.page * meta.pageSize, meta.total);
  const newTaskButton = canWrite && (
    <Link href="/tasks/new" className={buttonClass.primary}>
      <PlusIcon className="size-4" />
      Nueva tarea
    </Link>
  );

  return (
    <>
      {notice && <Notice message={notice} />}
      <PageHeader
        title="Tareas"
        description={`Reparte y sigue el trabajo de los proyectos de ${organization.name}.`}
        action={newTaskButton}
      />

      <Card>
        <TaskFilters filter={listState} projects={options.projects} assignees={options.assignees} />

        {data.length === 0 ? (
          filtered ? (
            <EmptyState
              icon={SearchIcon}
              title="Sin resultados"
              description={
                filter.search
                  ? `Ninguna tarea coincide con «${filter.search}» y los filtros aplicados.`
                  : "Ninguna tarea coincide con los filtros aplicados."
              }
              action={
                <Link href="/tasks" className={buttonClass.secondary}>
                  Ver todas las tareas
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={CheckSquareIcon}
              title="Todavía no hay tareas"
              description={
                options.projects.length === 0
                  ? "Las tareas pertenecen a un proyecto: crea primero un proyecto."
                  : "Crea la primera tarea y asígnala a alguien de tu equipo."
              }
              action={
                options.projects.length === 0 ? (
                  <Link href="/projects" className={buttonClass.secondary}>
                    Ir a proyectos
                  </Link>
                ) : (
                  newTaskButton
                )
              }
            />
          )
        ) : (
          <>
            <TasksTable
              tasks={data}
              today={todayCalendarDate()}
              caption="Tareas de la organización"
              actions={{ edit: canWrite, delete: canDelete }}
              listState={{
                ...listState,
                dueFrom: day(listState.dueFrom),
                dueTo: day(listState.dueTo),
                page: meta.page,
              }}
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
                  <Link href={tasksListHref({ ...listState, page: meta.page - 1 })} className={buttonClass.secondary} rel="prev">
                    Anterior
                  </Link>
                )}
                {meta.page < totalPages && (
                  <Link href={tasksListHref({ ...listState, page: meta.page + 1 })} className={buttonClass.secondary} rel="next">
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
