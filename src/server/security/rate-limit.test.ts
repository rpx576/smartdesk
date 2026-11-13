import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit inside the window and frees it afterwards", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    assert.ok(limiter.tryConsume("a", 0));
    assert.ok(limiter.tryConsume("a", 10));
    assert.ok(!limiter.tryConsume("a", 20));
    assert.ok(limiter.tryConsume("b", 20));
    assert.ok(limiter.tryConsume("a", 1011));
  });

  it("keeps memory bounded", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
    limiter.tryConsume("a", 0);
    limiter.tryConsume("b", 0);
    limiter.tryConsume("c", 0);
    assert.ok(limiter.tryConsume("a", 1), "oldest key was forgotten");
  });
});
