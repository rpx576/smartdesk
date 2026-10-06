import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTaskWhere, taskOrderBy } from "./task.repository";

const ORG = "org-a";

describe("buildTaskWhere", () => {
  it("always scopes the query to the organization", () => {
    assert.deepEqual(buildTaskWhere(ORG, {}), { organizationId: ORG });
  });

  it("searches the task title and the project's name, inside the tenant", () => {
    const where = buildTaskWhere(ORG, { search: "pago" });
    assert.equal(where.organizationId, ORG);
    assert.deepEqual(where.OR, [
      { title: { contains: "pago", mode: "insensitive" } },
      { project: { name: { contains: "pago", mode: "insensitive" } } },
    ]);
  });

  it("combines every filter with AND, including an inclusive due-date range", () => {
    const dueFrom = new Date("2026-10-01T00:00:00.000Z");
    const dueTo = new Date("2026-10-31T00:00:00.000Z");
    const where = buildTaskWhere(ORG, {
      status: "BLOCKED",
      priority: "HIGH",
      projectId: "p1",
      assigneeId: "u1",
      dueFrom,
      dueTo,
    });
    assert.deepEqual(where, {
      organizationId: ORG,
      status: "BLOCKED",
      priority: "HIGH",
      projectId: "p1",
      assigneeId: "u1",
      dueDate: { gte: dueFrom, lte: dueTo },
    });
  });

  it("supports open-ended date ranges", () => {
    const dueTo = new Date("2026-10-31T00:00:00.000Z");
    assert.deepEqual(buildTaskWhere(ORG, { dueTo }).dueDate, { lte: dueTo });
  });

  it("cannot be widened: foreign project/assignee ids still require this organization", () => {
    assert.deepEqual(buildTaskWhere(ORG, { projectId: "project-of-org-b", assigneeId: "user-of-org-b" }), {
      organizationId: ORG,
      projectId: "project-of-org-b",
      assigneeId: "user-of-org-b",
    });
  });
});

describe("taskOrderBy", () => {
  it("defaults to most recent first", () => {
    assert.deepEqual(taskOrderBy(), [{ createdAt: "desc" }, { id: "desc" }]);
  });

  it("orders by due date with undated tasks last", () => {
    assert.deepEqual(taskOrderBy("due")[0], { dueDate: { sort: "asc", nulls: "last" } });
  });

  it("orders by priority, most urgent first (enum order LOW < … < CRITICAL)", () => {
    assert.deepEqual(taskOrderBy("priority")[0], { priority: "desc" });
  });

  it("always ends with a unique key so pages never overlap", () => {
    for (const sort of ["recent", "due", "priority"] as const) {
      assert.deepEqual(taskOrderBy(sort).at(-1), { id: "desc" });
    }
  });
});
