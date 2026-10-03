import type {
  Client,
  ClientCreateData,
  ClientListFilter,
  ClientUpdateData,
  Page,
} from "@/server/domain/client";
import type { SessionUser } from "@/server/domain/user";
import { NotFoundError } from "@/server/errors/app-error";
import { clientRepository, type ClientRepository } from "@/server/repositories/client.repository";
import { tenantAccessService, type TenantAccessService } from "./tenant-access.service";

export function createClientService(deps: {
  clientRepository: ClientRepository;
  tenantAccess: TenantAccessService;
}) {
  const { clientRepository: clients, tenantAccess } = deps;
  const notFound = () => new NotFoundError("Client not found");

  return {
    async list(
      user: SessionUser,
      organizationId: string,
      filter: ClientListFilter,
    ): Promise<Page<Client>> {
      const tenant = await tenantAccess.authorize(user, organizationId, "client:read");
      const { items, total } = await clients.list(tenant.organizationId, filter);
      return { data: items, meta: { total, page: filter.page, pageSize: filter.pageSize } };
    },

    async get(user: SessionUser, organizationId: string, clientId: string): Promise<Client> {
      const tenant = await tenantAccess.authorize(user, organizationId, "client:read");
      const client = await clients.findById(tenant.organizationId, clientId);
      if (!client) throw notFound();
      return client;
    },

    async create(
      user: SessionUser,
      organizationId: string,
      data: ClientCreateData,
    ): Promise<Client> {
      const tenant = await tenantAccess.authorize(user, organizationId, "client:write");
      return clients.create(tenant.organizationId, data);
    },

    async update(
      user: SessionUser,
      organizationId: string,
      clientId: string,
      data: ClientUpdateData,
    ): Promise<Client> {
      const tenant = await tenantAccess.authorize(user, organizationId, "client:write");
      const client = await clients.update(tenant.organizationId, clientId, data);
      if (!client) throw notFound();
      return client;
    },

    async delete(user: SessionUser, organizationId: string, clientId: string): Promise<void> {
      const tenant = await tenantAccess.authorize(user, organizationId, "client:delete");
      const deleted = await clients.delete(tenant.organizationId, clientId);
      if (!deleted) throw notFound();
    },
  };
}

export const clientService = createClientService({
  clientRepository,
  tenantAccess: tenantAccessService,
});
