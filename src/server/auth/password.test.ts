import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the original password and rejects others", async () => {
    const hash = await hashPassword("correct horse battery staple");
    assert.equal(await verifyPassword("correct horse battery staple", hash), true);
    assert.equal(await verifyPassword("correct horse battery stapl", hash), false);
  });

  it("never stores the password and salts every hash", async () => {
    const [a, b] = await Promise.all([hashPassword("same-password"), hashPassword("same-password")]);
    assert.notEqual(a, b);
    assert.ok(!a.includes("same-password"));
    assert.match(a, /^scrypt\$16384\$8\$1\$/);
  });

  it("rejects malformed stored hashes", async () => {
    assert.equal(await verifyPassword("x", ""), false);
    assert.equal(await verifyPassword("x", "bcrypt$whatever"), false);
  });
});
