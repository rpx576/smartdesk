import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Client } from "@/server/domain/client";
import type { Membership } from "@/server/domain/organization";
import type { SessionUser } from "@/server/domain/user";
import { NotFoundError } from "@/server/errors/app-error";
import { createDashboardService, RECENT_CLIENTS_LIMIT } from "./dashboard.service";
import { createTenantAccessService } from "./tenant-access.service";

const user = (id: string): SessionUser => ({ id, email: `${id}@test`, name: null });

const memberships: Membership[] = [
  { userId: "admin-a", organizationId: "org-a", role: "ADMIN" },
  { userId: "employee-a", organizationId: "org-a", role: "EMPLOYEE" },
  { userId: "client-a", organizationId: "org-a", role: "CLIENT" },
  { userId: "admin-b", organizationId: "org-b", role: "ADMIN" },
];

function makeClient(i: number, organizationId: string, status: Client["status"]): Client {
  return {
    id: `c-${organizationId}-${i}`,
    organizationId,
    name: `Client ${i}`,
    email: null,
    phone: null,
    company: null,
    notes: null,
    status,
    createdAt: new Date(2026, 0, i),
    updatedAt: new Date(2026, 0, i),
  };
}

const store: Client[] = [
  ...Array.from({ length: 7 }, (_, i) => makeClient(i + 1, "org-a", i % 3 === 0 ? "LEAD" : "ACTIVE")),
  makeClient(1, "org-b", "INACTIVE"),
];

const calls: string[] = [];
const service = createDashboardService({
  clientRepository: {
    async summary(organizationId) {
      calls.push(`summary:${organizationId}`);
      const own = store.filter((c) => c.organizationId === organizationId);
      const byStatus = { LEAD: 0, ACTIVE: 0, INACTIVE: 0 };
      for (const c of own) byStatus[c.status]++;
      return { total: own.length, byStatus };
    },
    async listRecent(organizationId, limit) {
      calls.push(`recent:${organizationId}`);
      return store
        .filter((c) => c.organizationId === organizationId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    },
  },
  tenantAccess: createTenantAccessService({
    membershipRepository: {
      find: async (userId, organizationId) =>
        memberships.find((m) => m.userId === userId && m.organizationId === organizationId) ?? null,
    },
  }),
});

describe("dashboardService.getOverview", () => {
  it("returns real client figures for the user's own organization only", async () => {
    const overview = await service.getOverview(user("employee-a"), "org-a");

    assert.equal(overview.role, "EMPLOYEE");
    assert.ok(overview.clients);
    assert.equal(overview.clients.total, 7);
    assert.deepEqual(overview.clients.byStatus, { LEAD: 3, ACTIVE: 4, INACTIVE: 0 });
    assert.equal(overview.clients.recent.length, RECENT_CLIENTS_LIMIT);
    assert.ok(overview.clients.recent.every((c) => c.organizationId === "org-a"));
    assert.equal(overview.clients.recent[0].id, "c-org-a-7");
  });

  it("rejects non-members with 404 before touching client data", async () => {
    calls.length = 0;
    await assert.rejects(service.getOverview(user("admin-b"), "org-a"), NotFoundError);
    assert.deepEqual(calls, []);
  });

  it("gives the CLIENT role the page but no client directory", async () => {
    calls.length = 0;
    const overview = await service.getOverview(user("client-a"), "org-a");
    assert.deepEqual(overview, { role: "CLIENT", clients: null });
    assert.deepEqual(calls, []);
  });
});
