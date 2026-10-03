import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clientCreateSchema, clientListQuerySchema, clientUpdateSchema } from "./client.schema";

describe("clientCreateSchema", () => {
  it("normalizes input", () => {
    const result = clientCreateSchema.parse({
      name: "  Acme  ",
      email: "Sales@Acme.COM",
      phone: "",
      notes: null,
    });
    assert.deepEqual(result, { name: "Acme", email: "sales@acme.com", phone: null, notes: null });
  });

  it("requires a name", () => {
    assert.equal(clientCreateSchema.safeParse({ name: "   " }).success, false);
    assert.equal(clientCreateSchema.safeParse({}).success, false);
  });

  it("rejects invalid emails and statuses", () => {
    assert.equal(clientCreateSchema.safeParse({ name: "A", email: "nope" }).success, false);
    assert.equal(clientCreateSchema.safeParse({ name: "A", status: "DELETED" }).success, false);
  });

  it("rejects unknown fields such as organizationId", () => {
    const result = clientCreateSchema.safeParse({ name: "A", organizationId: "other-tenant" });
    assert.equal(result.success, false);
  });
});

describe("clientUpdateSchema", () => {
  it("accepts partial updates", () => {
    assert.deepEqual(clientUpdateSchema.parse({ status: "INACTIVE" }), { status: "INACTIVE" });
  });

  it("rejects empty updates", () => {
    assert.equal(clientUpdateSchema.safeParse({}).success, false);
  });
});

describe("clientListQuerySchema", () => {
  it("applies pagination defaults and coerces numbers", () => {
    assert.deepEqual(clientListQuerySchema.parse({}), { page: 1, pageSize: 20 });
    assert.deepEqual(clientListQuerySchema.parse({ page: "3", pageSize: "50" }), {
      page: 3,
      pageSize: 50,
    });
  });

  it("caps the page size", () => {
    assert.equal(clientListQuerySchema.safeParse({ pageSize: "1000" }).success, false);
  });
});
