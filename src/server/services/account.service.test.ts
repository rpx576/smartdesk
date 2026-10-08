import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { verifyPassword } from "@/server/auth/password";
import { ConflictError } from "@/server/errors/app-error";
import { createAccountService } from "./account.service";

type StoredUser = { id: string; email: string; name: string; passwordHash: string };

describe("accountService", () => {
  let users: StoredUser[];
  let organizations: { userId: string; name: string; slug: string }[];
  let service: ReturnType<typeof createAccountService>;

  beforeEach(() => {
    users = [];
    organizations = [];
    service = createAccountService({
      userRepository: {
        async existsByEmail(email) {
          return users.some((user) => user.email === email);
        },
        async create(data) {
          const user = { id: "user-" + (users.length + 1), ...data };
          users.push(user);
          return { id: user.id, email: user.email, name: user.name };
        },
      },
      organizationRepository: {
        async createForUser(userId, organization) {
          organizations.push({ userId, ...organization });
          return { id: "org-" + organizations.length, ...organization };
        },
      },
    });
  });

  it("registers an account with a hashed password and no organization", async () => {
    const user = await service.register({ name: "Ana", email: "ana@example.test", password: "a-long-password" });

    assert.deepEqual(user, { id: "user-1", email: "ana@example.test", name: "Ana" });
    assert.notEqual(users[0].passwordHash, "a-long-password");
    assert.equal(await verifyPassword("a-long-password", users[0].passwordHash), true);
    assert.equal(organizations.length, 0);
  });

  it("rejects an email that already has an account", async () => {
    await service.register({ name: "Ana", email: "ana@example.test", password: "a-long-password" });

    await assert.rejects(
      service.register({ name: "Otra", email: "ana@example.test", password: "another-password" }),
      ConflictError,
    );
    assert.equal(users.length, 1);
  });

  it("creates the organization for the signed-in account", async () => {
    const user = { id: "user-9", email: "ana@example.test", name: "Ana" };
    const organization = await service.createOrganization(user, { organizationName: "Taller Ana" });

    assert.equal(organization.name, "Taller Ana");
    assert.match(organization.slug, /^taller-ana-[0-9a-f]{6}$/);
    assert.equal(organizations[0].userId, "user-9");
  });
});
