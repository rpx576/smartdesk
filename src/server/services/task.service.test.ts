import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import type { Membership, OrganizationMember } from "@/server/domain/organization";
import type { Task, TaskCreateData, TaskWriteData } from "@/server/domain/task";
import type { SessionUser } from "@/server/domain/user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/server/errors/app-error";
import type { TaskRepository } from "@/server/repositories/task.repository";
import {
  ASSIGNEE_NOT_IN_ORGANIZATION,
  createTaskService,
  nextCompletedAt,
  PROJECT_NOT_IN_ORGANIZATION,
} from "./task.service";
import { createTenantAccessService } from "./tenant-access.service";

/*
 * Two tenants, Acme (A) and Globex (B), with their own projects and members.
 * The fakes honour the same contract as the real repositories: every lookup
 * is scoped by organization id.
 */
const ACME = "org-acme";
const GLOBEX = "org-globex";

const user = (id: string): SessionUser => ({ id, email: `${id}@test`, name: id });
const acmeAdmin = user("acme-admin");
const acmeEmployee = user("acme-employee");
const acmeClient = user("acme-client");
const globexAdmin = user("globex-admin");

const memberships: Membership[] = [
  { userId: acmeAdmin.id, organizationId: ACME, role: "ADMIN" },
  { userId: acmeEmployee.id, organizationId: ACME, role: "EMPLOYEE" },
  { userId: acmeClient.id, organizationId: ACME, role: "CLIENT" },
  { userId: globexAdmin.id, organizationId: GLOBEX, role: "ADMIN" },
];

const projectsByOrg: Record<string, { id: string; name: string; clientName: string }[]> = {
  [ACME]: [
    { id: "acme-web", name: "Tienda online", clientName: "Bodegas" },
    { id: "acme-app", name: "App interna", clientName: "Talleres" },
  ],
  [GLOBEX]: [{ id: "globex-cloud", name: "Migración", clientName: "Initech" }],
};

const NOW = new Date("2026-10-07T09:00:00.000Z");
let seq = 0;

function makeTask(organizationId: string, projectId: string, assigneeId: string, extra: Partial<Task> = {}): Task {
  seq += 1;
  const project = projectsByOrg[organizationId].find((p) => p.id === projectId)!;
  return {
    id: `t-${seq}`,
    organizationId,
    projectId,
    title: `Tarea ${seq}`,
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    assigneeId,
    createdById: assigneeId,
    startDate: null,
    dueDate: null,
    completedAt: null,
    estimatedHours: null,
    actualHours: null,
    createdAt: new Date(seq * 1000),
    updatedAt: new Date(seq * 1000),
    project: { id: project.id, name: project.name, client: { id: `c-${project.id}`, name: project.clientName } },
    assignee: { id: assigneeId, name: assigneeId, email: `${assigneeId}@test` },
    createdBy: null,
    ...extra,
  };
}

function createFakeTaskRepository(store: Task[]): TaskRepository {
  const find = (organizationId: string, id: string) =>
    store.find((t) => t.id === id && t.organizationId === organizationId) ?? null;
  return {
    async list(organizationId, { search, status, priority, projectId, assigneeId, page, pageSize }) {
      const term = search?.toLowerCase();
      const items = store
        .filter((t) => t.organizationId === organizationId)
        .filter((t) => !status || t.status === status)
        .filter((t) => !priority || t.priority === priority)
        .filter((t) => !projectId || t.projectId === projectId)
        .filter((t) => !assigneeId || t.assigneeId === assigneeId)
        .filter((t) => !term || t.title.toLowerCase().includes(term) || t.project.name.toLowerCase().includes(term));
      return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length };
    },
    async listByProject(organizationId, projectId) {
      return store.filter((t) => t.organizationId === organizationId && t.projectId === projectId);
    },
    async findById(organizationId, id) {
      return find(organizationId, id);
    },
    async summary() {
      return { open: 0, overdue: 0, completed: 0 };
    },
    async create(organizationId, createdById, data: TaskCreateData & { completedAt: Date | null }) {
      const task = makeTask(organizationId, data.projectId, data.assigneeId, { ...(data as Partial<Task>), createdById });
      store.push(task);
      return task;
    },
    async update(organizationId, id, data: TaskWriteData) {
      const task = find(organizationId, id);
      if (!task) return null;
      Object.assign(task, data);
      return task;
    },
    async delete(organizationId, id) {
      const index = store.findIndex((t) => t.id === id && t.organizationId === organizationId);
      if (index === -1) return false;
      store.splice(index, 1);
      return true;
    },
  };
}

const membersOf = (organizationId: string): OrganizationMember[] =>
  memberships
    .filter((m) => m.organizationId === organizationId)
    .map((m) => ({ id: m.userId, name: m.userId, email: `${m.userId}@test`, role: m.role }));

describe("taskService", () => {
  let store: Task[];
  let service: ReturnType<typeof createTaskService>;
  let acmeTask: Task;
  let globexTask: Task;

  beforeEach(() => {
    seq = 0;
    acmeTask = makeTask(ACME, "acme-web", acmeEmployee.id, { title: "Integrar pasarela de pago" });
    globexTask = makeTask(GLOBEX, "globex-cloud", globexAdmin.id, { title: "Auditoría" });
    store = [acmeTask, globexTask];
    const membershipRepository = {
      find: async (userId: string, organizationId: string) =>
        memberships.find((m) => m.userId === userId && m.organizationId === organizationId) ?? null,
    };
    service = createTaskService({
      taskRepository: createFakeTaskRepository(store),
      projectRepository: {
        existsInOrganization: async (organizationId, id) => projectsByOrg[organizationId]?.some((p) => p.id === id) ?? false,
        listOptions: async (organizationId) => projectsByOrg[organizationId] ?? [],
      },
      membershipRepository: { ...membershipRepository, listMembers: async (organizationId) => membersOf(organizationId) },
      tenantAccess: createTenantAccessService({ membershipRepository }),
      now: () => NOW,
    });
  });

  const page = { page: 1, pageSize: 20 };
  const newTask = (extra: Partial<TaskCreateData> = {}): TaskCreateData => ({
    title: "Nueva",
    projectId: "acme-web",
    assigneeId: acmeEmployee.id,
    ...extra,
  });

  describe("ADMIN", () => {
    it("can create, read, edit, change status/priority, assign and delete", async () => {
      const created = await service.create(acmeAdmin, ACME, newTask());
      assert.equal(created.organizationId, ACME);
      assert.equal(created.createdById, acmeAdmin.id, "creator comes from the session");
      assert.equal((await service.get(acmeAdmin, ACME, created.id)).title, "Nueva");

      assert.equal((await service.update(acmeAdmin, ACME, created.id, { title: "Editada" })).title, "Editada");
      assert.equal((await service.update(acmeAdmin, ACME, created.id, { status: "IN_REVIEW" })).status, "IN_REVIEW");
      assert.equal((await service.update(acmeAdmin, ACME, created.id, { priority: "CRITICAL" })).priority, "CRITICAL");
      assert.equal((await service.update(acmeAdmin, ACME, created.id, { assigneeId: acmeAdmin.id })).assigneeId, acmeAdmin.id);

      await service.delete(acmeAdmin, ACME, created.id);
      await assert.rejects(service.get(acmeAdmin, ACME, created.id), NotFoundError);
    });
  });

  describe("EMPLOYEE", () => {
    it("can create, edit, change status and assign", async () => {
      const created = await service.create(acmeEmployee, ACME, newTask({ assigneeId: acmeAdmin.id }));
      assert.equal(created.createdById, acmeEmployee.id);
      assert.equal((await service.update(acmeEmployee, ACME, acmeTask.id, { status: "BLOCKED" })).status, "BLOCKED");
      assert.equal((await service.update(acmeEmployee, ACME, acmeTask.id, { assigneeId: acmeAdmin.id })).assigneeId, acmeAdmin.id);
    });

    it("cannot delete (403), whether or not the task exists", async () => {
      await assert.rejects(service.delete(acmeEmployee, ACME, acmeTask.id), ForbiddenError);
      await assert.rejects(service.delete(acmeEmployee, ACME, "does-not-exist"), ForbiddenError);
      assert.ok(store.includes(acmeTask));
    });
  });

  describe("CLIENT", () => {
    it("has no access to any task operation", async () => {
      await assert.rejects(service.list(acmeClient, ACME, page), ForbiddenError);
      await assert.rejects(service.get(acmeClient, ACME, acmeTask.id), ForbiddenError);
      await assert.rejects(service.formOptions(acmeClient, ACME), ForbiddenError);
      await assert.rejects(service.listForProject(acmeClient, ACME, "acme-web"), ForbiddenError);
      await assert.rejects(service.create(acmeClient, ACME, newTask()), ForbiddenError);
      await assert.rejects(service.update(acmeClient, ACME, acmeTask.id, { status: "COMPLETED" }), ForbiddenError);
      await assert.rejects(service.delete(acmeClient, ACME, acmeTask.id), ForbiddenError);
      assert.equal(acmeTask.status, "TODO");
      assert.equal(store.length, 2);
    });
  });

  describe("tenant isolation (Acme vs Globex)", () => {
    it("Acme task → Acme user = OK", async () => {
      const task = await service.create(acmeAdmin, ACME, newTask({ assigneeId: acmeEmployee.id }));
      assert.equal(task.assigneeId, acmeEmployee.id);
    });

    it("Acme task → Globex user = BLOCKED (create and reassign)", async () => {
      const isAssigneeError = (error: unknown) =>
        error instanceof ValidationError &&
        JSON.stringify(error.details) === JSON.stringify([{ path: "assigneeId", message: ASSIGNEE_NOT_IN_ORGANIZATION }]);
      await assert.rejects(service.create(acmeAdmin, ACME, newTask({ assigneeId: globexAdmin.id })), isAssigneeError);
      await assert.rejects(service.update(acmeAdmin, ACME, acmeTask.id, { assigneeId: globexAdmin.id }), isAssigneeError);
      assert.equal(acmeTask.assigneeId, acmeEmployee.id);
    });

    it("assignee that does not exist, or a CLIENT member, is rejected the same way", async () => {
      await assert.rejects(service.create(acmeAdmin, ACME, newTask({ assigneeId: "ghost" })), ValidationError);
      await assert.rejects(service.create(acmeAdmin, ACME, newTask({ assigneeId: acmeClient.id })), ValidationError);
    });

    it("Acme user → Globex task = BLOCKED, even knowing its id", async () => {
      // Through Acme's own organization: the id is simply not there.
      await assert.rejects(service.get(acmeAdmin, ACME, globexTask.id), NotFoundError);
      await assert.rejects(service.update(acmeAdmin, ACME, globexTask.id, { title: "Hacked" }), NotFoundError);
      await assert.rejects(service.update(acmeAdmin, ACME, globexTask.id, { assigneeId: acmeAdmin.id }), NotFoundError);
      await assert.rejects(service.delete(acmeAdmin, ACME, globexTask.id), NotFoundError);
      assert.equal(globexTask.title, "Auditoría");
      assert.ok(store.includes(globexTask));
    });

    it("forged organizationId = BLOCKED: naming Globex's organization is not a membership", async () => {
      await assert.rejects(service.list(acmeAdmin, GLOBEX, page), NotFoundError);
      await assert.rejects(service.get(acmeAdmin, GLOBEX, globexTask.id), NotFoundError);
      await assert.rejects(service.create(acmeAdmin, GLOBEX, newTask({ projectId: "globex-cloud", assigneeId: globexAdmin.id })), NotFoundError);
      await assert.rejects(service.update(acmeAdmin, GLOBEX, globexTask.id, { title: "Hacked" }), NotFoundError);
      await assert.rejects(service.delete(acmeAdmin, GLOBEX, globexTask.id), NotFoundError);
    });

    it("Acme task → Globex project = BLOCKED (create and move); unknown projects too", async () => {
      const isProjectError = (error: unknown) =>
        error instanceof ValidationError &&
        JSON.stringify(error.details) === JSON.stringify([{ path: "projectId", message: PROJECT_NOT_IN_ORGANIZATION }]);
      await assert.rejects(service.create(acmeAdmin, ACME, newTask({ projectId: "globex-cloud" })), isProjectError);
      await assert.rejects(service.update(acmeAdmin, ACME, acmeTask.id, { projectId: "globex-cloud" }), isProjectError);
      await assert.rejects(service.create(acmeAdmin, ACME, newTask({ projectId: "nope" })), isProjectError);
      assert.equal(acmeTask.projectId, "acme-web");
    });

    it("lists, project task lists and form options never include another organization's data", async () => {
      assert.deepEqual((await service.list(acmeAdmin, ACME, page)).data.map((t) => t.id), [acmeTask.id]);
      assert.deepEqual(await service.listForProject(acmeAdmin, ACME, "globex-cloud"), []);
      const options = await service.formOptions(acmeAdmin, ACME);
      assert.deepEqual(options.projects.map((p) => p.id), ["acme-web", "acme-app"]);
      // Only Acme staff can be assignees: no Globex users, no CLIENT members.
      assert.deepEqual(options.assignees.map((a) => a.id), [acmeAdmin.id, acmeEmployee.id]);
    });
  });

  describe("completedAt", () => {
    it("is set when a task is created or moved to COMPLETED, and cleared when it leaves it", async () => {
      const done = await service.create(acmeAdmin, ACME, newTask({ status: "COMPLETED" }));
      assert.equal(done.completedAt?.toISOString(), NOW.toISOString());

      const todo = await service.create(acmeAdmin, ACME, newTask());
      assert.equal(todo.completedAt, null);
      assert.equal((await service.update(acmeAdmin, ACME, todo.id, { status: "COMPLETED" })).completedAt?.toISOString(), NOW.toISOString());
      assert.equal((await service.update(acmeAdmin, ACME, todo.id, { status: "IN_PROGRESS" })).completedAt, null);
    });

    it("is untouched by edits that do not change the status", async () => {
      const done = await service.create(acmeAdmin, ACME, newTask({ status: "COMPLETED" }));
      const earlier = new Date("2026-09-01T10:00:00.000Z");
      done.completedAt = earlier;
      assert.equal((await service.update(acmeAdmin, ACME, done.id, { title: "Renombrada" })).completedAt, earlier);
      // Saving the full form again with COMPLETED keeps the original moment.
      assert.equal((await service.update(acmeAdmin, ACME, done.id, { status: "COMPLETED" })).completedAt, earlier);
    });

    it("follows the documented rules (pure function)", () => {
      const t = new Date("2026-10-07T00:00:00.000Z");
      assert.equal(nextCompletedAt(null, "COMPLETED", t), t);
      assert.equal(nextCompletedAt(null, "TODO", t), null);
      assert.equal(nextCompletedAt({ status: "TODO", completedAt: null }, undefined, t), undefined);
      assert.equal(nextCompletedAt({ status: "COMPLETED", completedAt: null }, "COMPLETED", t), t);
      assert.equal(nextCompletedAt({ status: "COMPLETED", completedAt: t }, "CANCELLED", NOW), null);
    });
  });

  describe("dates on partial updates", () => {
    it("checks a new due date against the stored start date", async () => {
      acmeTask.startDate = new Date("2026-10-10T00:00:00.000Z");
      await assert.rejects(
        service.update(acmeAdmin, ACME, acmeTask.id, { dueDate: new Date("2026-10-09T00:00:00.000Z") }),
        ValidationError,
      );
      const ok = await service.update(acmeAdmin, ACME, acmeTask.id, { dueDate: new Date("2026-10-10T00:00:00.000Z") });
      assert.equal(ok.dueDate?.toISOString().slice(0, 10), "2026-10-10");
    });
  });

  describe("search, filters and pagination", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 25; i++) {
        await service.create(acmeAdmin, ACME, {
          title: `QA ${String(i).padStart(2, "0")}`,
          projectId: i % 2 ? "acme-web" : "acme-app",
          assigneeId: i % 3 ? acmeEmployee.id : acmeAdmin.id,
          status: i % 5 === 0 ? "BLOCKED" : "TODO",
          priority: i % 4 === 0 ? "CRITICAL" : "LOW",
        });
      }
    });

    it("paginates with a correct total", async () => {
      const last = await service.list(acmeAdmin, ACME, { page: 3, pageSize: 10 });
      assert.deepEqual(last.meta, { total: 26, page: 3, pageSize: 10 });
      assert.equal(last.data.length, 6);
    });

    it("searches by task title or project name", async () => {
      assert.equal((await service.list(acmeAdmin, ACME, { ...page, search: "pasarela" })).meta.total, 1);
      assert.equal((await service.list(acmeAdmin, ACME, { ...page, pageSize: 100, search: "app interna" })).meta.total, 12);
    });

    it("combines project, assignee, status and priority filters", async () => {
      const result = await service.list(acmeAdmin, ACME, {
        page: 1,
        pageSize: 100,
        projectId: "acme-web",
        assigneeId: acmeEmployee.id,
        status: "BLOCKED",
        priority: "LOW",
      });
      // Odd i, i%3 != 0, i%5 == 0, i%4 != 0 → 5, 25
      assert.deepEqual(result.data.map((t) => t.title), ["QA 05", "QA 25"]);
    });

    it("ids from another organization match nothing", async () => {
      assert.equal((await service.list(acmeAdmin, ACME, { ...page, projectId: "globex-cloud" })).meta.total, 0);
      assert.equal((await service.list(acmeAdmin, ACME, { ...page, assigneeId: globexAdmin.id })).meta.total, 0);
    });
  });
});
