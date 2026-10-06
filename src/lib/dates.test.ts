import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPastDue, todayCalendarDate } from "./dates";

describe("todayCalendarDate", () => {
  it("uses the business calendar day (Europe/Madrid), not the UTC one", () => {
    // 23:30 UTC on 6 Oct is already 7 Oct in Madrid (UTC+2 in summer time).
    assert.equal(todayCalendarDate(new Date("2026-10-06T23:30:00.000Z")).toISOString(), "2026-10-07T00:00:00.000Z");
    // 22:30 UTC on 6 Jan is 23:30 in Madrid (UTC+1 in winter): still 6 Jan.
    assert.equal(todayCalendarDate(new Date("2026-01-06T22:30:00.000Z")).toISOString(), "2026-01-06T00:00:00.000Z");
  });
});

describe("isPastDue", () => {
  const today = new Date("2026-10-07T00:00:00.000Z");

  it("is true only for days before today", () => {
    assert.equal(isPastDue(new Date("2026-10-06T00:00:00.000Z"), today), true);
    assert.equal(isPastDue(new Date("2026-10-07T00:00:00.000Z"), today), false);
    assert.equal(isPastDue(new Date("2026-10-08T00:00:00.000Z"), today), false);
    assert.equal(isPastDue(null, today), false);
  });
});
