import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loginSchema, registerSchema } from "./auth.schema";

describe("loginSchema", () => {
  it("normalizes the email", () => {
    assert.deepEqual(loginSchema.parse({ email: "  Ana@Acme.TEST ", password: "x" }), {
      email: "ana@acme.test",
      password: "x",
    });
  });

  it("rejects missing or oversized values", () => {
    assert.equal(loginSchema.safeParse({ email: "ana@acme.test", password: "" }).success, false);
    assert.equal(loginSchema.safeParse({ email: "nope", password: "x" }).success, false);
    assert.equal(
      loginSchema.safeParse({ email: "ana@acme.test", password: "x".repeat(129) }).success,
      false,
    );
  });
});

describe("registerSchema", () => {
  const valid = {
    organizationName: "Acme",
    name: "Ana",
    email: "ana@acme.test",
    password: "twelve-chars",
  };

  it("accepts a valid sign-up", () => {
    assert.equal(registerSchema.safeParse(valid).success, true);
  });

  it("requires passwords of at least 12 characters", () => {
    assert.equal(registerSchema.safeParse({ ...valid, password: "short-pass" }).success, false);
  });
});
