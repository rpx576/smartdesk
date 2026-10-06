import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Task } from "@/server/domain/task";
import { noticeMessage, readTaskForm, taskToFormValues, tasksListHref } from "./form-data";

const PROJECT = "018f0000-0000-7000-8000-0000000000a1";
const USER = "018f0000-0000-7000-8000-0000000000b1";

describe("readTaskForm", () => {
  it("keeps only task fields and drops forged tenant/derived data", () => {
    const form = new FormData();
    form.set("title", "Maqueta");
    form.set("projectId", PROJECT);
    form.set("assigneeId", USER);
    form.set("actualHours", "3");
    form.set("organizationId", "018f0000-0000-7000-8000-000000000002");
    form.set("createdById", "someone-else");
    form.set("completedAt", "2020-01-01");
    form.set("$ACTION_ID_abc", "");
    assert.deepEqual(readTaskForm(form), { title: "Maqueta", projectId: PROJECT, assigneeId: USER, actualHours: "3" });
  });

  it("can be restricted to one field (quick status/priority/assignee changes)", () => {
    const form = new FormData();
    form.set("status", "COMPLETED");
    form.set("title", "ignored");
    assert.deepEqual(readTaskForm(form, ["status"]), { status: "COMPLETED" });
  });
});

describe("taskToFormValues", () => {
  it("turns a stored task into form strings (decimal comma, YYYY-MM-DD dates)", () => {
    const task: Task = {
      id: "t1",
      organizationId: "o1",
      projectId: PROJECT,
      title: "Maqueta",
      description: null,
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: USER,
      createdById: USER,
      startDate: new Date("2026-10-01T00:00:00.000Z"),
      dueDate: null,
      completedAt: null,
      estimatedHours: 7.5,
      actualHours: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      project: { id: PROJECT, name: "Web", client: { id: "c1", name: "Acme" } },
      assignee: { id: USER, name: "Ana", email: "ana@test" },
      createdBy: null,
    };
    assert.deepEqual(taskToFormValues(task), {
      title: "Maqueta",
      description: "",
      projectId: PROJECT,
      assigneeId: USER,
      status: "IN_PROGRESS",
      priority: "HIGH",
      startDate: "2026-10-01",
      dueDate: "",
      estimatedHours: "7,5",
      actualHours: "",
    });
  });
});

describe("noticeMessage", () => {
  it("maps known notices and ignores anything else", () => {
    assert.equal(noticeMessage("status"), "Estado actualizado.");
    assert.equal(noticeMessage("assignee"), "Responsable actualizado.");
    assert.equal(noticeMessage("hasOwnProperty"), undefined);
    assert.equal(noticeMessage("<script>"), undefined);
  });
});

describe("tasksListHref", () => {
  it("keeps search, filters, dates, sort and page", () => {
    assert.equal(
      tasksListHref({
        search: "pago",
        status: "BLOCKED",
        priority: "HIGH",
        projectId: PROJECT,
        assigneeId: USER,
        dueFrom: new Date("2026-10-01T00:00:00.000Z"),
        dueTo: "2026-10-31",
        sort: "due",
        page: "2",
        notice: "deleted",
      }),
      `/tasks?search=pago&status=BLOCKED&priority=HIGH&projectId=${PROJECT}&assigneeId=${USER}&dueFrom=2026-10-01&dueTo=2026-10-31&sort=due&page=2&notice=deleted`,
    );
  });

  it("drops invalid values and never leaves /tasks", () => {
    assert.equal(tasksListHref({}), "/tasks");
    assert.equal(tasksListHref({ status: "HACKED" }), "/tasks");
    assert.equal(tasksListHref({ search: "//evil.com", page: "1" }), "/tasks?search=%2F%2Fevil.com");
    assert.equal(tasksListHref({ search: null, sort: "" }), "/tasks");
  });
});
