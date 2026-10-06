import type { ClientOption, Page } from "@/server/domain/client";
import type {
  Project,
  ProjectCreateData,
  ProjectListFilter,
  ProjectUpdateData,
} from "@/server/domain/project";
import type { SessionUser } from "@/server/domain/user";
import { NotFoundError, ValidationError } from "@/server/errors/app-error";
import { clientRepository, type ClientRepository } from "@/server/repositories/client.repository";
import { projectRepository, type ProjectRepository } from "@/server/repositories/project.repository";
import { DUE_BEFORE_START, dueBeforeStart } from "@/server/validation/project.schema";
import { tenantAccessService, type TenantAccessService } from "./tenant-access.service";

export const CLIENT_NOT_IN_ORGANIZATION = "Selecciona un cliente de tu organización";

export function createProjectService(deps: {
  projectRepository: Pick<ProjectRepository, "list" | "findById" | "create" | "update" | "delete">;
  clientRepository: Pick<ClientRepository, "findById" | "listOptions">;
  tenantAccess: TenantAccessService;
}) {
  const { projectRepository: projects, clientRepository: clients, tenantAccess } = deps;
  const notFound = () => new NotFoundError("Project not found");

  /**
   * The client id comes from the browser: it must name a client of THIS
   * organization. Unknown and foreign ids get the same answer.
   */
  async function assertClientInOrganization(organizationId: string, clientId: string) {
    const client = await clients.findById(organizationId, clientId);
    if (!client) {
      throw new ValidationError("Invalid client", [
        { path: "clientId", message: CLIENT_NOT_IN_ORGANIZATION },
      ]);
    }
  }

  return {
    async list(
      user: SessionUser,
      organizationId: string,
      filter: ProjectListFilter,
    ): Promise<Page<Project>> {
      const tenant = await tenantAccess.authorize(user, organizationId, "project:read");
      // A client id from another tenant simply matches nothing: every query is
      // scoped to the authorized organization.
      const { items, total } = await projects.list(tenant.organizationId, filter);
      return { data: items, meta: { total, page: filter.page, pageSize: filter.pageSize } };
    },

    async get(user: SessionUser, organizationId: string, projectId: string): Promise<Project> {
      const tenant = await tenantAccess.authorize(user, organizationId, "project:read");
      const project = await projects.findById(tenant.organizationId, projectId);
      if (!project) throw notFound();
      return project;
    },

    /** Clients of the organization, for the project form and filters. */
    async clientOptions(user: SessionUser, organizationId: string): Promise<ClientOption[]> {
      const tenant = await tenantAccess.authorize(user, organizationId, "project:read");
      return clients.listOptions(tenant.organizationId);
    },

    async create(
      user: SessionUser,
      organizationId: string,
      data: ProjectCreateData,
    ): Promise<Project> {
      const tenant = await tenantAccess.authorize(user, organizationId, "project:write");
      await assertClientInOrganization(tenant.organizationId, data.clientId);
      // The creator is the authenticated user, never a value from the request.
      return projects.create(tenant.organizationId, tenant.userId, data);
    },

    async update(
      user: SessionUser,
      organizationId: string,
      projectId: string,
      data: ProjectUpdateData,
    ): Promise<Project> {
      const tenant = await tenantAccess.authorize(user, organizationId, "project:write");
      const current = await projects.findById(tenant.organizationId, projectId);
      if (!current) throw notFound();

      if (data.clientId && data.clientId !== current.clientId) {
        await assertClientInOrganization(tenant.organizationId, data.clientId);
      }
      // Partial updates: compare against the stored date that is not being changed.
      const startDate = data.startDate !== undefined ? data.startDate : current.startDate;
      const dueDate = data.dueDate !== undefined ? data.dueDate : current.dueDate;
      if (dueBeforeStart(startDate, dueDate)) {
        throw new ValidationError("Invalid dates", [{ path: "dueDate", message: DUE_BEFORE_START }]);
      }

      const project = await projects.update(tenant.organizationId, projectId, data);
      if (!project) throw notFound();
      return project;
    },

    async delete(user: SessionUser, organizationId: string, projectId: string): Promise<void> {
      const tenant = await tenantAccess.authorize(user, organizationId, "project:delete");
      const deleted = await projects.delete(tenant.organizationId, projectId);
      if (!deleted) throw notFound();
    },
  };
}

export type ProjectService = ReturnType<typeof createProjectService>;

export const projectService = createProjectService({
  projectRepository,
  clientRepository,
  tenantAccess: tenantAccessService,
});
