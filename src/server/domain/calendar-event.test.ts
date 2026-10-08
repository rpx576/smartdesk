import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zonedDateTime } from "@/lib/dates";
import {
  combineItems,
  compareItems,
  eventToItem,
  itemDays,
  overlaps,
  taskToItem,
  type CalendarEvent,
  type CalendarTask,
} from "./calendar-event";

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const task = (extra: Partial<CalendarTask> = {}): CalendarTask => ({
  id: "t1",
  title: "Maqueta",
  status: "IN_PROGRESS",
  priority: "HIGH",
  startDate: null,
  dueDate: day("2026-10-08"),
  project: { id: "p1", name: "Tienda online", client: { id: "c1", name: "Bodegas" } },
  assignee: { id: "u1", name: "Lucía", email: "lucia@test" },
  ...extra,
});

const event = (extra: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: "e1",
  organizationId: "org",
  title: "Reunión",
  description: null,
  type: "MEETING",
  startDateTime: zonedDateTime("2026-10-06", "10:00"),
  endDateTime: zonedDateTime("2026-10-06", "11:00"),
  allDay: false,
  location: "Oficina",
  createdById: "u1",
  assignedToId: "u2",
  clientId: "c1",
  projectId: "p1",
  taskId: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  createdBy: null,
  assignedTo: { id: "u2", name: "Pablo", email: "pablo@test" },
  client: { id: "c1", name: "Bodegas" },
  project: { id: "p1", name: "Tienda online" },
  task: null,
  ...extra,
});

describe("eventToItem", () => {
  it("maps an event to a calendar item that links to its detail page", () => {
    const item = eventToItem(event());
    assert.equal(item.key, "event:e1");
    assert.equal(item.type, "event");
    assert.equal(item.eventType, "MEETING");
    assert.equal(item.status, null);
    assert.equal(item.href, "/calendar/e1");
    assert.equal(item.assignee?.name, "Pablo");
    assert.deepEqual(item.project, { id: "p1", name: "Tienda online" });
    assert.equal(item.start.toISOString(), "2026-10-06T08:00:00.000Z");
  });
});

describe("taskToItem", () => {
  it("shows a task with only a due date as a one-day deadline", () => {
    const item = taskToItem(task())!;
    assert.equal(item.type, "task");
    assert.equal(item.taskDisplay, "deadline");
    assert.equal(item.allDay, true);
    assert.deepEqual(itemDays(item), { first: "2026-10-08", last: "2026-10-08" });
    assert.equal(item.href, "/tasks/t1");
    assert.equal(item.status, "IN_PROGRESS");
    assert.equal(item.priority, "HIGH");
    assert.deepEqual(item.client, { id: "c1", name: "Bodegas" });
  });

  it("shows a task with start and due dates as an interval", () => {
    const item = taskToItem(task({ startDate: day("2026-10-05") }))!;
    assert.equal(item.taskDisplay, "interval");
    assert.deepEqual(itemDays(item), { first: "2026-10-05", last: "2026-10-08" });
    // Whole local days: from Madrid midnight of the first day to Madrid midnight after the last.
    assert.equal(item.start.toISOString(), "2026-10-04T22:00:00.000Z");
    assert.equal(item.end.toISOString(), "2026-10-08T22:00:00.000Z");
  });

  it("treats the same start and due day as a deadline", () => {
    assert.equal(taskToItem(task({ startDate: day("2026-10-08") }))!.taskDisplay, "deadline");
  });

  it("skips tasks without a due date (nothing to plan against)", () => {
    assert.equal(taskToItem(task({ dueDate: null })), null);
    assert.equal(taskToItem(task({ dueDate: null, startDate: day("2026-10-05") })), null);
  });

  it("keeps the status of completed and cancelled tasks so the views can tell them apart", () => {
    assert.equal(taskToItem(task({ status: "COMPLETED" }))!.status, "COMPLETED");
    assert.equal(taskToItem(task({ status: "CANCELLED" }))!.status, "CANCELLED");
  });

  it("keeps the business day across the winter-time change", () => {
    const item = taskToItem(task({ dueDate: day("2026-10-25") }))!;
    assert.deepEqual(itemDays(item), { first: "2026-10-25", last: "2026-10-25" });
    assert.equal(item.end.getTime() - item.start.getTime(), 25 * 3_600_000);
  });
});

describe("combineItems and ordering", () => {
  it("merges events and tasks chronologically, all-day items first on the same day", () => {
    const items = combineItems(
      [
        event({ id: "late", startDateTime: zonedDateTime("2026-10-08", "16:00"), endDateTime: zonedDateTime("2026-10-08", "17:00") }),
        event({ id: "early", startDateTime: zonedDateTime("2026-10-06", "09:00"), endDateTime: zonedDateTime("2026-10-06", "10:00") }),
      ],
      [task(), task({ id: "no-date", dueDate: null })],
    );
    assert.deepEqual(items.map((i) => i.key), ["event:early", "task:t1", "event:late"]);
  });

  it("is a stable total order", () => {
    const a = eventToItem(event({ id: "a", title: "B" }));
    const b = eventToItem(event({ id: "b", title: "A" }));
    assert.ok(compareItems(b, a) < 0);
    assert.equal(compareItems(a, a), 0);
  });
});

describe("itemDays and overlaps", () => {
  it("does not count an exclusive midnight end as another day", () => {
    const item = { start: zonedDateTime("2026-10-06", "22:00"), end: zonedDateTime("2026-10-07", "00:00") };
    assert.deepEqual(itemDays(item), { first: "2026-10-06", last: "2026-10-06" });
  });

  it("counts an event crossing midnight on both days", () => {
    const item = { start: zonedDateTime("2026-10-06", "23:00"), end: zonedDateTime("2026-10-07", "01:00") };
    assert.deepEqual(itemDays(item), { first: "2026-10-06", last: "2026-10-07" });
  });

  it("uses half-open intervals", () => {
    const ten = zonedDateTime("2026-10-06", "10:00");
    const eleven = zonedDateTime("2026-10-06", "11:00");
    const noon = zonedDateTime("2026-10-06", "12:00");
    assert.equal(overlaps({ start: ten, end: eleven }, { start: eleven, end: noon }), false);
    assert.equal(overlaps({ start: ten, end: noon }, { start: eleven, end: noon }), true);
  });
});
