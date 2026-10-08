import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDays,
  calendarDateToDay,
  dayToCalendarDate,
  isPastDue,
  startOfZonedDay,
  todayCalendarDate,
  todayIsoDay,
  weekdayIndex,
  zonedDateTime,
  zonedDay,
  zonedMinutes,
  zonedTime,
} from "./dates";

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

describe("business time zone helpers (events)", () => {
  it("converts wall-clock times in Madrid to instants, in summer and winter time", () => {
    assert.equal(zonedDateTime("2026-10-06", "10:00").toISOString(), "2026-10-06T08:00:00.000Z");
    assert.equal(zonedDateTime("2026-12-15", "10:00").toISOString(), "2026-12-15T09:00:00.000Z");
    assert.equal(startOfZonedDay("2026-10-06").toISOString(), "2026-10-05T22:00:00.000Z");
    assert.equal(startOfZonedDay("2026-01-06").toISOString(), "2026-01-05T23:00:00.000Z");
  });

  it("reads the business day and time back from an instant, across midnight", () => {
    const lateEvening = new Date("2026-10-06T22:30:00.000Z"); // 00:30 on 7 Oct in Madrid
    assert.equal(zonedDay(lateEvening), "2026-10-07");
    assert.equal(zonedTime(lateEvening), "00:30");
    assert.equal(zonedMinutes(lateEvening), 30);
    assert.equal(zonedDay(new Date("2026-10-06T21:59:00.000Z")), "2026-10-06");
    assert.equal(zonedTime(new Date("2026-10-06T21:59:00.000Z")), "23:59");
  });

  it("round-trips every quarter hour of a normal day", () => {
    for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
      const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
      const instant = zonedDateTime("2026-06-10", time);
      assert.equal(zonedDay(instant), "2026-06-10");
      assert.equal(zonedTime(instant), time);
    }
  });

  it("handles the DST changes: 23-hour and 25-hour days", () => {
    // 29 Mar 2026: clocks go from 02:00 to 03:00.
    const springDay = startOfZonedDay("2026-03-30").getTime() - startOfZonedDay("2026-03-29").getTime();
    assert.equal(springDay / 3_600_000, 23);
    // A skipped time resolves one hour later; times after the change are exact.
    assert.equal(zonedTime(zonedDateTime("2026-03-29", "02:30")), "03:30");
    assert.equal(zonedDateTime("2026-03-29", "03:00").toISOString(), "2026-03-29T01:00:00.000Z");
    // 25 Oct 2026: clocks go back from 03:00 to 02:00.
    const autumnDay = startOfZonedDay("2026-10-26").getTime() - startOfZonedDay("2026-10-25").getTime();
    assert.equal(autumnDay / 3_600_000, 25);
    // The ambiguous 02:30 resolves to its first occurrence (still summer time).
    assert.equal(zonedDateTime("2026-10-25", "02:30").toISOString(), "2026-10-25T00:30:00.000Z");
    assert.equal(zonedDateTime("2026-10-25", "12:00").toISOString(), "2026-10-25T11:00:00.000Z");
  });

  it("does calendar-day arithmetic without time zone drift", () => {
    assert.equal(addDays("2026-10-31", 1), "2026-11-01");
    assert.equal(addDays("2026-03-28", 2), "2026-03-30");
    assert.equal(addDays("2026-01-01", -1), "2025-12-31");
    assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  });

  it("numbers weekdays from Monday", () => {
    assert.equal(weekdayIndex("2026-10-05"), 0); // Monday
    assert.equal(weekdayIndex("2026-10-11"), 6); // Sunday
  });

  it("converts stored calendar dates (UTC midnight) to and from days", () => {
    assert.equal(calendarDateToDay(new Date("2026-10-15T00:00:00.000Z")), "2026-10-15");
    assert.equal(dayToCalendarDate("2026-10-15").toISOString(), "2026-10-15T00:00:00.000Z");
    assert.equal(todayIsoDay(new Date("2026-10-06T23:30:00.000Z")), "2026-10-07");
  });
});
