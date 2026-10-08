import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { zonedDateTime } from "@/lib/dates";
import {
  overlaps,
  type CalendarEvent,
  type CalendarEventCreateData,
  type CalendarTask,
} from "@/server/domain/calendar-event";
import type { Membership, OrganizationMember } from "@/server/domain/organization";
import type { SessionUser } from "@/server/domain/user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/server/errors/app-error";
import type { CalendarEventRepository } from "@/server/repositories/calendar-event.repository";
import {
  ASSIGNEE_NOT_IN_ORGANIZATION,
  CLIENT_NOT_IN_ORGANIZATION,
  createCalendarEventService,
  PROJECT_NOT_IN_ORGANIZATION,
  PROJECT_NOT_OF_CLIENT,
  TASK_NOT_IN_ORGANIZATION,
  TASK_NOT_OF_PROJECT,
} from "./calendar-event.service";
import { createTenantAccessService } from "./tenant-access.service";

/*
 * Two tenants, Acme and Globex. The fakes honour the same contract as the
 * real repositories: every lookup is scoped by organization id.
 */
const ACME = "org-acme";
const GLOBEX = "org-globex";

const user = (id: string): SessionUser => ({ id, email: `${id}@test`, name: id });
const acmeAdmin = user("acme-admin");
const acmeEmployee = user("acme-employee");
const acmeEmployee2 = user("acme-employee-2");
const acmeClient = user("acme-client");
const globexAdmin = user("globex-admin");

const memberships: Membership[] = [
  { userId: acmeAdmin.id, organizationId: ACME, role: "ADMIN" },
  { userId: acmeEmployee.id, organizationId: ACME, role: "EMPLOYEE" },
  { userId: acmeEmployee2.id, organizationId: ACME, role: "EMPLOYEE" },
  { userId: acmeClient.id, organizationId: ACME, role: "CLIENT" },
  { userId: globexAdmin.id, organizationId: GLOBEX, role: "ADMIN" },
];

const clients = [
  { id: "acme-bodegas", organizationId: ACME, name: "Bodegas" },
  { id: "acme-talleres", organizationId: ACME, name: "Talleres" },
  { id: "globex-initech", organizationId: GLOBEX, name: "Initech" },
];
const projects = [
  { id: "acme-web", organizationId: ACME, name: "Tienda online", clientId: "acme-bodegas" },
  { id: "acme-app", organizationId: ACME, name: "App interna", clientId: "acme-talleres" },
  { id: "globex-cloud", organizationId: GLOBEX, name: "Migración", clientId: "globex-initech" },
];
const tasks = [
  { id: "acme-task-web", organizationId: ACME, title: "Maqueta", projectId: "acme-web" },
  { id: "acme-task-app", organizationId: ACME, title: "Login", projectId: "acme-app" },
  { id: "globex-task", organizationId: GLOBEX, title: "Auditoría", projectId: "globex-cloud" },
];

const at = (time: string, day = "2026-10-06") => zonedDateTime(day, time);
let seq = 0;

function makeEvent(organizationId: string, extra: Partial<CalendarEvent> = {}): CalendarEvent {
  seq += 1;
  return {
    id: `e-${seq}`,
    organizationId,
    title: `Evento ${seq}`,
    description: null,
    type: "MEETING",
    startDateTime: at("10:00"),
    endDateTime: at("11:00"),
    allDay: false,
    location: null,
    createdById: null,
    assignedToId: null,
    clientId: null,
    projectId: null,
    taskId: null,
    createdAt: new Date(seq * 1000),
    updatedAt: new Date(seq * 1000),
    createdBy: null,
    assignedTo: null,
    client: null,
    project: null,
    task: null,
    ...extra,
  };
}

function createFakeRepository(store: CalendarEvent[]): CalendarEventRepository {
  const find = (organizationId: string, id: string) =>
    store.find((e) => e.id === id && e.organizationId === organizationId) ?? null;
  const inRange = (e: CalendarEvent, range: { start: Date; end: Date }) =>
    overlaps({ start: e.startDateTime, end: e.endDateTime }, range);
  return {
    async listInRange(organizationId, range, { mine, projectId, userId, eventType, search }, viewerId, limit) {
      const term = search?.toLowerCase();
      const items = store
        .filter((e) => e.organizationId === organizationId && inRange(e, range))
        .filter((e) => !eventType || e.type === eventType)
        .filter((e) => !projectId || e.projectId === projectId)
        .filter((e) => !userId || e.assignedToId === userId)
        .filter((e) => !mine || e.assignedToId === viewerId || e.createdById === viewerId)
        .filter((e) => !term || e.title.toLowerCase().includes(term))
        .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
      return { items: items.slice(0, limit), truncated: items.length > limit };
    },
    async listUpcoming(organizationId, { from, limit, userId, projectId }) {
      return store
        .filter((e) => e.organizationId === organizationId && e.endDateTime > from)
        .filter((e) => !projectId || e.projectId === projectId)
        .filter((e) => !userId || e.assignedToId === userId || e.createdById === userId)
        .slice(0, limit)
        .map((e) => ({ ...e, project: e.project }));
    },
    async findById(organizationId, id) {
      return find(organizationId, id);
    },
    async findConflicts(organizationId, assignedToId, range, excludeId) {
      return store.filter(
        (e) =>
          e.organizationId === organizationId &&
          e.assignedToId === assignedToId &&
          !e.allDay &&
          e.id !== excludeId &&
          inRange(e, range),
      );
    },
    async formOptions(organizationId) {
      return {
        clients: clients.filter((c) => c.organizationId === organizationId).map(({ id, name }) => ({ id, name })),
        projects: projects
          .filter((p) => p.organizationId === organizationId)
          .map(({ id, name, clientId }) => ({ id, name, clientId })),
        tasks: tasks
          .filter((t) => t.organizationId === organizationId)
          .map(({ id, title, projectId }) => ({ id, title, projectId })),
      };
    },
    async resolveLinks(organizationId, { clientId, projectId, taskId }) {
      const client = clients.find((c) => c.id === clientId && c.organizationId === organizationId);
      const project = projects.find((p) => p.id === projectId && p.organizationId === organizationId);
      const task = tasks.find((t) => t.id === taskId && t.organizationId === organizationId);
      return {
        client: client ? { id: client.id } : null,
        project: project ? { id: project.id, clientId: project.clientId } : null,
        task: task
          ? { id: task.id, projectId: task.projectId, clientId: projects.find((p) => p.id === task.projectId)!.clientId }
          : null,
      };
    },
    async create(organizationId, createdById, data: CalendarEventCreateData) {
      const event = makeEvent(organizationId, { ...(data as Partial<CalendarEvent>), createdById });
      store.push(event);
      return event;
    },
    async update(organizationId, id, data) {
      const event = find(organizationId, id);
      if (!event) return null;
      Object.assign(event, data);
      return event;
    },
    async delete(organizationId, id) {
      const index = store.findIndex((e) => e.id === id && e.organizationId === organizationId);
      if (index === -1) return false;
      store.splice(index, 1);
      return true;
    },
  };
}

const membersOf = (organizationId: string): OrganizationMember[] =>
  memberships
    .filter((m) => m.organizationId === organizationId)
    .map((m) => ({ id: m.userId, name: m.userId, email: `${m.userId}@test`, role: m.role }));

const calendarTask = (extra: Partial<CalendarTask> = {}): CalendarTask => ({
  id: "acme-task-web",
  title: "Maqueta",
  status: "TODO",
  priority: "HIGH",
  startDate: null,
  dueDate: new Date("2026-10-06T00:00:00.000Z"),
  project: { id: "acme-web", name: "Tienda online", client: { id: "acme-bodegas", name: "Bodegas" } },
  assignee: { id: acmeEmployee.id, name: null, email: "e@test" },
  ...extra,
});

describe("calendarEventService", () => {
  let store: CalendarEvent[];
  let taskRows: Record<string, CalendarTask[]>;
  let service: ReturnType<typeof createCalendarEventService>;
  let adminEvent: CalendarEvent;
  let employeeEvent: CalendarEvent;
  let globexEvent: CalendarEvent;

  beforeEach(() => {
    seq = 0;
    adminEvent = makeEvent(ACME, { title: "Comité", createdById: acmeAdmin.id, assignedToId: acmeAdmin.id });
    employeeEvent = makeEvent(ACME, {
      title: "Visita cliente",
      createdById: acmeEmployee.id,
      startDateTime: at("16:00"),
      endDateTime: at("17:00"),
    });
    globexEvent = makeEvent(GLOBEX, { title: "Kick-off", createdById: globexAdmin.id });
    store = [adminEvent, employeeEvent, globexEvent];
    taskRows = { [ACME]: [calendarTask()], [GLOBEX]: [calendarTask({ id: "globex-task", title: "Auditoría" })] };
    const membershipRepository = {
      find: async (userId: string, organizationId: string) =>
        memberships.find((m) => m.userId === userId && m.organizationId === organizationId) ?? null,
    };
    service = createCalendarEventService({
      calendarEventRepository: createFakeRepository(store),
      taskRepository: {
        listInRange: async (organizationId, _range, { taskStatus }) => ({
          items: (taskRows[organizationId] ?? []).filter((t) => (taskStatus ? t.status === taskStatus : t.status !== "CANCELLED")),
          truncated: false,
        }),
      },
      membershipRepository: { ...membershipRepository, listMembers: async (organizationId) => membersOf(organizationId) },
      tenantAccess: createTenantAccessService({ membershipRepository }),
      now: () => at("08:00"),
    });
  });

  const newEvent = (extra: Partial<CalendarEventCreateData> = {}): CalendarEventCreateData => ({
    title: "Nuevo",
    startDateTime: at("12:00"),
    endDateTime: at("13:00"),
    ...extra,
  });
  const october = { from: "2026-10-01", to: "2026-11-01" };
  const hasDetail = (path: string, message: string) => (error: unknown) =>
    error instanceof ValidationError &&
    Array.isArray(error.details) &&
    error.details.some((d: { path: string; message: string }) => d.path === path && d.message === message);

  describe("ADMIN", () => {
    it("creates, reads, edits and deletes any event of the organization", async () => {
      const { event } = await service.create(acmeAdmin, ACME, newEvent());
      assert.equal(event.organizationId, ACME);
      assert.equal(event.createdById, acmeAdmin.id, "creator comes from the session");
      assert.equal((await service.get(acmeAdmin, ACME, event.id)).title, "Nuevo");
      // Someone else's event.
      const { event: edited } = await service.update(acmeAdmin, ACME, employeeEvent.id, { title: "Editado" });
      assert.equal(edited.title, "Editado");
      await service.delete(acmeAdmin, ACME, employeeEvent.id);
      await assert.rejects(service.get(acmeAdmin, ACME, employeeEvent.id), NotFoundError);
    });
  });

  describe("EMPLOYEE", () => {
    it("reads every event and creates new ones", async () => {
      assert.equal((await service.get(acmeEmployee, ACME, adminEvent.id)).title, "Comité");
      const { event } = await service.create(acmeEmployee, ACME, newEvent({ assignedToId: acmeAdmin.id }));
      assert.equal(event.createdById, acmeEmployee.id);
    });

    it("edits and deletes events they created", async () => {
      assert.equal((await service.update(acmeEmployee, ACME, employeeEvent.id, { title: "Mío" })).event.title, "Mío");
      await service.delete(acmeEmployee, ACME, employeeEvent.id);
      assert.ok(!store.includes(employeeEvent));
    });

    it("edits and deletes events assigned to them", async () => {
      const assigned = makeEvent(ACME, { createdById: acmeAdmin.id, assignedToId: acmeEmployee.id });
      store.push(assigned);
      assert.equal((await service.update(acmeEmployee, ACME, assigned.id, { location: "Sala 2" })).event.location, "Sala 2");
      await service.delete(acmeEmployee, ACME, assigned.id);
      assert.ok(!store.includes(assigned));
    });

    it("cannot edit or delete other people's events (403)", async () => {
      await assert.rejects(service.update(acmeEmployee, ACME, adminEvent.id, { title: "Hacked" }), ForbiddenError);
      await assert.rejects(service.delete(acmeEmployee, ACME, adminEvent.id), ForbiddenError);
      await assert.rejects(service.update(acmeEmployee2, ACME, employeeEvent.id, { title: "Hacked" }), ForbiddenError);
      assert.equal(adminEvent.title, "Comité");
      assert.ok(store.includes(adminEvent));
    });
  });

  describe("CLIENT", () => {
    it("has no access to the calendar in V1", async () => {
      await assert.rejects(service.getCalendar(acmeClient, ACME, october, {}), ForbiddenError);
      await assert.rejects(service.listEvents(acmeClient, ACME, october, {}), ForbiddenError);
      await assert.rejects(service.get(acmeClient, ACME, adminEvent.id), ForbiddenError);
      await assert.rejects(service.formOptions(acmeClient, ACME), ForbiddenError);
      await assert.rejects(service.listUpcoming(acmeClient, ACME, {}), ForbiddenError);
      await assert.rejects(service.create(acmeClient, ACME, newEvent()), ForbiddenError);
      await assert.rejects(service.update(acmeClient, ACME, adminEvent.id, { title: "x" }), ForbiddenError);
      await assert.rejects(service.delete(acmeClient, ACME, adminEvent.id), ForbiddenError);
      assert.equal(store.length, 3);
    });
  });

  describe("tenant isolation (Acme vs Globex)", () => {
    it("Acme user → Globex event = 404, even knowing its id", async () => {
      await assert.rejects(service.get(acmeAdmin, ACME, globexEvent.id), NotFoundError);
      await assert.rejects(service.update(acmeAdmin, ACME, globexEvent.id, { title: "Hacked" }), NotFoundError);
      await assert.rejects(service.delete(acmeAdmin, ACME, globexEvent.id), NotFoundError);
      await assert.rejects(service.conflicts(acmeAdmin, ACME, globexEvent), NotFoundError);
      assert.equal(globexEvent.title, "Kick-off");
    });

    it("forged organizationId = 404: naming Globex's organization is not a membership", async () => {
      await assert.rejects(service.getCalendar(acmeAdmin, GLOBEX, october, {}), NotFoundError);
      await assert.rejects(service.get(acmeAdmin, GLOBEX, globexEvent.id), NotFoundError);
      await assert.rejects(service.create(acmeAdmin, GLOBEX, newEvent()), NotFoundError);
      await assert.rejects(service.delete(acmeAdmin, GLOBEX, globexEvent.id), NotFoundError);
    });

    it("rejects an assignee from another organization, unknown or with the CLIENT role", async () => {
      for (const assignedToId of [globexAdmin.id, "ghost", acmeClient.id]) {
        await assert.rejects(
          service.create(acmeAdmin, ACME, newEvent({ assignedToId })),
          hasDetail("assignedToId", ASSIGNEE_NOT_IN_ORGANIZATION),
        );
      }
      await assert.rejects(
        service.update(acmeAdmin, ACME, adminEvent.id, { assignedToId: globexAdmin.id }),
        hasDetail("assignedToId", ASSIGNEE_NOT_IN_ORGANIZATION),
      );
      assert.equal(adminEvent.assignedToId, acmeAdmin.id);
    });

    it("rejects a client, project or task from another organization", async () => {
      await assert.rejects(
        service.create(acmeAdmin, ACME, newEvent({ clientId: "globex-initech" })),
        hasDetail("clientId", CLIENT_NOT_IN_ORGANIZATION),
      );
      await assert.rejects(
        service.create(acmeAdmin, ACME, newEvent({ projectId: "globex-cloud" })),
        hasDetail("projectId", PROJECT_NOT_IN_ORGANIZATION),
      );
      await assert.rejects(
        service.create(acmeAdmin, ACME, newEvent({ taskId: "globex-task" })),
        hasDetail("taskId", TASK_NOT_IN_ORGANIZATION),
      );
      await assert.rejects(
        service.update(acmeAdmin, ACME, adminEvent.id, { projectId: "globex-cloud" }),
        hasDetail("projectId", PROJECT_NOT_IN_ORGANIZATION),
      );
      assert.equal(adminEvent.projectId, null);
    });

    it("calendar, options and upcoming lists never include another organization's data", async () => {
      const { items } = await service.getCalendar(acmeAdmin, ACME, october, {});
      assert.ok(items.every((item) => item.id !== globexEvent.id && item.id !== "globex-task"));
      const options = await service.formOptions(acmeAdmin, ACME);
      assert.deepEqual(options.clients.map((c) => c.id), ["acme-bodegas", "acme-talleres"]);
      assert.deepEqual(options.projects.map((p) => p.id), ["acme-web", "acme-app"]);
      assert.deepEqual(options.tasks.map((t) => t.id), ["acme-task-web", "acme-task-app"]);
      // Only Acme staff: no Globex users, no CLIENT members.
      assert.deepEqual(options.assignees.map((a) => a.id), [acmeAdmin.id, acmeEmployee.id, acmeEmployee2.id]);
      const upcoming = await service.listUpcoming(acmeAdmin, ACME, {});
      assert.ok(upcoming.every((e) => e.id !== globexEvent.id));
    });
  });

  describe("linked records", () => {
    it("fills in the project and client from the task, and the client from the project", async () => {
      const fromTask = await service.create(acmeAdmin, ACME, newEvent({ taskId: "acme-task-app" }));
      assert.deepEqual(
        [fromTask.event.clientId, fromTask.event.projectId, fromTask.event.taskId],
        ["acme-talleres", "acme-app", "acme-task-app"],
      );
      const fromProject = await service.create(acmeAdmin, ACME, newEvent({ projectId: "acme-web" }));
      assert.equal(fromProject.event.clientId, "acme-bodegas");
    });

    it("rejects a project of another client and a task of another project", async () => {
      await assert.rejects(
        service.create(acmeAdmin, ACME, newEvent({ clientId: "acme-talleres", projectId: "acme-web" })),
        hasDetail("projectId", PROJECT_NOT_OF_CLIENT),
      );
      await assert.rejects(
        service.create(acmeAdmin, ACME, newEvent({ projectId: "acme-web", taskId: "acme-task-app" })),
        hasDetail("taskId", TASK_NOT_OF_PROJECT),
      );
    });

    it("can unlink everything", async () => {
      const { event } = await service.create(acmeAdmin, ACME, newEvent({ taskId: "acme-task-web" }));
      const { event: updated } = await service.update(acmeAdmin, ACME, event.id, { clientId: null, projectId: null, taskId: null });
      assert.deepEqual([updated.clientId, updated.projectId, updated.taskId], [null, null, null]);
    });
  });

  describe("timing", () => {
    it("rejects an end before the start (e.g. collapsed by a DST change) and events longer than a day", async () => {
      await assert.rejects(
        service.create(acmeAdmin, ACME, newEvent({ startDateTime: at("12:00"), endDateTime: at("12:00") })),
        ValidationError,
      );
      await assert.rejects(
        service.create(acmeAdmin, ACME, newEvent({ startDateTime: at("12:00"), endDateTime: at("14:00", "2026-10-07") })),
        ValidationError,
      );
    });

    it("checks a partial update against the stored times", async () => {
      await assert.rejects(
        service.update(acmeAdmin, ACME, adminEvent.id, { endDateTime: at("09:00") }),
        ValidationError,
      );
      assert.equal(adminEvent.endDateTime.getTime(), at("11:00").getTime());
    });
  });

  describe("conflicts (warning, never a block)", () => {
    it("warns when the assignee already has an overlapping event, and still saves", async () => {
      const { event, conflicts } = await service.create(
        acmeAdmin,
        ACME,
        newEvent({ assignedToId: acmeAdmin.id, startDateTime: at("10:30"), endDateTime: at("11:30") }),
      );
      assert.ok(store.includes(event), "the event is saved");
      assert.deepEqual(conflicts.map((c) => c.id), [adminEvent.id]);
    });

    it("ignores touching events, other assignees, unassigned and all-day events, and the event itself", async () => {
      const touching = await service.create(
        acmeAdmin,
        ACME,
        newEvent({ assignedToId: acmeAdmin.id, startDateTime: at("11:00"), endDateTime: at("12:00") }),
      );
      assert.deepEqual(touching.conflicts, []);
      const other = await service.create(
        acmeAdmin,
        ACME,
        newEvent({ assignedToId: acmeEmployee.id, startDateTime: at("10:00"), endDateTime: at("11:00") }),
      );
      assert.deepEqual(other.conflicts, []);
      const unassigned = await service.create(acmeAdmin, ACME, newEvent({ startDateTime: at("10:00"), endDateTime: at("11:00") }));
      assert.deepEqual(unassigned.conflicts, []);
      const allDay = await service.create(
        acmeAdmin,
        ACME,
        newEvent({ assignedToId: acmeAdmin.id, allDay: true, startDateTime: at("00:00"), endDateTime: at("00:00", "2026-10-07") }),
      );
      assert.deepEqual(allDay.conflicts, []);
      const self = await service.update(acmeAdmin, ACME, adminEvent.id, { title: "Comité semanal" });
      assert.deepEqual(self.conflicts, []);
    });

    it("tasks never count as conflicts", async () => {
      // A task due that day is on the calendar, but an event assigned to its assignee does not conflict with it.
      const { conflicts } = await service.create(
        acmeAdmin,
        ACME,
        newEvent({ assignedToId: acmeEmployee.id, startDateTime: at("09:00"), endDateTime: at("09:30") }),
      );
      assert.deepEqual(conflicts, []);
    });

    it("are reported for an existing event on demand", async () => {
      store.push(makeEvent(ACME, { assignedToId: acmeAdmin.id, startDateTime: at("10:45"), endDateTime: at("12:00") }));
      assert.equal((await service.conflicts(acmeAdmin, ACME, adminEvent)).length, 1);
    });
  });

  describe("getCalendar", () => {
    it("combines events and tasks in chronological order", async () => {
      const { items, truncated } = await service.getCalendar(acmeAdmin, ACME, october, {});
      assert.equal(truncated, false);
      assert.deepEqual(items.map((i) => i.key), [`task:acme-task-web`, `event:${adminEvent.id}`, `event:${employeeEvent.id}`]);
    });

    it("shows only events, only tasks, or narrows by event type / task status", async () => {
      const keys = async (filter: Parameters<typeof service.getCalendar>[3]) =>
        (await service.getCalendar(acmeAdmin, ACME, october, filter)).items.map((i) => i.type);
      assert.deepEqual(await keys({ show: "events" }), ["event", "event"]);
      assert.deepEqual(await keys({ show: "tasks" }), ["task"]);
      assert.deepEqual(await keys({ eventType: "MEETING" }), ["event", "event"]);
      assert.deepEqual(await keys({ taskStatus: "TODO" }), ["task"]);
    });

    it("hides cancelled tasks unless that status is asked for", async () => {
      taskRows[ACME] = [calendarTask({ status: "CANCELLED" })];
      assert.equal((await service.getCalendar(acmeAdmin, ACME, october, { show: "tasks" })).items.length, 0);
      assert.equal((await service.getCalendar(acmeAdmin, ACME, october, { taskStatus: "CANCELLED" })).items.length, 1);
    });

    it("filters my items", async () => {
      const { items } = await service.getCalendar(acmeEmployee, ACME, october, { mine: true, show: "events" });
      assert.deepEqual(items.map((i) => i.id), [employeeEvent.id]);
    });

    it("rejects empty or too long periods", async () => {
      await assert.rejects(service.getCalendar(acmeAdmin, ACME, { from: "2026-10-01", to: "2026-10-01" }, {}), ValidationError);
      await assert.rejects(service.getCalendar(acmeAdmin, ACME, { from: "2026-01-01", to: "2026-12-31" }, {}), ValidationError);
    });
  });
});
