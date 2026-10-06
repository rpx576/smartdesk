import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { projectCreateSchema, projectListQuerySchema, projectUpdateSchema } from "./project.schema";

const CLIENT = "018f0000-0000-7000-8000-0000000000c1";
const valid = { name: "Web", clientId: CLIENT };

const messageFor = (input: unknown, field: string) =>
  projectCreateSchema.safeParse(input).error?.issues.find((issue) => issue.path[0] === field)?.message;

describe("projectCreateSchema", () => {
  it("normalizes a full form submission", () => {
    const result = projectCreateSchema.parse({
      name: "  Nueva web  ",
      description: "",
      clientId: CLIENT,
      status: "ACTIVE",
      priority: "HIGH",
      startDate: "2026-09-01",
      dueDate: "2026-12-15",
      budget: "18500,50",
      estimatedHours: "320",
    });
    assert.deepEqual(result, {
      name: "Nueva web",
      description: null,
      clientId: CLIENT,
      status: "ACTIVE",
      priority: "HIGH",
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDate: new Date("2026-12-15T00:00:00.000Z"),
      budget: 18500.5,
      estimatedHours: 320,
    });
  });

  it("treats empty optional fields as no value", () => {
    const result = projectCreateSchema.parse({ ...valid, startDate: "", dueDate: "", budget: "", estimatedHours: "" });
    assert.equal(result.startDate, null);
    assert.equal(result.budget, null);
  });

  it("accepts JSON numbers from the API", () => {
    assert.equal(projectCreateSchema.parse({ ...valid, budget: 1200.25 }).budget, 1200.25);
  });

  it("requires a name and a client, in Spanish", () => {
    assert.equal(messageFor({ clientId: CLIENT }, "name"), "El nombre es obligatorio");
    assert.equal(messageFor({ name: "  ", clientId: CLIENT }, "name"), "El nombre es obligatorio");
    assert.equal(messageFor({ name: "Web" }, "clientId"), "Selecciona un cliente");
    assert.equal(messageFor({ name: "Web", clientId: "" }, "clientId"), "Selecciona un cliente");
    assert.equal(messageFor({ name: "x".repeat(201), clientId: CLIENT }, "name"), "Máximo 200 caracteres");
  });

  it("rejects invalid status and priority", () => {
    assert.equal(messageFor({ ...valid, status: "DONE" }, "status"), "Selecciona un estado válido");
    assert.equal(messageFor({ ...valid, priority: "URGENT" }, "priority"), "Selecciona una prioridad válida");
  });

  it("rejects malformed and impossible dates", () => {
    assert.equal(messageFor({ ...valid, startDate: "01/09/2026" }, "startDate"), "Introduce una fecha válida");
    assert.equal(messageFor({ ...valid, dueDate: "2026-02-31" }, "dueDate"), "Introduce una fecha válida");
  });

  it("reports inverted dates together with other errors (single submit)", () => {
    const issues = projectCreateSchema.safeParse({
      name: "",
      clientId: "",
      startDate: "2026-11-10",
      dueDate: "2026-11-01",
      budget: "-5",
    }).error?.issues.map((issue) => issue.path[0]);
    assert.deepEqual(new Set(issues), new Set(["name", "clientId", "budget", "dueDate"]));
  });

  it("does not allow a due date before the start date", () => {
    assert.equal(
      messageFor({ ...valid, startDate: "2026-10-10", dueDate: "2026-10-09" }, "dueDate"),
      "La fecha límite no puede ser anterior a la de inicio",
    );
    assert.equal(projectCreateSchema.safeParse({ ...valid, startDate: "2026-10-10", dueDate: "2026-10-10" }).success, true);
  });

  it("rejects negative, non-numeric or over-precise amounts", () => {
    assert.equal(messageFor({ ...valid, budget: "-1" }, "budget"), "No puede ser negativo");
    assert.equal(messageFor({ ...valid, estimatedHours: "-0.5" }, "estimatedHours"), "No puede ser negativo");
    assert.equal(messageFor({ ...valid, budget: "1.000,50" }, "budget"), "Introduce un presupuesto válido");
    assert.equal(messageFor({ ...valid, budget: "abc" }, "budget"), "Introduce un presupuesto válido");
    assert.equal(messageFor({ ...valid, budget: "10.555" }, "budget"), "Máximo dos decimales");
    assert.equal(projectCreateSchema.safeParse({ ...valid, budget: "0" }).success, true);
  });

  it("rejects fields the client must never set", () => {
    for (const forged of [{ organizationId: CLIENT }, { createdById: CLIENT }, { id: CLIENT }, { progress: 50 }]) {
      assert.equal(projectCreateSchema.safeParse({ ...valid, ...forged }).success, false);
    }
  });
});

describe("projectUpdateSchema", () => {
  it("accepts partial updates and clears emptied fields", () => {
    assert.deepEqual(projectUpdateSchema.parse({ status: "ON_HOLD", dueDate: "", budget: "" }), {
      status: "ON_HOLD",
      dueDate: null,
      budget: null,
    });
  });

  it("rejects empty updates, foreign fields and inverted dates", () => {
    assert.equal(projectUpdateSchema.safeParse({}).success, false);
    assert.equal(projectUpdateSchema.safeParse({ name: "A", organizationId: CLIENT }).success, false);
    assert.equal(projectUpdateSchema.safeParse({ startDate: "2026-05-02", dueDate: "2026-05-01" }).success, false);
  });
});

describe("projectListQuerySchema", () => {
  it("treats empty filter values from GET forms as no filter", () => {
    const parsed = projectListQuerySchema.parse({ search: "", status: "", priority: "", clientId: "" });
    assert.deepEqual(parsed, {
      search: undefined,
      status: undefined,
      priority: undefined,
      clientId: undefined,
      page: 1,
      pageSize: 20,
    });
  });

  it("parses combined filters and pagination", () => {
    assert.deepEqual(
      projectListQuerySchema.parse({ search: " web ", status: "ACTIVE", priority: "HIGH", clientId: CLIENT, page: "2" }),
      { search: "web", status: "ACTIVE", priority: "HIGH", clientId: CLIENT, page: 2, pageSize: 20 },
    );
  });

  it("rejects invalid filters", () => {
    assert.equal(projectListQuerySchema.safeParse({ status: "DONE" }).success, false);
    assert.equal(projectListQuerySchema.safeParse({ clientId: "not-a-uuid" }).success, false);
    assert.equal(projectListQuerySchema.safeParse({ pageSize: "1000" }).success, false);
  });
});
