import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calendarEventCreateSchema,
  calendarEventListQuerySchema,
  calendarEventUpdateSchema,
  calendarQuerySchema,
  END_BEFORE_START,
} from "./calendar-event.schema";

const ID = "018f0000-0000-7000-8000-0000000000a1";
const valid = { title: "Reunión de arranque", date: "2026-10-06", startTime: "10:00", endTime: "11:30" };

const messageFor = (input: unknown, field: string) =>
  calendarEventCreateSchema.safeParse(input).error?.issues.find((issue) => issue.path[0] === field)?.message;

describe("calendarEventCreateSchema", () => {
  it("turns a form submission into instants in Europe/Madrid", () => {
    assert.deepEqual(
      calendarEventCreateSchema.parse({
        ...valid,
        title: "  Reunión de arranque  ",
        description: "",
        type: "MEETING",
        location: " Oficina ",
        assignedToId: ID,
        clientId: "",
        projectId: "",
        taskId: "",
      }),
      {
        title: "Reunión de arranque",
        description: null,
        type: "MEETING",
        location: "Oficina",
        assignedToId: ID,
        clientId: null,
        projectId: null,
        taskId: null,
        // 10:00 and 11:30 in Madrid (summer time, UTC+2).
        startDateTime: new Date("2026-10-06T08:00:00.000Z"),
        endDateTime: new Date("2026-10-06T09:30:00.000Z"),
        allDay: false,
      },
    );
  });

  it("uses winter time after the October change", () => {
    const parsed = calendarEventCreateSchema.parse({ ...valid, date: "2026-11-02" });
    assert.equal(parsed.startDateTime.toISOString(), "2026-11-02T09:00:00.000Z");
  });

  it("stores an all-day event from local midnight to the next local midnight, ignoring times", () => {
    const parsed = calendarEventCreateSchema.parse({ title: "Entrega", date: "2026-10-06", allDay: "on", startTime: "", endTime: "" });
    assert.equal(parsed.allDay, true);
    assert.equal(parsed.startDateTime.toISOString(), "2026-10-05T22:00:00.000Z");
    assert.equal(parsed.endDateTime.toISOString(), "2026-10-06T22:00:00.000Z");
    // 25-hour day (clocks go back on 25 Oct 2026).
    const autumn = calendarEventCreateSchema.parse({ title: "Entrega", date: "2026-10-25", allDay: true });
    assert.equal(autumn.endDateTime.getTime() - autumn.startDateTime.getTime(), 25 * 3_600_000);
  });

  it("accepts the API booleans and the absent checkbox", () => {
    assert.equal(calendarEventCreateSchema.parse({ ...valid, allDay: false }).allDay, false);
    assert.equal(calendarEventCreateSchema.parse(valid).allDay, false);
    assert.equal(calendarEventCreateSchema.safeParse({ ...valid, allDay: "maybe" }).success, false);
  });

  it("requires title and a valid day, in Spanish", () => {
    assert.equal(messageFor({ ...valid, title: "  " }, "title"), "El título es obligatorio");
    assert.equal(messageFor({ ...valid, title: "x".repeat(201) }, "title"), "Máximo 200 caracteres");
    assert.equal(messageFor({ ...valid, date: "" }, "date"), "Introduce una fecha válida");
    assert.equal(messageFor({ ...valid, date: "2026-02-30" }, "date"), "Introduce una fecha válida");
    assert.equal(messageFor({ ...valid, type: "PARTY" }, "type"), "Selecciona un tipo válido");
  });

  it("requires both times for a timed event, and the end after the start", () => {
    assert.equal(messageFor({ ...valid, startTime: "" }, "startTime"), "Indica la hora de inicio");
    assert.equal(messageFor({ ...valid, endTime: undefined }, "endTime"), "Indica la hora de fin");
    assert.equal(messageFor({ ...valid, startTime: "25:00" }, "startTime"), "Introduce una hora válida (HH:MM)");
    assert.equal(messageFor({ ...valid, startTime: "11:00", endTime: "10:00" }, "endTime"), END_BEFORE_START);
    // Zero-length events are rejected too.
    assert.equal(messageFor({ ...valid, startTime: "11:00", endTime: "11:00" }, "endTime"), END_BEFORE_START);
  });

  it("reports timing errors even when other fields fail", () => {
    const fields = calendarEventCreateSchema
      .safeParse({ title: "", date: "2026-10-06", startTime: "12:00", endTime: "09:00", assignedToId: "x" })
      .error?.issues.map((issue) => issue.path[0]);
    assert.deepEqual(new Set(fields), new Set(["title", "endTime", "assignedToId"]));
  });

  it("validates linked ids as UUIDs", () => {
    assert.equal(messageFor({ ...valid, clientId: "abc" }, "clientId"), "Selecciona un cliente");
    assert.equal(messageFor({ ...valid, projectId: "abc" }, "projectId"), "Selecciona un proyecto");
    assert.equal(messageFor({ ...valid, taskId: "abc" }, "taskId"), "Selecciona una tarea");
  });

  it("rejects fields the browser must never set", () => {
    for (const forged of [
      { organizationId: ID },
      { createdById: ID },
      { startDateTime: "2026-10-06T08:00:00.000Z" },
      { id: ID },
    ]) {
      assert.equal(calendarEventCreateSchema.safeParse({ ...valid, ...forged }).success, false, JSON.stringify(forged));
    }
  });
});

describe("calendarEventUpdateSchema", () => {
  it("accepts partial updates without timing and clears emptied fields", () => {
    assert.deepEqual(calendarEventUpdateSchema.parse({ title: "Nuevo", location: "" }), { title: "Nuevo", location: null });
  });

  it("needs the whole timing when changing it", () => {
    assert.equal(calendarEventUpdateSchema.safeParse({ startTime: "10:00" }).success, false);
    assert.equal(calendarEventUpdateSchema.safeParse({ date: "2026-10-06" }).success, false);
    const allDay = calendarEventUpdateSchema.parse({ date: "2026-10-06", allDay: true });
    assert.equal(allDay.startDateTime?.toISOString(), "2026-10-05T22:00:00.000Z");
    const timed = calendarEventUpdateSchema.parse({ date: "2026-10-06", startTime: "09:00", endTime: "09:15" });
    assert.equal(timed.allDay, false);
    assert.equal(timed.endDateTime?.toISOString(), "2026-10-06T07:15:00.000Z");
  });

  it("rejects empty and forged updates", () => {
    assert.equal(calendarEventUpdateSchema.safeParse({}).success, false);
    assert.equal(calendarEventUpdateSchema.safeParse({ title: "x", organizationId: ID }).success, false);
  });
});

describe("calendar query schemas", () => {
  it("treats empty GET values as no filter", () => {
    const parsed = calendarQuerySchema.parse({ view: "", date: "", show: "", mine: "", projectId: "", eventType: "", taskStatus: "", search: "" });
    const defined = Object.entries(parsed).filter(([, value]) => value !== undefined);
    assert.deepEqual(defined, [["page", 1]]);
  });

  it("parses view, day and filters", () => {
    const parsed = calendarQuerySchema.parse({ view: "week", date: "2026-10-06", show: "tasks", mine: "1", taskStatus: "CANCELLED", search: " web " });
    assert.equal(parsed.view, "week");
    assert.equal(parsed.date, "2026-10-06");
    assert.equal(parsed.mine, true);
    assert.equal(parsed.search, "web");
  });

  it("rejects invalid values", () => {
    for (const bad of [{ view: "year" }, { date: "2026-13-01" }, { show: "notes" }, { userId: "x" }, { eventType: "PARTY" }]) {
      assert.equal(calendarQuerySchema.safeParse(bad).success, false, JSON.stringify(bad));
    }
  });

  it("limits API ranges to a valid, bounded period", () => {
    assert.equal(calendarEventListQuerySchema.safeParse({ from: "2026-10-01", to: "2026-11-01" }).success, true);
    assert.equal(calendarEventListQuerySchema.safeParse({ from: "2026-10-01", to: "2026-10-01" }).success, false);
    assert.equal(calendarEventListQuerySchema.safeParse({ from: "2026-10-01", to: "2027-01-01" }).success, false);
    assert.equal(calendarEventListQuerySchema.safeParse({ to: "2026-10-01" }).success, false);
  });
});
