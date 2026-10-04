import { roleHasPermission } from "@/server/auth/permissions";
import type { Client, ClientSummary } from "@/server/domain/client";
import type { Role } from "@/server/domain/role";
import type { SessionUser } from "@/server/domain/user";
import { clientRepository, type ClientRepository } from "@/server/repositories/client.repository";
import { tenantAccessService, type TenantAccessService } from "./tenant-access.service";

export const RECENT_CLIENTS_LIMIT = 5;

export type DashboardOverview = {
  role: Role;
  /** Null when the caller's role may not read the client directory. */
  clients: (ClientSummary & { recent: Client[] }) | null;
};

export function createDashboardService(deps: {
  clientRepository: Pick<ClientRepository, "summary" | "listRecent">;
  tenantAccess: TenantAccessService;
}) {
  return {
    /**
     * Data for the organization home page. Every member may open it; each
     * widget is only filled in when the member's role grants access to it.
     */
    async getOverview(user: SessionUser, organizationId: string): Promise<DashboardOverview> {
      const tenant = await deps.tenantAccess.authorize(user, organizationId, "organization:read");

      if (!roleHasPermission(tenant.role, "client:read")) {
        return { role: tenant.role, clients: null };
      }

      const [summary, recent] = await Promise.all([
        deps.clientRepository.summary(tenant.organizationId),
        deps.clientRepository.listRecent(tenant.organizationId, RECENT_CLIENTS_LIMIT),
      ]);
      return { role: tenant.role, clients: { ...summary, recent } };
    },
  };
}

export const dashboardService = createDashboardService({
  clientRepository,
  tenantAccess: tenantAccessService,
});
