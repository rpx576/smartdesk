import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACCOUNT_HOME, safeNext } from "./redirect";

describe("safeNext", () => {
  it("keeps SmartDesk paths", () => {
    assert.equal(safeNext("/smartdesk"), "/smartdesk");
    assert.equal(safeNext("/smartdesk/dashboard"), "/smartdesk/dashboard");
  });

  it("falls back to the account page for anything else", () => {
    const unsafe = [
      undefined,
      null,
      "",
      "/",
      "//evil.com",
      "https://evil.com",
      "/smartdeskx",
      "/smartdesk//evil.com",
      "/smartdesk/../cuenta",
      "/smartdesk?next=//evil.com",
      ["/smartdesk"],
    ];
    for (const value of unsafe) assert.equal(safeNext(value), ACCOUNT_HOME);
  });
});
