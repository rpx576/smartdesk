import { todayCalendarDate } from "@/lib/dates";
import { roleHasPermission } from "@/server/auth/permissions";
import type { Client, ClientSummary } from "@/server/domain/client";
import type { ProjectStatus } from "@/server/domain/project";
import type { Role } from "@/server/domain/role";
import type { TaskSummary } from "@/server/domain/task";
import type { SessionUser } from "@/server/domain/user";
import { clientRepository, type ClientRepository } from "@/server/repositories/client.repository";
import { projectRepository, type ProjectRepository } from "@/server/repositories/project.repository";
import { taskRepository, type TaskRepository } from "@/server/repositories/task.repository";
import { tenantAccessService, type TenantAccessService } from "./tenant-access.service";

export const RECENT_CLIENTS_LIMIT = 5;

export type DashboardOverview = {
  role: Role;
  /** Null when the caller's role may not read the client directory. */
  clients: (ClientSummary & { recent: Client[] }) | null;
  /** Null when the caller's role may not read projects. */
  projects: Record<ProjectStatus, number> | null;
  /** Null when the caller's role may not read tasks. */
  tasks: TaskSummary | null;
};

export function createDashboardService(deps: {
  clientRepository: Pick<ClientRepository, "summary" | "listRecent">;
  projectRepository: Pick<ProjectRepository, "countByStatus">;
  taskRepository: Pick<TaskRepository, "summary">;
  tenantAccess: TenantAccessService;
  today?: () => Date;
}) {
  const today = deps.today ?? (() => todayCalendarDate());

  return {
    /**
     * Data for the organization home page. Every member may open it; each
     * widget is only filled in when the member's role grants access to it.
     */
    async getOverview(user: SessionUser, organizationId: string): Promise<DashboardOverview> {
      const tenant = await deps.tenantAccess.authorize(user, organizationId, "organization:read");
      const org = tenant.organizationId;
      const can = (permission: Parameters<typeof roleHasPermission>[1]) => roleHasPermission(tenant.role, permission);

      const [clients, projects, tasks] = await Promise.all([
        can("client:read")
          ? Promise.all([
              deps.clientRepository.summary(org),
              deps.clientRepository.listRecent(org, RECENT_CLIENTS_LIMIT),
            ]).then(([summary, recent]) => ({ ...summary, recent }))
          : null,
        can("project:read") ? deps.projectRepository.countByStatus(org) : null,
        can("task:read") ? deps.taskRepository.summary(org, today()) : null,
      ]);
      return { role: tenant.role, clients, projects, tasks };
    },
  };
}

export const dashboardService = createDashboardService({
  clientRepository,
  projectRepository,
  taskRepository,
  tenantAccess: tenantAccessService,
});
