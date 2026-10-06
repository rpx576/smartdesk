import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import type { Client } from "@/server/domain/client";
import type { Membership } from "@/server/domain/organization";
import type { Project, ProjectCreateData, ProjectUpdateData } from "@/server/domain/project";
import type { SessionUser } from "@/server/domain/user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/server/errors/app-error";
import type { ProjectRepository } from "@/server/repositories/project.repository";
import { CLIENT_NOT_IN_ORGANIZATION, createProjectService } from "./project.service";
import { createTenantAccessService } from "./tenant-access.service";

const ORG_A = "org-a";
const ORG_B = "org-b";

const user = (id: string): SessionUser => ({ id, email: `${id}@test`, name: id });
const admin = user("admin-a");
const employee = user("employee-a");
const clientUser = user("client-a");
const adminB = user("admin-b");

const memberships: Membership[] = [
  { userId: admin.id, organizationId: ORG_A, role: "ADMIN" },
  { userId: employee.id, organizationId: ORG_A, role: "EMPLOYEE" },
  { userId: clientUser.id, organizationId: ORG_A, role: "CLIENT" },
  { userId: adminB.id, organizationId: ORG_B, role: "ADMIN" },
];

function makeClient(id: string, organizationId: string, name: string): Client {
  const now = new Date(0);
  return { id, organizationId, name, email: null, phone: null, company: null, notes: null, status: "ACTIVE", createdAt: now, updatedAt: now };
}

const clientsStore: Client[] = [
  makeClient("client-a1", ORG_A, "Bodegas Rioja"),
  makeClient("client-a2", ORG_A, "Talleres Martín"),
  makeClient("client-b1", ORG_B, "Initech"),
];

let seq = 0;
function makeProject(organizationId: string, clientId: string, name: string, extra: Partial<Project> = {}): Project {
  const client = clientsStore.find((c) => c.id === clientId)!;
  seq += 1;
  return {
    id: `p-${seq}`,
    organizationId,
    clientId,
    name,
    description: null,
    status: "PLANNING",
    priority: "MEDIUM",
    startDate: null,
    dueDate: null,
    budget: null,
    estimatedHours: null,
    createdById: null,
    createdAt: new Date(seq * 1000),
    updatedAt: new Date(seq * 1000),
    client: { id: client.id, name: client.name },
    createdBy: null,
    progress: 0,
    ...extra,
  };
}

/** In-memory repository honouring the same contract (tenant scope, filters, paging). */
function createFakeProjectRepository(store: Project[]): ProjectRepository {
  const find = (organizationId: string, id: string) =>
    store.find((p) => p.id === id && p.organizationId === organizationId) ?? null;

  return {
    async list(organizationId, { search, status, priority, clientId, page, pageSize }) {
      const term = search?.toLowerCase();
      const matches = store
        .filter((p) => p.organizationId === organizationId)
        .filter((p) => !status || p.status === status)
        .filter((p) => !priority || p.priority === priority)
        .filter((p) => !clientId || p.clientId === clientId)
        .filter((p) => !term || p.name.toLowerCase().includes(term) || p.client.name.toLowerCase().includes(term))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return { items: matches.slice((page - 1) * pageSize, page * pageSize), total: matches.length };
    },
    async findById(organizationId, id) {
      return find(organizationId, id);
    },
    async create(organizationId, createdById, data: ProjectCreateData) {
      const project = makeProject(organizationId, data.clientId, data.name, {
        ...(data as Partial<Project>),
        createdById,
      });
      store.push(project);
      return project;
    },
    async update(organizationId, id, data: ProjectUpdateData) {
      const project = find(organizationId, id);
      if (!project) return null;
      Object.assign(project, data);
      return project;
    },
    async delete(organizationId, id) {
      const index = store.findIndex((p) => p.id === id && p.organizationId === organizationId);
      if (index === -1) return false;
      store.splice(index, 1);
      return true;
    },
  };
}

describe("projectService", () => {
  let store: Project[];
  let service: ReturnType<typeof createProjectService>;
  let projectA: Project;
  let projectB: Project;

  beforeEach(() => {
    seq = 0;
    projectA = makeProject(ORG_A, "client-a1", "Nueva tienda online", { status: "ACTIVE", priority: "HIGH" });
    projectB = makeProject(ORG_B, "client-b1", "Migración a la nube");
    store = [projectA, projectB];
    service = createProjectService({
      projectRepository: createFakeProjectRepository(store),
      clientRepository: {
        findById: async (organizationId, id) =>
          clientsStore.find((c) => c.id === id && c.organizationId === organizationId) ?? null,
        listOptions: async (organizationId) =>
          clientsStore.filter((c) => c.organizationId === organizationId).map(({ id, name }) => ({ id, name })),
      },
      tenantAccess: createTenantAccessService({
        membershipRepository: {
          find: async (userId, organizationId) =>
            memberships.find((m) => m.userId === userId && m.organizationId === organizationId) ?? null,
        },
      }),
    });
  });

  const page = { page: 1, pageSize: 20 };

  describe("ADMIN", () => {
    it("can list, read, create, update and delete", async () => {
      assert.deepEqual((await service.list(admin, ORG_A, page)).data.map((p) => p.id), [projectA.id]);
      assert.equal((await service.get(admin, ORG_A, projectA.id)).name, "Nueva tienda online");

      const created = await service.create(admin, ORG_A, { name: "Campaña", clientId: "client-a2" });
      assert.equal(created.organizationId, ORG_A);

      const updated = await service.update(admin, ORG_A, created.id, { status: "COMPLETED" });
      assert.equal(updated.status, "COMPLETED");

      await service.delete(admin, ORG_A, created.id);
      await assert.rejects(service.get(admin, ORG_A, created.id), NotFoundError);
    });

    it("records the authenticated user as creator", async () => {
      const created = await service.create(admin, ORG_A, { name: "X", clientId: "client-a1" });
      assert.equal(created.createdById, admin.id);
    });

    it("gets only the organization's clients as options", async () => {
      assert.deepEqual(
        (await service.clientOptions(admin, ORG_A)).map((c) => c.id),
        ["client-a1", "client-a2"],
      );
    });
  });

  describe("EMPLOYEE", () => {
    it("can read, create and update", async () => {
      await service.get(employee, ORG_A, projectA.id);
      const created = await service.create(employee, ORG_A, { name: "Soporte", clientId: "client-a1" });
      assert.equal(created.createdById, employee.id);
      assert.equal((await service.update(employee, ORG_A, projectA.id, { name: "Renombrado" })).name, "Renombrado");
    });

    it("cannot delete (403), whether or not the project exists", async () => {
      await assert.rejects(service.delete(employee, ORG_A, projectA.id), ForbiddenError);
      await assert.rejects(service.delete(employee, ORG_A, "does-not-exist"), ForbiddenError);
      assert.ok(store.includes(projectA));
    });
  });

  describe("CLIENT", () => {
    it("has no access to any project operation", async () => {
      await assert.rejects(service.list(clientUser, ORG_A, page), ForbiddenError);
      await assert.rejects(service.get(clientUser, ORG_A, projectA.id), ForbiddenError);
      await assert.rejects(service.clientOptions(clientUser, ORG_A), ForbiddenError);
      await assert.rejects(service.create(clientUser, ORG_A, { name: "X", clientId: "client-a1" }), ForbiddenError);
      await assert.rejects(service.update(clientUser, ORG_A, projectA.id, { name: "X" }), ForbiddenError);
      await assert.rejects(service.delete(clientUser, ORG_A, projectA.id), ForbiddenError);
      assert.equal(store.length, 2);
      assert.equal(projectA.name, "Nueva tienda online");
    });
  });

  describe("tenant isolation", () => {
    it("a member of B cannot read, edit or delete A's project even knowing its id", async () => {
      // Through B's own organization (the id simply is not there)...
      await assert.rejects(service.get(adminB, ORG_B, projectA.id), NotFoundError);
      await assert.rejects(service.update(adminB, ORG_B, projectA.id, { name: "Hacked" }), NotFoundError);
      await assert.rejects(service.delete(adminB, ORG_B, projectA.id), NotFoundError);
      // ...and by naming A's organization (not a member).
      await assert.rejects(service.get(adminB, ORG_A, projectA.id), NotFoundError);
      await assert.rejects(service.list(adminB, ORG_A, page), NotFoundError);
      await assert.rejects(service.update(adminB, ORG_A, projectA.id, { name: "Hacked" }), NotFoundError);
      await assert.rejects(service.delete(adminB, ORG_A, projectA.id), NotFoundError);
      assert.equal(projectA.name, "Nueva tienda online");
      assert.ok(store.includes(projectA));
    });

    it("never lists another organization's projects", async () => {
      const result = await service.list(admin, ORG_A, page);
      assert.ok(result.data.every((p) => p.organizationId === ORG_A));
      assert.ok(!result.data.some((p) => p.id === projectB.id));
    });

    it("rejects creating a project for a client of another organization", async () => {
      await assert.rejects(
        service.create(admin, ORG_A, { name: "X", clientId: "client-b1" }),
        (error: unknown) =>
          error instanceof ValidationError &&
          JSON.stringify(error.details) ===
            JSON.stringify([{ path: "clientId", message: CLIENT_NOT_IN_ORGANIZATION }]),
      );
      assert.equal(store.length, 2);
    });

    it("rejects moving a project to a client of another organization", async () => {
      await assert.rejects(service.update(admin, ORG_A, projectA.id, { clientId: "client-b1" }), ValidationError);
      assert.equal(projectA.clientId, "client-a1");
    });

    it("rejects an unknown client id the same way", async () => {
      await assert.rejects(service.create(admin, ORG_A, { name: "X", clientId: "nope" }), ValidationError);
    });
  });

  describe("dates on partial updates", () => {
    it("checks a new due date against the stored start date", async () => {
      projectA.startDate = new Date("2026-10-10T00:00:00.000Z");
      await assert.rejects(
        service.update(admin, ORG_A, projectA.id, { dueDate: new Date("2026-10-01T00:00:00.000Z") }),
        ValidationError,
      );
      const ok = await service.update(admin, ORG_A, projectA.id, { dueDate: new Date("2026-11-01T00:00:00.000Z") });
      assert.equal(ok.dueDate?.toISOString().slice(0, 10), "2026-11-01");
    });
  });

  describe("search, filters and pagination", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 25; i++) {
        await service.create(admin, ORG_A, {
          name: `Proyecto ${String(i).padStart(2, "0")}`,
          clientId: i % 2 ? "client-a1" : "client-a2",
          status: i % 5 === 0 ? "ON_HOLD" : "ACTIVE",
          priority: i % 3 === 0 ? "CRITICAL" : "LOW",
        });
      }
    });

    it("paginates and reports the total", async () => {
      const first = await service.list(admin, ORG_A, { page: 1, pageSize: 10 });
      const last = await service.list(admin, ORG_A, { page: 3, pageSize: 10 });
      assert.equal(first.meta.total, 26);
      assert.equal(first.data.length, 10);
      assert.equal(last.data.length, 6);
      assert.deepEqual(last.meta, { total: 26, page: 3, pageSize: 10 });
    });

    it("searches by project name or client name", async () => {
      const byName = await service.list(admin, ORG_A, { ...page, search: "tienda" });
      assert.deepEqual(byName.data.map((p) => p.id), [projectA.id]);
      const byClient = await service.list(admin, ORG_A, { ...page, pageSize: 100, search: "talleres" });
      assert.equal(byClient.meta.total, 12);
      assert.ok(byClient.data.every((p) => p.clientId === "client-a2"));
    });

    it("combines filters with search", async () => {
      const result = await service.list(admin, ORG_A, {
        page: 1,
        pageSize: 100,
        search: "proyecto",
        status: "ON_HOLD",
        priority: "CRITICAL",
        clientId: "client-a1",
      });
      // i in 1..25 with i%5==0, i%3==0 and i odd => 15
      assert.deepEqual(result.data.map((p) => p.name), ["Proyecto 15"]);
    });

    it("a client id from another organization matches nothing", async () => {
      const result = await service.list(admin, ORG_A, { ...page, clientId: "client-b1" });
      assert.equal(result.meta.total, 0);
    });
  });
});
