import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OrganizationWithRole } from "@/server/domain/organization";
import type { SessionUser } from "@/server/domain/user";
import { createOrganizationService } from "./organization.service";

const acme: OrganizationWithRole = { id: "org-acme", name: "Acme", slug: "acme", role: "ADMIN" };
const globex: OrganizationWithRole = { id: "org-globex", name: "Globex", slug: "globex", role: "EMPLOYEE" };

const byUser: Record<string, OrganizationWithRole[]> = {
  multi: [acme, globex],
  single: [acme],
  none: [],
};

const service = createOrganizationService({
  membershipRepository: { listOrganizationsForUser: async (userId) => byUser[userId] ?? [] },
});
const user = (id: string): SessionUser => ({ id, email: `${id}@test`, name: null });

describe("organizationService.resolveActive", () => {
  it("honours the preferred organization when the user is a member", async () => {
    const result = await service.resolveActive(user("multi"), "org-globex");
    assert.equal(result?.active.id, "org-globex");
    assert.equal(result?.organizations.length, 2);
  });

  it("ignores a preferred organization the user does not belong to", async () => {
    const result = await service.resolveActive(user("single"), "org-globex");
    assert.equal(result?.active.id, "org-acme");
  });

  it("falls back to the first membership without a preference", async () => {
    assert.equal((await service.resolveActive(user("multi")))?.active.id, "org-acme");
  });

  it("returns null for users without organizations", async () => {
    assert.equal(await service.resolveActive(user("none"), "org-acme"), null);
  });
});
