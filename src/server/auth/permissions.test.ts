import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calendarCapabilities,
  canModifyEvent,
  clientCapabilities,
  projectCapabilities,
  roleHasPermission,
  taskCapabilities,
} from "./permissions";

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

describe("calendar permissions", () => {
  const ME = "user-me";
  const OTHER = "user-other";
  const event = (createdById: string | null, assignedToId: string | null) => ({ createdById, assignedToId });

  it("lets ADMIN and EMPLOYEE read and create events; only ADMIN manages every event", () => {
    assert.deepEqual(calendarCapabilities("ADMIN"), { canRead: true, canCreate: true, canManageAll: true });
    assert.deepEqual(calendarCapabilities("EMPLOYEE"), { canRead: true, canCreate: true, canManageAll: false });
  });

  it("gives CLIENT no access to the calendar in V1", () => {
    assert.deepEqual(calendarCapabilities("CLIENT"), { canRead: false, canCreate: false, canManageAll: false });
    assert.equal(canModifyEvent("CLIENT", ME, event(ME, ME)), false);
  });

  it("ADMIN can modify any event of the organization", () => {
    assert.equal(canModifyEvent("ADMIN", ME, event(OTHER, OTHER)), true);
    assert.equal(canModifyEvent("ADMIN", ME, event(null, null)), true);
  });

  it("EMPLOYEE can modify only events they created or are assigned to", () => {
    assert.equal(canModifyEvent("EMPLOYEE", ME, event(ME, OTHER)), true);
    assert.equal(canModifyEvent("EMPLOYEE", ME, event(OTHER, ME)), true);
    assert.equal(canModifyEvent("EMPLOYEE", ME, event(OTHER, OTHER)), false);
    assert.equal(canModifyEvent("EMPLOYEE", ME, event(null, null)), false);
  });

  it("only internal staff can be in charge of an event", () => {
    assert.equal(roleHasPermission("ADMIN", "calendar:assignable"), true);
    assert.equal(roleHasPermission("EMPLOYEE", "calendar:assignable"), true);
    assert.equal(roleHasPermission("CLIENT", "calendar:assignable"), false);
  });
});
