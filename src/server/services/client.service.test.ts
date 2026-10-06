import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import type { Client, ClientCreateData, ClientUpdateData } from "@/server/domain/client";
import type { Membership } from "@/server/domain/organization";
import type { SessionUser } from "@/server/domain/user";
import { ForbiddenError, NotFoundError } from "@/server/errors/app-error";
import type { ClientRepository } from "@/server/repositories/client.repository";
import { createClientService } from "./client.service";
import { createTenantAccessService } from "./tenant-access.service";

const ORG_A = "org-a";
const ORG_B = "org-b";

const admin: SessionUser = { id: "admin-a", email: "admin@a.test", name: null };
const employee: SessionUser = { id: "employee-a", email: "employee@a.test", name: null };
const clientUser: SessionUser = { id: "client-a", email: "client@a.test", name: null };
const outsider: SessionUser = { id: "admin-b", email: "admin@b.test", name: null };

const memberships: Membership[] = [
  { userId: admin.id, organizationId: ORG_A, role: "ADMIN" },
  { userId: employee.id, organizationId: ORG_A, role: "EMPLOYEE" },
  { userId: clientUser.id, organizationId: ORG_A, role: "CLIENT" },
  { userId: outsider.id, organizationId: ORG_B, role: "ADMIN" },
];

function makeClient(id: string, organizationId: string, name: string): Client {
  return {
    id,
    organizationId,
    name,
    email: null,
    phone: null,
    company: null,
    notes: null,
    status: "ACTIVE",
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

/** In-memory repository honouring the same tenant-scoping contract. */
function createFakeClientRepository(store: Client[]): ClientRepository {
  const find = (organizationId: string, id: string) =>
    store.find((c) => c.id === id && c.organizationId === organizationId) ?? null;

  return {
    async list(organizationId, { page, pageSize }) {
      const all = store.filter((c) => c.organizationId === organizationId);
      return { items: all.slice((page - 1) * pageSize, page * pageSize), total: all.length };
    },
    async summary(organizationId) {
      const own = store.filter((c) => c.organizationId === organizationId);
      const byStatus = { LEAD: 0, ACTIVE: 0, INACTIVE: 0 };
      for (const c of own) byStatus[c.status]++;
      return { total: own.length, byStatus };
    },
    async listOptions(organizationId) {
      return store
        .filter((c) => c.organizationId === organizationId)
        .map(({ id, name }) => ({ id, name }));
    },
    async listRecent(organizationId, limit) {
      return store.filter((c) => c.organizationId === organizationId).slice(0, limit);
    },
    async findById(organizationId, id) {
      return find(organizationId, id);
    },
    async create(organizationId, data: ClientCreateData) {
      const client: Client = {
        ...makeClient(`c-${store.length + 1}`, organizationId, data.name),
        ...data,
      };
      store.push(client);
      return client;
    },
    async update(organizationId, id, data: ClientUpdateData) {
      const client = find(organizationId, id);
      if (!client) return null;
      Object.assign(client, data);
      return client;
    },
    async delete(organizationId, id) {
      const index = store.findIndex((c) => c.id === id && c.organizationId === organizationId);
      if (index === -1) return false;
      store.splice(index, 1);
      return true;
    },
  };
}

describe("clientService", () => {
  let store: Client[];
  let service: ReturnType<typeof createClientService>;

  beforeEach(() => {
    store = [makeClient("c-1", ORG_A, "Alpha"), makeClient("c-2", ORG_B, "Beta")];
    service = createClientService({
      clientRepository: createFakeClientRepository(store),
      tenantAccess: createTenantAccessService({
        membershipRepository: {
          find: async (userId, organizationId) =>
            memberships.find(
              (m) => m.userId === userId && m.organizationId === organizationId,
            ) ?? null,
        },
      }),
    });
  });

  const page = { page: 1, pageSize: 20 };

  describe("tenant isolation", () => {
    it("lists only the clients of the requested organization", async () => {
      const result = await service.list(admin, ORG_A, page);
      assert.deepEqual(
        result.data.map((c) => c.id),
        ["c-1"],
      );
      assert.deepEqual(result.meta, { total: 1, page: 1, pageSize: 20 });
    });

    it("rejects users who are not members of the organization with 404", async () => {
      await assert.rejects(service.list(outsider, ORG_A, page), NotFoundError);
      await assert.rejects(service.create(outsider, ORG_A, { name: "X" }), NotFoundError);
      assert.equal(store.length, 2);
    });

    it("cannot read, update or delete another organization's client through its id", async () => {
      await assert.rejects(service.get(admin, ORG_A, "c-2"), NotFoundError);
      await assert.rejects(service.update(admin, ORG_A, "c-2", { name: "Hacked" }), NotFoundError);
      await assert.rejects(service.delete(admin, ORG_A, "c-2"), NotFoundError);
      assert.equal(store.find((c) => c.id === "c-2")?.name, "Beta");
    });

    it("creates clients inside the authorized organization", async () => {
      const created = await service.create(employee, ORG_A, { name: "Gamma" });
      assert.equal(created.organizationId, ORG_A);
    });

    it("does not let a member of B act on A's client by pairing it with B's organization id", async () => {
      // The outsider is ADMIN of B and knows the id of A's client.
      await assert.rejects(service.get(outsider, ORG_B, "c-1"), NotFoundError);
      await assert.rejects(service.update(outsider, ORG_B, "c-1", { name: "Hacked" }), NotFoundError);
      await assert.rejects(service.delete(outsider, ORG_B, "c-1"), NotFoundError);
      assert.equal(store.find((c) => c.id === "c-1")?.name, "Alpha");
    });

    it("rejects non-members on every write with 404 and leaves data untouched", async () => {
      await assert.rejects(service.update(outsider, ORG_A, "c-1", { name: "Hacked" }), NotFoundError);
      await assert.rejects(service.delete(outsider, ORG_A, "c-1"), NotFoundError);
      assert.deepEqual(
        store.map((c) => [c.id, c.name]),
        [
          ["c-1", "Alpha"],
          ["c-2", "Beta"],
        ],
      );
    });

    it("keeps updated clients in their organization", async () => {
      const updated = await service.update(admin, ORG_A, "c-1", { name: "Renamed", status: "INACTIVE" });
      assert.equal(updated.organizationId, ORG_A);
    });
  });

  describe("role permissions", () => {
    it("lets employees read and write but not delete", async () => {
      assert.equal((await service.get(employee, ORG_A, "c-1")).id, "c-1");
      const updated = await service.update(employee, ORG_A, "c-1", { name: "Renamed" });
      assert.equal(updated.name, "Renamed");
      await assert.rejects(service.delete(employee, ORG_A, "c-1"), ForbiddenError);
      assert.equal(store.length, 2);
    });

    it("lets admins delete", async () => {
      await service.delete(admin, ORG_A, "c-1");
      assert.deepEqual(
        store.map((c) => c.id),
        ["c-2"],
      );
    });

    it("denies the CLIENT role any access to the client directory", async () => {
      await assert.rejects(service.list(clientUser, ORG_A, page), ForbiddenError);
      await assert.rejects(service.get(clientUser, ORG_A, "c-1"), ForbiddenError);
      await assert.rejects(service.create(clientUser, ORG_A, { name: "X" }), ForbiddenError);
      await assert.rejects(service.update(clientUser, ORG_A, "c-1", { name: "X" }), ForbiddenError);
      await assert.rejects(service.delete(clientUser, ORG_A, "c-1"), ForbiddenError);
      assert.equal(store.length, 2);
      assert.equal(store[0].name, "Alpha");
    });

    it("checks the permission before looking the client up (no existence oracle)", async () => {
      // An employee gets 403 for delete whether or not the id exists.
      await assert.rejects(service.delete(employee, ORG_A, "c-1"), ForbiddenError);
      await assert.rejects(service.delete(employee, ORG_A, "does-not-exist"), ForbiddenError);
    });
  });

  it("returns 404 for a client that does not exist", async () => {
    await assert.rejects(service.get(admin, ORG_A, "missing"), NotFoundError);
  });
});
