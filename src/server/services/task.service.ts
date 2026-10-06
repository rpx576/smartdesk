import { roleHasPermission } from "@/server/auth/permissions";
import type { Page } from "@/server/domain/client";
import type {
  AssigneeOption,
  ProjectOption,
  Task,
  TaskCreateData,
  TaskListFilter,
  TaskStatus,
  TaskUpdateData,
} from "@/server/domain/task";
import type { SessionUser } from "@/server/domain/user";
import { NotFoundError, ValidationError } from "@/server/errors/app-error";
import {
  membershipRepository,
  type MembershipRepository,
} from "@/server/repositories/membership.repository";
import { projectRepository, type ProjectRepository } from "@/server/repositories/project.repository";
import { taskRepository, type TaskRepository } from "@/server/repositories/task.repository";
import { DUE_BEFORE_START, dueBeforeStart } from "@/server/validation/common";
import { tenantAccessService, type TenantAccessService } from "./tenant-access.service";

export const PROJECT_NOT_IN_ORGANIZATION = "Selecciona un proyecto de tu organización";
export const ASSIGNEE_NOT_IN_ORGANIZATION = "Selecciona un responsable de tu organización";

/**
 * `completedAt` is derived, never accepted from the request: set when the
 * task becomes COMPLETED (kept if it already was), cleared for any other
 * status, untouched when the status does not change.
 */
export function nextCompletedAt(
  previous: { status: TaskStatus; completedAt: Date | null } | null,
  status: TaskStatus | undefined,
  now: Date,
): Date | null | undefined {
  if (status === undefined) return previous ? undefined : null;
  if (status !== "COMPLETED") return null;
  return previous?.status === "COMPLETED" ? (previous.completedAt ?? now) : now;
}

export function createTaskService(deps: {
  taskRepository: TaskRepository;
  projectRepository: Pick<ProjectRepository, "existsInOrganization" | "listOptions">;
  membershipRepository: Pick<MembershipRepository, "find" | "listMembers">;
  tenantAccess: TenantAccessService;
  now?: () => Date;
}) {
  const { taskRepository: tasks, projectRepository: projects, membershipRepository: members, tenantAccess } = deps;
  const now = deps.now ?? (() => new Date());
  const notFound = () => new NotFoundError("Task not found");
  const invalid = (path: string, message: string) => new ValidationError("Invalid task", [{ path, message }]);

  /** The project id comes from the browser: it must be a project of THIS organization. */
  async function assertProject(organizationId: string, projectId: string) {
    if (!(await projects.existsInOrganization(organizationId, projectId))) {
      throw invalid("projectId", PROJECT_NOT_IN_ORGANIZATION);
    }
  }

  /**
   * The assignee id comes from the browser: the user must exist, be a member of
   * THIS organization and have a role that can be in charge of tasks. Unknown,
   * foreign and CLIENT users all get the same answer.
   */
  async function assertAssignee(organizationId: string, assigneeId: string) {
    const membership = await members.find(assigneeId, organizationId);
    if (!membership || !roleHasPermission(membership.role, "task:assignable")) {
      throw invalid("assigneeId", ASSIGNEE_NOT_IN_ORGANIZATION);
    }
  }

  return {
    async list(user: SessionUser, organizationId: string, filter: TaskListFilter): Promise<Page<Task>> {
      const tenant = await tenantAccess.authorize(user, organizationId, "task:read");
      // Project/assignee ids from another tenant simply match nothing: the query
      // is always scoped to the authorized organization.
      const { items, total } = await tasks.list(tenant.organizationId, filter);
      return { data: items, meta: { total, page: filter.page, pageSize: filter.pageSize } };
    },

    async get(user: SessionUser, organizationId: string, taskId: string): Promise<Task> {
      const tenant = await tenantAccess.authorize(user, organizationId, "task:read");
      const task = await tasks.findById(tenant.organizationId, taskId);
      if (!task) throw notFound();
      return task;
    },

    /** Tasks of one project, for the project page. */
    async listForProject(user: SessionUser, organizationId: string, projectId: string, limit = 100): Promise<Task[]> {
      const tenant = await tenantAccess.authorize(user, organizationId, "task:read");
      return tasks.listByProject(tenant.organizationId, projectId, limit);
    },

    /** Projects and possible assignees of the organization, for forms and filters. */
    async formOptions(
      user: SessionUser,
      organizationId: string,
    ): Promise<{ projects: ProjectOption[]; assignees: AssigneeOption[] }> {
      const tenant = await tenantAccess.authorize(user, organizationId, "task:read");
      const [projectOptions, memberList] = await Promise.all([
        projects.listOptions(tenant.organizationId),
        members.listMembers(tenant.organizationId),
      ]);
      const assignees = memberList
        .filter((member) => roleHasPermission(member.role, "task:assignable"))
        .map(({ id, name, email }) => ({ id, name, email }));
      return { projects: projectOptions, assignees };
    },

    async create(user: SessionUser, organizationId: string, data: TaskCreateData): Promise<Task> {
      const tenant = await tenantAccess.authorize(user, organizationId, "task:write");
      await assertProject(tenant.organizationId, data.projectId);
      await assertAssignee(tenant.organizationId, data.assigneeId);
      const completedAt = nextCompletedAt(null, data.status ?? "TODO", now()) ?? null;
      // The creator is the authenticated user, never a value from the request.
      return tasks.create(tenant.organizationId, tenant.userId, { ...data, completedAt });
    },

    /** Full or partial update: also used to change status, priority or assignee alone. */
    async update(user: SessionUser, organizationId: string, taskId: string, data: TaskUpdateData): Promise<Task> {
      const tenant = await tenantAccess.authorize(user, organizationId, "task:write");
      const current = await tasks.findById(tenant.organizationId, taskId);
      if (!current) throw notFound();

      if (data.projectId && data.projectId !== current.projectId) {
        await assertProject(tenant.organizationId, data.projectId);
      }
      if (data.assigneeId && data.assigneeId !== current.assigneeId) {
        await assertAssignee(tenant.organizationId, data.assigneeId);
      }
      // Partial updates: compare against the stored date that is not being changed.
      const startDate = data.startDate !== undefined ? data.startDate : current.startDate;
      const dueDate = data.dueDate !== undefined ? data.dueDate : current.dueDate;
      if (dueBeforeStart(startDate, dueDate)) throw invalid("dueDate", DUE_BEFORE_START);

      const completedAt = nextCompletedAt(current, data.status, now());
      const task = await tasks.update(tenant.organizationId, taskId, {
        ...data,
        ...(completedAt !== undefined ? { completedAt } : {}),
      });
      if (!task) throw notFound();
      return task;
    },

    async delete(user: SessionUser, organizationId: string, taskId: string): Promise<void> {
      const tenant = await tenantAccess.authorize(user, organizationId, "task:delete");
      const deleted = await tasks.delete(tenant.organizationId, taskId);
      if (!deleted) throw notFound();
    },
  };
}

export type TaskService = ReturnType<typeof createTaskService>;

export const taskService = createTaskService({
  taskRepository,
  projectRepository,
  membershipRepository,
  tenantAccess: tenantAccessService,
});
