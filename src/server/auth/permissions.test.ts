import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clientCapabilities, projectCapabilities, roleHasPermission, taskCapabilities } from "./permissions";

describe("clientCapabilities (what the clients UI offers)", () => {
  it("lets ADMIN see create, edit and delete actions", () => {
    assert.deepEqual(clientCapabilities("ADMIN"), { canRead: true, canWrite: true, canDelete: true });
  });

  it("lets EMPLOYEE create and edit but not delete", () => {
    assert.deepEqual(clientCapabilities("EMPLOYEE"), { canRead: true, canWrite: true, canDelete: false });
  });

  it("gives CLIENT no access to the client directory", () => {
    assert.deepEqual(clientCapabilities("CLIENT"), { canRead: false, canWrite: false, canDelete: false });
  });

  it("matches the permission matrix the services enforce", () => {
    for (const role of ["ADMIN", "EMPLOYEE", "CLIENT"] as const) {
      const caps = clientCapabilities(role);
      assert.equal(caps.canRead, roleHasPermission(role, "client:read"));
      assert.equal(caps.canWrite, roleHasPermission(role, "client:write"));
      assert.equal(caps.canDelete, roleHasPermission(role, "client:delete"));
    }
  });
});

describe("task permissions", () => {
  it("lets ADMIN read, write (create, edit, status, priority, assign) and delete", () => {
    assert.deepEqual(taskCapabilities("ADMIN"), { canRead: true, canWrite: true, canDelete: true });
  });

  it("lets EMPLOYEE do everything except deleting", () => {
    assert.deepEqual(taskCapabilities("EMPLOYEE"), { canRead: true, canWrite: true, canDelete: false });
  });

  it("gives CLIENT no access to the tasks CRUD", () => {
    assert.deepEqual(taskCapabilities("CLIENT"), { canRead: false, canWrite: false, canDelete: false });
  });

  it("only internal staff can be in charge of a task", () => {
    assert.equal(roleHasPermission("ADMIN", "task:assignable"), true);
    assert.equal(roleHasPermission("EMPLOYEE", "task:assignable"), true);
    assert.equal(roleHasPermission("CLIENT", "task:assignable"), false);
  });

  it("derives the UI capabilities from the matrix the services enforce", () => {
    for (const role of ["ADMIN", "EMPLOYEE", "CLIENT"] as const) {
      const caps = taskCapabilities(role);
      assert.equal(caps.canRead, roleHasPermission(role, "task:read"));
      assert.equal(caps.canWrite, roleHasPermission(role, "task:write"));
      assert.equal(caps.canDelete, roleHasPermission(role, "task:delete"));
    }
  });
});

describe("project permissions", () => {
  it("lets ADMIN read, create, edit and delete projects", () => {
    assert.deepEqual(projectCapabilities("ADMIN"), { canRead: true, canWrite: true, canDelete: true });
  });

  it("lets EMPLOYEE read, create and edit but not delete", () => {
    assert.deepEqual(projectCapabilities("EMPLOYEE"), { canRead: true, canWrite: true, canDelete: false });
  });

  it("gives CLIENT no access to the projects CRUD", () => {
    assert.deepEqual(projectCapabilities("CLIENT"), { canRead: false, canWrite: false, canDelete: false });
  });

  it("derives the UI capabilities from the matrix the services enforce", () => {
    for (const role of ["ADMIN", "EMPLOYEE", "CLIENT"] as const) {
      const caps = projectCapabilities(role);
      assert.equal(caps.canRead, roleHasPermission(role, "project:read"));
      assert.equal(caps.canWrite, roleHasPermission(role, "project:write"));
      assert.equal(caps.canDelete, roleHasPermission(role, "project:delete"));
    }
  });
});
