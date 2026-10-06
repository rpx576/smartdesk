import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildProjectWhere, countsByProject, paginationArgs } from "./project.repository";

describe("countsByProject", () => {
  it("folds one grouped query into task counts per project (no N+1)", () => {
    const counts = countsByProject([
      { projectId: "p1", status: "COMPLETED", _count: { _all: 6 } },
      { projectId: "p1", status: "TODO", _count: { _all: 4 } },
      { projectId: "p2", status: "CANCELLED", _count: { _all: 2 } },
    ]);
    assert.equal(counts.get("p1")?.COMPLETED, 6);
    assert.equal(counts.get("p1")?.TODO, 4);
    assert.equal(counts.get("p1")?.BLOCKED, 0);
    assert.equal(counts.get("p2")?.CANCELLED, 2);
    assert.equal(counts.has("p3"), false);
  });
});

const ORG = "org-a";

describe("buildProjectWhere", () => {
  it("always scopes the query to the organization", () => {
    assert.deepEqual(buildProjectWhere(ORG, {}), { organizationId: ORG });
  });

  it("searches the project name and the client's name, inside the tenant", () => {
    const where = buildProjectWhere(ORG, { search: "rioja" });
    assert.equal(where.organizationId, ORG);
    assert.deepEqual(where.OR, [
      { name: { contains: "rioja", mode: "insensitive" } },
      { client: { name: { contains: "rioja", mode: "insensitive" } } },
    ]);
  });

  it("combines search with status, priority and client filters (AND)", () => {
    const where = buildProjectWhere(ORG, {
      search: "web",
      status: "ACTIVE",
      priority: "HIGH",
      clientId: "client-1",
    });
    assert.deepEqual(
      { ...where, OR: undefined },
      { organizationId: ORG, status: "ACTIVE", priority: "HIGH", clientId: "client-1", OR: undefined },
    );
    assert.equal(where.OR?.length, 2);
  });

  it("cannot be widened by filters: a foreign client id still requires this organization", () => {
    const where = buildProjectWhere(ORG, { clientId: "client-of-org-b" });
    assert.deepEqual(where, { organizationId: ORG, clientId: "client-of-org-b" });
  });
});

describe("paginationArgs", () => {
  it("translates page and size into skip/take", () => {
    assert.deepEqual(paginationArgs(1, 20), { skip: 0, take: 20 });
    assert.deepEqual(paginationArgs(3, 20), { skip: 40, take: 20 });
  });
});
