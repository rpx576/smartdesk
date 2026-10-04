import type { Metadata } from "next";
import Link from "next/link";
import { formatLongDate, formatNumber, greeting, pluralize } from "@/lib/format";
import { getAppContext } from "@/server/auth/organization-context";
import { dashboardService } from "@/server/services/dashboard.service";
import { ClientsTable } from "../_components/clients-table";
import {
  ArrowRightIcon,
  CheckSquareIcon,
  DocumentIcon,
  FolderIcon,
  LockIcon,
  UsersIcon,
} from "../_components/icons";
import { NoOrganization } from "../_components/no-organization";
import { buttonClass, Card, CardHeader, EmptyState, PageHeader, TextLink } from "../_components/ui";
import { ActivityPanel } from "./_components/activity-panel";
import { ClientPortfolio } from "./_components/client-portfolio";
import { StatCard } from "./_components/stat-card";

export const metadata: Metadata = { title: "Dashboard · SmartDesk" };

export default async function DashboardPage() {
  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  // Tenant and role checks happen inside the service, against the database.
  const { clients } = await dashboardService.getOverview(user, organization.id);
  const now = new Date();
  const firstName = user.name?.split(" ")[0] ?? user.email;

  return (
    <>
      <PageHeader
        title={`${greeting(now)}, ${firstName}`}
        description={
          <>
            {formatLongDate(now)} · {organization.name}
          </>
        }
        action={
          clients && (
            <Link href="/clients" className={buttonClass.secondary}>
              <UsersIcon className="size-4" />
              Ver clientes
            </Link>
          )
        }
      />

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {clients ? (
          <StatCard
            label="Clientes"
            icon={UsersIcon}
            value={formatNumber(clients.total)}
            footer={`${pluralize(clients.byStatus.ACTIVE, "activo", "activos")} · ${pluralize(clients.byStatus.LEAD, "potencial", "potenciales")}`}
            href="/clients"
          />
        ) : (
          <StatCard label="Clientes" icon={LockIcon} value="—" footer="Tu rol no tiene acceso a clientes" />
        )}
        <StatCard label="Proyectos activos" icon={FolderIcon} comingSoon footer="Módulo de proyectos en desarrollo" href="/projects" />
        <StatCard label="Tareas pendientes" icon={CheckSquareIcon} comingSoon footer="Módulo de tareas en desarrollo" href="/tasks" />
        <StatCard label="Documentos" icon={DocumentIcon} comingSoon footer="Módulo de documentos en desarrollo" href="/documents" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="recent-clients" className="lg:col-span-2">
          <Card>
            <CardHeader
              id="recent-clients"
              title="Clientes recientes"
              description="Últimas altas en tu organización"
              action={
                clients && clients.total > 0 ? (
                  <TextLink href="/clients">
                    Ver todos
                    <ArrowRightIcon className="size-4" />
                  </TextLink>
                ) : undefined
              }
            />
            {!clients ? (
              <EmptyState
                icon={LockIcon}
                title="Sin acceso al directorio de clientes"
                description="Tu rol en esta organización no permite consultar clientes."
              />
            ) : clients.recent.length === 0 ? (
              <EmptyState
                icon={UsersIcon}
                title="Todavía no hay clientes"
                description="Cuando tu equipo dé de alta clientes, los más recientes aparecerán aquí."
              />
            ) : (
              <ClientsTable clients={clients.recent} caption="Clientes dados de alta más recientemente" />
            )}
          </Card>
        </section>

        <div className="flex flex-col gap-6">
          {clients && <ClientPortfolio summary={clients} />}
          <ActivityPanel />
        </div>
      </div>
    </>
  );
}
