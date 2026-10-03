import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import { ForbiddenError } from "@/server/errors/app-error";
import { errorResponse } from "./route";

describe("errorResponse", () => {
  it("maps application errors to their status and code", async () => {
    const response = errorResponse(new ForbiddenError());
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error.code, "FORBIDDEN");
  });

  it("maps validation failures to 400 with field details", async () => {
    const parsed = z.object({ name: z.string() }).safeParse({});
    const response = errorResponse(parsed.error);
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "VALIDATION_ERROR");
    assert.equal(body.error.details[0].path, "name");
  });

  it("hides the details of unexpected errors", async (t) => {
    const log = t.mock.method(console, "error", () => {});
    const response = errorResponse(new Error("password=hunter2 at db.internal"));
    assert.equal(response.status, 500);
    assert.ok(!(await response.text()).includes("hunter2"));
    assert.equal(log.mock.callCount(), 1);
  });
});
