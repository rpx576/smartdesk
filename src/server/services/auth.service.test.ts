import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import type { UserCredentials } from "@/server/domain/user";
import { ConflictError } from "@/server/errors/app-error";
import type { NewOrganizationWithOwner } from "@/server/repositories/organization.repository";
import { createAuthService, makeSlug } from "./auth.service";

describe("authService", () => {
  let users: UserCredentials[];
  let created: NewOrganizationWithOwner[];
  let service: ReturnType<typeof createAuthService>;

  beforeEach(async () => {
    users = [
      {
        id: "u-1",
        email: "ana@acme.test",
        name: "Ana",
        passwordHash: await hashPassword("a-very-long-password"),
      },
      { id: "u-2", email: "nopass@acme.test", name: null, passwordHash: null },
    ];
    created = [];
    service = createAuthService({
      userRepository: {
        findCredentialsByEmail: async (email) => users.find((u) => u.email === email) ?? null,
        existsByEmail: async (email) => users.some((u) => u.email === email),
      },
      organizationRepository: {
        createWithOwner: async (input) => {
          created.push(input);
          return {
            organization: { id: "org-new", ...input.organization },
            owner: { id: "u-new", email: input.owner.email, name: input.owner.name },
          };
        },
      },
    });
  });

  describe("verifyCredentials", () => {
    it("returns the user without the password hash for valid credentials", async () => {
      const user = await service.verifyCredentials({
        email: "ana@acme.test",
        password: "a-very-long-password",
      });
      assert.deepEqual(user, { id: "u-1", email: "ana@acme.test", name: "Ana" });
    });

    it("returns null for a wrong password, an unknown email or a user without password", async (t) => {
      t.mock.method(console, "warn", () => {});
      const attempts = [
        { email: "ana@acme.test", password: "wrong-password" },
        { email: "ghost@acme.test", password: "a-very-long-password" },
        { email: "nopass@acme.test", password: "anything" },
      ];
      for (const attempt of attempts) {
        assert.equal(await service.verifyCredentials(attempt), null);
      }
    });
  });

  describe("registerOrganization", () => {
    const input = {
      organizationName: "Café Martínez",
      name: "Marta",
      email: "marta@cafe.test",
      password: "another-long-password",
    };

    it("creates the organization with a hashed password for its owner", async (t) => {
      t.mock.method(console, "info", () => {});
      const result = await service.registerOrganization(input);

      assert.equal(result.owner.email, "marta@cafe.test");
      assert.equal(created.length, 1);
      const { organization, owner } = created[0];
      assert.equal(organization.name, "Café Martínez");
      assert.match(organization.slug, /^cafe-martinez-[0-9a-f]{6}$/);
      assert.notEqual(owner.passwordHash, input.password);
      assert.equal(await verifyPassword(input.password, owner.passwordHash), true);
    });

    it("rejects an email that already has an account", async () => {
      await assert.rejects(
        service.registerOrganization({ ...input, email: "ana@acme.test" }),
        ConflictError,
      );
      assert.equal(created.length, 0);
    });
  });
});

describe("makeSlug", () => {
  it("falls back to a generic prefix when the name has no usable characters", () => {
    assert.match(makeSlug("!!!"), /^org-[0-9a-f]{6}$/);
  });
});
