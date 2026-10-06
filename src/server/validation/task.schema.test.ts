import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  taskAssigneeSchema,
  taskCreateSchema,
  taskListQuerySchema,
  taskStatusSchema,
  taskUpdateSchema,
} from "./task.schema";

const PROJECT = "018f0000-0000-7000-8000-0000000000a1";
const USER = "018f0000-0000-7000-8000-0000000000b1";
const valid = { title: "Maqueta", projectId: PROJECT, assigneeId: USER };

const messageFor = (input: unknown, field: string) =>
  taskCreateSchema.safeParse(input).error?.issues.find((issue) => issue.path[0] === field)?.message;

describe("taskCreateSchema", () => {
  it("normalizes a full form submission", () => {
    assert.deepEqual(
      taskCreateSchema.parse({
        title: "  Maqueta home  ",
        description: "",
        projectId: PROJECT,
        assigneeId: USER,
        status: "IN_PROGRESS",
        priority: "HIGH",
        startDate: "2026-10-01",
        dueDate: "2026-10-15",
        estimatedHours: "7,5",
        actualHours: "",
      }),
      {
        title: "Maqueta home",
        description: null,
        projectId: PROJECT,
        assigneeId: USER,
        status: "IN_PROGRESS",
        priority: "HIGH",
        startDate: new Date("2026-10-01T00:00:00.000Z"),
        dueDate: new Date("2026-10-15T00:00:00.000Z"),
        estimatedHours: 7.5,
        actualHours: null,
      },
    );
  });

  it("requires title, project and assignee, in Spanish", () => {
    assert.equal(messageFor({ projectId: PROJECT, assigneeId: USER }, "title"), "El título es obligatorio");
    assert.equal(messageFor({ ...valid, title: "   " }, "title"), "El título es obligatorio");
    assert.equal(messageFor({ ...valid, title: "x".repeat(201) }, "title"), "Máximo 200 caracteres");
    assert.equal(messageFor({ ...valid, projectId: "" }, "projectId"), "Selecciona un proyecto");
    assert.equal(messageFor({ ...valid, assigneeId: undefined }, "assigneeId"), "Selecciona un responsable");
    assert.equal(messageFor({ ...valid, assigneeId: "not-a-uuid" }, "assigneeId"), "Selecciona un responsable");
  });

  it("rejects invalid enums", () => {
    assert.equal(messageFor({ ...valid, status: "DONE" }, "status"), "Selecciona un estado válido");
    assert.equal(messageFor({ ...valid, priority: "URGENT" }, "priority"), "Selecciona una prioridad válida");
  });

  it("rejects malformed and impossible dates, and a due date before the start", () => {
    assert.equal(messageFor({ ...valid, startDate: "15/10/2026" }, "startDate"), "Introduce una fecha válida");
    assert.equal(messageFor({ ...valid, dueDate: "2026-02-30" }, "dueDate"), "Introduce una fecha válida");
    assert.equal(
      messageFor({ ...valid, startDate: "2026-10-15", dueDate: "2026-10-14" }, "dueDate"),
      "La fecha límite no puede ser anterior a la de inicio",
    );
    assert.equal(taskCreateSchema.safeParse({ ...valid, startDate: "2026-10-15", dueDate: "2026-10-15" }).success, true);
  });

  it("validates hours as non-negative decimals with at most two digits", () => {
    assert.equal(messageFor({ ...valid, estimatedHours: "-1" }, "estimatedHours"), "No puede ser negativo");
    assert.equal(messageFor({ ...valid, actualHours: "-0,25" }, "actualHours"), "No puede ser negativo");
    assert.equal(messageFor({ ...valid, actualHours: "muchas" }, "actualHours"), "Introduce un número de horas válido");
    assert.equal(messageFor({ ...valid, estimatedHours: "1,234" }, "estimatedHours"), "Máximo dos decimales");
    assert.equal(messageFor({ ...valid, estimatedHours: "1000000" }, "estimatedHours"), "No puede superar 999.999,99");
    assert.equal(taskCreateSchema.parse({ ...valid, actualHours: 0 }).actualHours, 0);
  });

  it("reports every problem in a single submit (dates included)", () => {
    const fields = taskCreateSchema
      .safeParse({ title: "", projectId: "", assigneeId: "", startDate: "2026-10-15", dueDate: "2026-10-01", actualHours: "-1" })
      .error?.issues.map((issue) => issue.path[0]);
    assert.deepEqual(new Set(fields), new Set(["title", "projectId", "assigneeId", "dueDate", "actualHours"]));
  });

  it("rejects fields the browser must never set", () => {
    for (const forged of [
      { organizationId: PROJECT },
      { createdById: USER },
      { completedAt: "2026-10-01" },
      { id: PROJECT },
    ]) {
      assert.equal(taskCreateSchema.safeParse({ ...valid, ...forged }).success, false);
    }
  });
});

describe("taskUpdateSchema and single-field schemas", () => {
  it("accepts partial updates and clears emptied fields", () => {
    assert.deepEqual(taskUpdateSchema.parse({ status: "BLOCKED", dueDate: "", actualHours: "" }), {
      status: "BLOCKED",
      dueDate: null,
      actualHours: null,
    });
  });

  it("rejects empty updates, forged fields and inverted dates", () => {
    assert.equal(taskUpdateSchema.safeParse({}).success, false);
    assert.equal(taskUpdateSchema.safeParse({ title: "x", organizationId: PROJECT }).success, false);
    assert.equal(taskUpdateSchema.safeParse({ startDate: "2026-05-02", dueDate: "2026-05-01" }).success, false);
  });

  it("only accepts their own field", () => {
    assert.deepEqual(taskStatusSchema.parse({ status: "COMPLETED" }), { status: "COMPLETED" });
    assert.equal(taskStatusSchema.safeParse({ status: "COMPLETED", title: "x" }).success, false);
    assert.equal(taskAssigneeSchema.safeParse({ assigneeId: "nope" }).success, false);
  });
});

describe("taskListQuerySchema", () => {
  it("treats empty GET-form values as no filter", () => {
    const parsed = taskListQuerySchema.parse({ search: "", status: "", projectId: "", assigneeId: "", dueFrom: "", sort: "" });
    assert.equal(parsed.status, undefined);
    assert.equal(parsed.dueFrom, undefined);
    assert.equal(parsed.sort, undefined);
    assert.equal(parsed.page, 1);
  });

  it("parses combined filters, dates and sort", () => {
    const parsed = taskListQuerySchema.parse({
      search: " pago ",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      projectId: PROJECT,
      assigneeId: USER,
      dueFrom: "2026-10-01",
      dueTo: "2026-10-31",
      sort: "due",
      page: "2",
    });
    assert.equal(parsed.search, "pago");
    assert.equal(parsed.dueFrom?.toISOString(), "2026-10-01T00:00:00.000Z");
    assert.equal(parsed.dueTo?.toISOString(), "2026-10-31T00:00:00.000Z");
    assert.equal(parsed.sort, "due");
    assert.equal(parsed.page, 2);
  });

  it("rejects invalid filters", () => {
    for (const bad of [{ status: "DONE" }, { assigneeId: "x" }, { dueFrom: "2026-13-01" }, { sort: "random" }, { pageSize: "500" }]) {
      assert.equal(taskListQuerySchema.safeParse(bad).success, false, JSON.stringify(bad));
    }
  });
});
