import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { noticeMessage, projectsListHref, projectToFormValues, readProjectForm } from "./form-data";

const CLIENT = "018f0000-0000-7000-8000-0000000000c1";

describe("readProjectForm", () => {
  it("keeps only the project fields and drops forged tenant data", () => {
    const form = new FormData();
    form.set("name", "Web");
    form.set("clientId", CLIENT);
    form.set("budget", "100");
    form.set("organizationId", "018f0000-0000-7000-8000-000000000002");
    form.set("createdById", "someone-else");
    form.set("progress", "100");
    form.set("$ACTION_ID_abc", "");

    assert.deepEqual(readProjectForm(form), { name: "Web", clientId: CLIENT, budget: "100" });
  });
});

describe("projectToFormValues", () => {
  it("turns a stored project into form strings (decimal comma, YYYY-MM-DD dates)", () => {
    const values = projectToFormValues({
      id: "p1",
      organizationId: "o1",
      clientId: CLIENT,
      name: "Web",
      description: null,
      status: "ACTIVE",
      priority: "HIGH",
      startDate: new Date("2026-11-01T00:00:00.000Z"),
      dueDate: null,
      budget: 7500.5,
      estimatedHours: null,
      createdById: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      client: { id: CLIENT, name: "Acme" },
      createdBy: null,
      progress: 0,
      taskStats: { completed: 0, considered: 0 },
    });
    assert.deepEqual(values, {
      name: "Web",
      description: "",
      clientId: CLIENT,
      status: "ACTIVE",
      priority: "HIGH",
      startDate: "2026-11-01",
      dueDate: "",
      budget: "7500,5",
      estimatedHours: "",
    });
  });
});

describe("noticeMessage", () => {
  it("maps known notices and ignores anything else", () => {
    assert.equal(noticeMessage("deleted"), "Proyecto eliminado.");
    assert.equal(noticeMessage("toString"), undefined);
    assert.equal(noticeMessage("<b>hola</b>"), undefined);
  });
});

describe("projectsListHref", () => {
  it("keeps search, filters and page", () => {
    assert.equal(
      projectsListHref({ search: "web", status: "ACTIVE", priority: "HIGH", clientId: CLIENT, page: "2", notice: "deleted" }),
      `/projects?search=web&status=ACTIVE&priority=HIGH&clientId=${CLIENT}&page=2&notice=deleted`,
    );
  });

  it("drops invalid values and never leaves /projects", () => {
    assert.equal(projectsListHref({}), "/projects");
    assert.equal(projectsListHref({ status: "HACKED" }), "/projects");
    assert.equal(projectsListHref({ search: "//evil.com" }), "/projects?search=%2F%2Fevil.com");
  });
});
