import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zonedDateTime } from "@/lib/dates";
import { eventToItem, taskToItem, type CalendarEvent, type CalendarItem } from "@/server/domain/calendar-event";
import {
  activeFilterCount,
  agendaPage,
  calendarHref,
  daysBetween,
  hourBounds,
  itemAccessibleLabel,
  itemsByDay,
  layoutDay,
  monthWeeks,
  periodFor,
  rangeLabel,
} from "./view-model";

const timed = (id: string, day: string, start: string, end: string, endDay = day): CalendarItem =>
  eventToItem({
    id,
    organizationId: "org",
    title: id,
    description: null,
    type: "MEETING",
    startDateTime: zonedDateTime(day, start),
    endDateTime: zonedDateTime(endDay, end),
    allDay: false,
    location: null,
    createdById: null,
    assignedToId: null,
    clientId: null,
    projectId: null,
    taskId: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    createdBy: null,
    assignedTo: null,
    client: null,
    project: null,
    task: null,
  } satisfies CalendarEvent);

const deadline = (id: string, due: string, start: string | null = null) =>
  taskToItem({
    id,
    title: id,
    status: "TODO",
    priority: "MEDIUM",
    startDate: start ? new Date(`${start}T00:00:00.000Z`) : null,
    dueDate: new Date(`${due}T00:00:00.000Z`),
    project: { id: "p", name: "Web", client: { id: "c", name: "Bodegas" } },
    assignee: { id: "u", name: null, email: "u@test" },
  })!;

describe("periodFor", () => {
  it("month: whole weeks from Monday, labelled with the month", () => {
    const period = periodFor("month", "2026-10-06");
    assert.equal(period.label, "Octubre 2026");
    assert.equal(period.from, "2026-09-28"); // Monday before 1 Oct (a Thursday)
    assert.equal(period.to, "2026-11-02"); // Monday after Sunday 1 Nov
    assert.equal(period.previous, "2026-09-01");
    assert.equal(period.next, "2026-11-01");
    const weeks = monthWeeks(period);
    assert.equal(weeks.length, 5);
    assert.ok(weeks.every((week) => week.length === 7));
  });

  it("month: navigation across years", () => {
    assert.equal(periodFor("month", "2026-12-15").next, "2027-01-01");
    assert.equal(periodFor("month", "2026-01-31").previous, "2025-12-01");
  });

  it("week: Monday to Sunday with a readable label", () => {
    const period = periodFor("week", "2026-10-08");
    assert.deepEqual([period.from, period.to], ["2026-10-05", "2026-10-12"]);
    assert.equal(period.label, "5 - 11 octubre 2026");
    assert.equal(period.previous, "2026-10-01");
    assert.equal(periodFor("week", "2026-10-01").label, "28 septiembre - 4 octubre 2026");
    assert.equal(rangeLabel("2026-12-28", "2027-01-03"), "28 diciembre 2026 - 3 enero 2027");
  });

  it("day and agenda", () => {
    const day = periodFor("day", "2026-10-31");
    assert.deepEqual([day.from, day.to, day.next, day.label], ["2026-10-31", "2026-11-01", "2026-11-01", "31 octubre 2026"]);
    const agenda = periodFor("agenda", "2026-10-20");
    assert.deepEqual([agenda.from, agenda.to, agenda.label], ["2026-10-01", "2026-11-01", "Octubre 2026"]);
  });
});

describe("itemsByDay", () => {
  it("puts a multi-day task interval on every day it covers, clipped to the period", () => {
    const days = daysBetween("2026-10-05", "2026-10-12");
    const byDay = itemsByDay([deadline("interval", "2026-10-14", "2026-10-03"), deadline("due", "2026-10-07")], days);
    assert.equal(byDay.get("2026-10-05")!.length, 1);
    assert.deepEqual(byDay.get("2026-10-07")!.map((i) => i.id), ["interval", "due"]);
    assert.equal(byDay.get("2026-10-11")!.length, 1);
  });

  it("does not show an event ending at midnight on the next day", () => {
    const byDay = itemsByDay([timed("late", "2026-10-06", "22:00", "00:00", "2026-10-07")], ["2026-10-06", "2026-10-07"]);
    assert.equal(byDay.get("2026-10-06")!.length, 1);
    assert.equal(byDay.get("2026-10-07")!.length, 0);
  });
});

describe("layoutDay", () => {
  it("separates all-day items and positions timed ones by local minutes", () => {
    const { allDay, timed: segments } = layoutDay([deadline("t", "2026-10-06"), timed("a", "2026-10-06", "09:30", "11:00")], "2026-10-06");
    assert.deepEqual(allDay.map((i) => i.id), ["t"]);
    assert.deepEqual(
      segments.map(({ startMinute, endMinute, lane, lanes }) => ({ startMinute, endMinute, lane, lanes })),
      [{ startMinute: 570, endMinute: 660, lane: 0, lanes: 1 }],
    );
  });

  it("puts overlapping events side by side and reuses free lanes", () => {
    const { timed: segments } = layoutDay(
      [
        timed("a", "2026-10-06", "09:00", "11:00"),
        timed("b", "2026-10-06", "10:00", "12:00"),
        timed("c", "2026-10-06", "11:00", "12:00"),
        timed("d", "2026-10-06", "15:00", "16:00"),
      ],
      "2026-10-06",
    );
    const byId = Object.fromEntries(segments.map((s) => [s.item.id, [s.lane, s.lanes]]));
    assert.deepEqual(byId, { a: [0, 2], b: [1, 2], c: [0, 2], d: [0, 1] });
  });

  it("clips events crossing midnight and gives tiny events a minimum height", () => {
    const night = timed("night", "2026-10-06", "23:00", "01:00", "2026-10-07");
    assert.deepEqual(
      (({ startMinute, endMinute, continuesAfter }) => ({ startMinute, endMinute, continuesAfter }))(layoutDay([night], "2026-10-06").timed[0]),
      { startMinute: 1380, endMinute: 1440, continuesAfter: true },
    );
    const next = layoutDay([night], "2026-10-07").timed[0];
    assert.deepEqual([next.startMinute, next.endMinute, next.continuesBefore], [0, 60, true]);
    const short = layoutDay([timed("s", "2026-10-06", "10:00", "10:05")], "2026-10-06").timed[0];
    assert.equal(short.endMinute - short.startMinute, 20);
  });

  it("keeps wall-clock positions on the DST change day", () => {
    const segment = layoutDay([timed("x", "2026-10-25", "10:00", "11:00")], "2026-10-25").timed[0];
    assert.deepEqual([segment.startMinute, segment.endMinute], [600, 660]);
  });
});

describe("hourBounds", () => {
  it("shows working hours and widens them for early or late events", () => {
    assert.deepEqual(hourBounds([]), { first: 8, last: 20 });
    assert.deepEqual(hourBounds([{ startMinute: 6 * 60 + 30, endMinute: 22 * 60 + 15 }]), { first: 6, last: 23 });
  });
});

describe("agendaPage", () => {
  const items = Array.from({ length: 30 }, (_, i) => timed(`e${i}`, `2026-10-${String(10 + Math.floor(i / 3)).padStart(2, "0")}`, "10:00", "11:00"));

  it("paginates and groups by day", () => {
    const first = agendaPage(items, "2026-10-01", 1);
    assert.equal(first.totalPages, 2);
    assert.equal(first.groups[0].day, "2026-10-10");
    assert.equal(first.groups[0].items.length, 3);
    const second = agendaPage(items, "2026-10-01", 2);
    assert.equal(second.groups.flatMap((g) => g.items).length, 5);
  });

  it("clamps the page and groups items that started earlier under the first visible day", () => {
    assert.equal(agendaPage(items, "2026-10-01", 99).page, 2);
    const page = agendaPage([deadline("long", "2026-10-05", "2026-09-20")], "2026-10-01", 1);
    assert.equal(page.groups[0].day, "2026-10-01");
  });
});

describe("labels and links", () => {
  it("describes items without relying on colour", () => {
    assert.equal(itemAccessibleLabel(deadline("Pago", "2026-10-06")), "Vencimiento de tarea: Pago, Pendiente, Proyecto Web");
    assert.equal(itemAccessibleLabel(timed("Comité", "2026-10-06", "10:00", "11:00")), "Reunión: Comité, 10:00 – 11:00");
  });

  it("builds calendar links keeping only valid state", () => {
    assert.equal(calendarHref({}), "/smartdesk/calendar");
    assert.equal(
      calendarHref({ view: "week", date: "2026-10-06", mine: true, show: "tasks", page: 1 }),
      "/smartdesk/calendar?view=week&date=2026-10-06&show=tasks&mine=1",
    );
    assert.equal(calendarHref({ view: "agenda", page: 3, notice: "deleted" }), "/smartdesk/calendar?view=agenda&page=3&notice=deleted");
    // Anything invalid is dropped instead of producing a broken link.
    assert.equal(calendarHref({ date: "2026-13-45" as string }), "/smartdesk/calendar");
    assert.equal(calendarHref({ notice: "https://evil.example" }), "/smartdesk/calendar");
  });

  it("counts active filters", () => {
    assert.equal(activeFilterCount({}), 0);
    assert.equal(activeFilterCount({ show: "all", mine: true, search: "web" }), 2);
  });
});
