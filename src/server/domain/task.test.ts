import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeProgress, emptyTaskCounts, isOpenStatus, type TaskCounts } from "./task";

const counts = (partial: Partial<TaskCounts>): TaskCounts => ({ ...emptyTaskCounts(), ...partial });

describe("computeProgress", () => {
  it("is completed over all tasks: 6 of 10 completed = 60%", () => {
    assert.deepEqual(computeProgress(counts({ COMPLETED: 6, TODO: 2, IN_PROGRESS: 1, BLOCKED: 1 })), {
      percent: 60,
      completed: 6,
      considered: 10,
    });
  });

  it("ignores cancelled tasks (neither done nor pending)", () => {
    assert.equal(computeProgress(counts({ COMPLETED: 2, IN_REVIEW: 2, CANCELLED: 6 })).percent, 50);
  });

  it("counts TODO, IN_PROGRESS, IN_REVIEW and BLOCKED as pending", () => {
    assert.equal(computeProgress(counts({ COMPLETED: 1, TODO: 1, IN_PROGRESS: 1, IN_REVIEW: 1, BLOCKED: 1 })).percent, 20);
  });

  it("is 0% without tasks or with only cancelled ones, and 100% when all are done", () => {
    assert.equal(computeProgress(emptyTaskCounts()).percent, 0);
    assert.equal(computeProgress(counts({ CANCELLED: 3 })).percent, 0);
    assert.equal(computeProgress(counts({ COMPLETED: 3, CANCELLED: 1 })).percent, 100);
  });

  it("rounds to whole percentages", () => {
    assert.equal(computeProgress(counts({ COMPLETED: 1, TODO: 2 })).percent, 33);
    assert.equal(computeProgress(counts({ COMPLETED: 2, TODO: 1 })).percent, 67);
  });
});

describe("isOpenStatus", () => {
  it("treats completed and cancelled tasks as closed", () => {
    assert.deepEqual(
      (["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "COMPLETED", "CANCELLED"] as const).filter(isOpenStatus),
      ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED"],
    );
  });
});
