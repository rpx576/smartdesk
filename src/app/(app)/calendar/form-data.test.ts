import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zonedDateTime } from "@/lib/dates";
import type { CalendarEvent } from "@/server/domain/calendar-event";
import { calendarEventUpdateSchema } from "@/server/validation/calendar-event.schema";
import { eventToFormValues, noticeMessage, readEventForm } from "./form-data";

const PROJECT = "018f0000-0000-7000-8000-0000000000a1";

const event = (extra: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: "e1",
  organizationId: "org",
  title: "Revisión",
  description: null,
  type: "DELIVERY",
  startDateTime: zonedDateTime("2026-10-06", "23:15"),
  endDateTime: zonedDateTime("2026-10-06", "23:45"),
  allDay: false,
  location: null,
  createdById: "u1",
  assignedToId: null,
  clientId: null,
  projectId: PROJECT,
  taskId: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  createdBy: null,
  assignedTo: null,
  client: null,
  project: { id: PROJECT, name: "Web" },
  task: null,
  ...extra,
});

describe("readEventForm", () => {
  it("keeps only the event fields", () => {
    const formData = new FormData();
    formData.set("title", "Reunión");
    formData.set("allDay", "on");
    formData.set("organizationId", "forged");
    formData.set("createdById", "forged");
    formData.set("$ACTION_ID_abc", "");
    assert.deepEqual(readEventForm(formData), { title: "Reunión", allDay: "on" });
  });
});

describe("eventToFormValues", () => {
  it("shows the Madrid day and times, even late in the evening (UTC is still the same day)", () => {
    const values = eventToFormValues(event());
    assert.equal(values.date, "2026-10-06");
    assert.equal(values.startTime, "23:15");
    assert.equal(values.endTime, "23:45");
    assert.equal(values.allDay, "");
    assert.equal(values.projectId, PROJECT);
    assert.equal(values.assignedToId, "");
  });

  it("round-trips through the update schema without moving the event", () => {
    const original = event();
    const parsed = calendarEventUpdateSchema.parse(eventToFormValues(original));
    assert.equal(parsed.startDateTime?.getTime(), original.startDateTime.getTime());
    assert.equal(parsed.endDateTime?.getTime(), original.endDateTime.getTime());
  });

  it("all-day events keep their day and leave the times empty", () => {
    const allDay = event({
      allDay: true,
      startDateTime: zonedDateTime("2026-10-25", "00:00"),
      endDateTime: zonedDateTime("2026-10-26", "00:00"),
    });
    const values = eventToFormValues(allDay);
    assert.deepEqual([values.date, values.allDay, values.startTime], ["2026-10-25", "on", ""]);
    const parsed = calendarEventUpdateSchema.parse(values);
    assert.equal(parsed.endDateTime?.getTime(), allDay.endDateTime.getTime());
  });
});

describe("noticeMessage", () => {
  it("only knows its own notices", () => {
    assert.equal(noticeMessage("created"), "Evento creado correctamente.");
    assert.equal(noticeMessage("toString"), undefined);
    assert.equal(noticeMessage(["created"]), undefined);
  });
});
