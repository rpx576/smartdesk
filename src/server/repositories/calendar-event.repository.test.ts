import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_EVENT_DURATION_MS } from "@/server/domain/calendar-event";
import { buildConflictWhere, buildEventRangeWhere, overlapWhere } from "./calendar-event.repository";
import { buildTaskRangeWhere } from "./task.repository";

const ORG = "org-a";
const ME = "user-me";
const range = { start: new Date("2026-09-30T22:00:00.000Z"), end: new Date("2026-10-31T23:00:00.000Z") };

describe("overlapWhere", () => {
  it("finds events overlapping [start, end) and bounds the start so the index can be used", () => {
    assert.deepEqual(overlapWhere(range), {
      startDateTime: { gte: new Date(range.start.getTime() - MAX_EVENT_DURATION_MS), lt: range.end },
      endDateTime: { gt: range.start },
    });
  });
});

describe("buildEventRangeWhere", () => {
  it("always scopes the query to the organization and the period", () => {
    assert.deepEqual(buildEventRangeWhere(ORG, range, {}, ME), { organizationId: ORG, ...overlapWhere(range) });
  });

  it("combines type, project and assignee filters with AND", () => {
    const where = buildEventRangeWhere(ORG, range, { eventType: "DELIVERY", projectId: "p1", userId: "u1" }, ME);
    assert.equal(where.organizationId, ORG);
    assert.equal(where.type, "DELIVERY");
    assert.equal(where.projectId, "p1");
    assert.equal(where.assignedToId, "u1");
  });

  it("'mine' means created by or assigned to the viewer; search looks at title, description, project and client", () => {
    const where = buildEventRangeWhere(ORG, range, { mine: true, search: "web" }, ME);
    assert.deepEqual(where.AND, [
      { OR: [{ assignedToId: ME }, { createdById: ME }] },
      {
        OR: [
          { title: { contains: "web", mode: "insensitive" } },
          { description: { contains: "web", mode: "insensitive" } },
          { project: { name: { contains: "web", mode: "insensitive" } } },
          { client: { name: { contains: "web", mode: "insensitive" } } },
        ],
      },
    ]);
    assert.equal(where.organizationId, ORG, "search never widens beyond the tenant");
  });

  it("cannot be widened: ids from another organization still require this one", () => {
    const where = buildEventRangeWhere(ORG, range, { projectId: "project-of-org-b", userId: "user-of-org-b" }, ME);
    assert.equal(where.organizationId, ORG);
  });
});

describe("buildConflictWhere", () => {
  it("looks for other timed events of the same assignee in the same organization", () => {
    assert.deepEqual(buildConflictWhere(ORG, "u1", range, "e1"), {
      organizationId: ORG,
      assignedToId: "u1",
      allDay: false,
      ...overlapWhere(range),
      id: { not: "e1" },
    });
  });
});

describe("buildTaskRangeWhere", () => {
  const days = { firstDay: new Date("2026-10-01T00:00:00.000Z"), lastDay: new Date("2026-10-31T00:00:00.000Z") };

  it("needs a due date in or after the period and a span that starts before its end; hides cancelled", () => {
    assert.deepEqual(buildTaskRangeWhere(ORG, days, {}, ME), {
      organizationId: ORG,
      dueDate: { gte: days.firstDay },
      status: { not: "CANCELLED" },
      AND: [{ OR: [{ startDate: null, dueDate: { lte: days.lastDay } }, { startDate: { lte: days.lastDay } }] }],
    });
  });

  it("shows a status when asked for, including CANCELLED", () => {
    assert.equal(buildTaskRangeWhere(ORG, days, { taskStatus: "CANCELLED" }, ME).status, "CANCELLED");
  });

  it("filters by project, assignee, mine and search inside the tenant", () => {
    const where = buildTaskRangeWhere(ORG, days, { projectId: "p1", userId: "u1", mine: true, search: "pago" }, ME);
    assert.equal(where.organizationId, ORG);
    assert.equal(where.projectId, "p1");
    assert.equal(where.assigneeId, "u1");
    const and = where.AND as unknown[];
    assert.deepEqual(and[1], { assigneeId: ME });
    assert.deepEqual(and[2], {
      OR: [
        { title: { contains: "pago", mode: "insensitive" } },
        { description: { contains: "pago", mode: "insensitive" } },
        { project: { name: { contains: "pago", mode: "insensitive" } } },
        { project: { client: { name: { contains: "pago", mode: "insensitive" } } } },
      ],
    });
  });
});
