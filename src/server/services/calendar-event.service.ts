import { addDays, dayToCalendarDate, startOfZonedDay } from "@/lib/dates";
import { canModifyEvent, roleHasPermission } from "@/server/auth/permissions";
import {
  combineItems,
  MAX_EVENT_DURATION_MS,
  MAX_RANGE_DAYS,
  type CalendarConflict,
  type CalendarEvent,
  type CalendarEventCreateData,
  type CalendarEventUpdateData,
  type CalendarFilter,
  type CalendarFormOptions,
  type CalendarItem,
  type CalendarRange,
  type UpcomingEvent,
} from "@/server/domain/calendar-event";
import type { SessionUser } from "@/server/domain/user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/server/errors/app-error";
import {
  calendarEventRepository,
  type CalendarEventRepository,
} from "@/server/repositories/calendar-event.repository";
import {
  membershipRepository,
  type MembershipRepository,
} from "@/server/repositories/membership.repository";
import { taskRepository, type TaskRepository } from "@/server/repositories/task.repository";
import { END_BEFORE_START } from "@/server/validation/calendar-event.schema";
import { tenantAccessService, type TenantAccessService } from "./tenant-access.service";

export const ASSIGNEE_NOT_IN_ORGANIZATION = "Selecciona un responsable de tu organización";
export const CLIENT_NOT_IN_ORGANIZATION = "Selecciona un cliente de tu organización";
export const PROJECT_NOT_IN_ORGANIZATION = "Selecciona un proyecto de tu organización";
export const TASK_NOT_IN_ORGANIZATION = "Selecciona una tarea de tu organización";
export const PROJECT_NOT_OF_CLIENT = "El proyecto no pertenece al cliente seleccionado";
export const TASK_NOT_OF_PROJECT = "La tarea no pertenece al proyecto seleccionado";
const TOO_LONG = "Un evento no puede durar más de un día";
const RANGE_TOO_LONG = `El periodo no puede superar ${MAX_RANGE_DAYS} días`;

/** Most events (and, separately, tasks) read for one period; more are reported as truncated. */
export const RANGE_ITEM_LIMIT = 500;

/** What creating or updating an event returns: the saved event and overlaps to warn about. */
export type SavedEvent = { event: CalendarEvent; conflicts: CalendarConflict[] };

type Detail = { path: string; message: string };
type Links = { clientId: string | null; projectId: string | null; taskId: string | null };

export function createCalendarEventService(deps: {
  calendarEventRepository: CalendarEventRepository;
  taskRepository: Pick<TaskRepository, "listInRange">;
  membershipRepository: Pick<MembershipRepository, "find" | "listMembers">;
  tenantAccess: TenantAccessService;
  now?: () => Date;
}) {
  const { calendarEventRepository: events, taskRepository: tasks, membershipRepository: members, tenantAccess } = deps;
  const now = deps.now ?? (() => new Date());
  const notFound = () => new NotFoundError("Event not found");
  const invalid = (details: Detail[]) => new ValidationError("Invalid event", details);

  /**
   * The assignee id comes from the browser: the user must be a member of THIS
   * organization with a role that can be in charge of events. Unknown, foreign
   * and CLIENT users all get the same answer.
   */
  async function checkAssignee(organizationId: string, assignedToId: string): Promise<Detail[]> {
    const membership = await members.find(assignedToId, organizationId);
    return membership && roleHasPermission(membership.role, "calendar:assignable")
      ? []
      : [{ path: "assignedToId", message: ASSIGNEE_NOT_IN_ORGANIZATION }];
  }

  /**
   * Client, project and task ids come from the browser: each must belong to
   * THIS organization, and they must agree with each other (the project is the
   * client's, the task is the project's). Missing parents are filled in from
   * the child, so linking a task also links its project and client.
   */
  async function checkLinks(organizationId: string, wanted: Links): Promise<{ links: Links; details: Detail[] }> {
    const found = await events.resolveLinks(organizationId, wanted);
    const details: Detail[] = [];
    if (wanted.clientId && !found.client) details.push({ path: "clientId", message: CLIENT_NOT_IN_ORGANIZATION });
    if (wanted.projectId && !found.project) details.push({ path: "projectId", message: PROJECT_NOT_IN_ORGANIZATION });
    if (wanted.taskId && !found.task) details.push({ path: "taskId", message: TASK_NOT_IN_ORGANIZATION });
    if (details.length > 0) return { links: wanted, details };

    if (found.task && wanted.projectId && found.task.projectId !== wanted.projectId) {
      details.push({ path: "taskId", message: TASK_NOT_OF_PROJECT });
    }
    const projectClientId = found.project?.clientId ?? found.task?.clientId ?? null;
    if (wanted.clientId && projectClientId && projectClientId !== wanted.clientId) {
      details.push({ path: "projectId", message: PROJECT_NOT_OF_CLIENT });
    }
    return {
      links: {
        clientId: wanted.clientId ?? projectClientId,
        projectId: wanted.projectId ?? found.task?.projectId ?? null,
        taskId: wanted.taskId,
      },
      details,
    };
  }

  /**
   * Instants already come from the schema; this re-checks the order (a time
   * skipped by a DST change can collapse it) and the one-day limit.
   */
  function checkTiming(startDateTime: Date, endDateTime: Date): Detail[] {
    const duration = endDateTime.getTime() - startDateTime.getTime();
    if (duration <= 0) return [{ path: "endTime", message: END_BEFORE_START }];
    if (duration > MAX_EVENT_DURATION_MS) return [{ path: "endTime", message: TOO_LONG }];
    return [];
  }

  async function conflictsOf(event: CalendarEvent): Promise<CalendarConflict[]> {
    if (!event.assignedToId || event.allDay) return [];
    return events.findConflicts(
      event.organizationId,
      event.assignedToId,
      { start: event.startDateTime, end: event.endDateTime },
      event.id,
    );
  }

  return {
    /**
     * Everything the calendar shows for `[from, to)`: the organization's
     * events and, for roles that may read tasks, the tasks with dates in that
     * period. One query per source, combined in memory.
     */
    async getCalendar(
      user: SessionUser,
      organizationId: string,
      range: CalendarRange,
      filter: CalendarFilter,
    ): Promise<{ items: CalendarItem[]; truncated: boolean }> {
      const tenant = await tenantAccess.authorize(user, organizationId, "calendar:read");
      if (range.to <= range.from || range.to > addDays(range.from, MAX_RANGE_DAYS)) {
        throw invalid([{ path: "to", message: RANGE_TOO_LONG }]);
      }
      // An event-type filter only makes sense for events, a task-status filter only for tasks.
      const showEvents = filter.show !== "tasks" && !filter.taskStatus;
      const showTasks =
        filter.show !== "events" && !filter.eventType && roleHasPermission(tenant.role, "task:read");

      const [eventResult, taskResult] = await Promise.all([
        showEvents
          ? events.listInRange(
              tenant.organizationId,
              { start: startOfZonedDay(range.from), end: startOfZonedDay(range.to) },
              filter,
              tenant.userId,
              RANGE_ITEM_LIMIT,
            )
          : { items: [], truncated: false },
        showTasks
          ? tasks.listInRange(
              tenant.organizationId,
              { firstDay: dayToCalendarDate(range.from), lastDay: dayToCalendarDate(addDays(range.to, -1)) },
              filter,
              tenant.userId,
              RANGE_ITEM_LIMIT,
            )
          : { items: [], truncated: false },
      ]);
      return {
        items: combineItems(eventResult.items, taskResult.items),
        truncated: eventResult.truncated || taskResult.truncated,
      };
    },

    /** Events only (API), same rules and filters as the calendar. */
    async listEvents(
      user: SessionUser,
      organizationId: string,
      range: CalendarRange,
      filter: CalendarFilter,
    ): Promise<{ items: CalendarEvent[]; truncated: boolean }> {
      const tenant = await tenantAccess.authorize(user, organizationId, "calendar:read");
      return events.listInRange(
        tenant.organizationId,
        { start: startOfZonedDay(range.from), end: startOfZonedDay(range.to) },
        filter,
        tenant.userId,
        RANGE_ITEM_LIMIT,
      );
    },

    async get(user: SessionUser, organizationId: string, eventId: string): Promise<CalendarEvent> {
      const tenant = await tenantAccess.authorize(user, organizationId, "calendar:read");
      const event = await events.findById(tenant.organizationId, eventId);
      if (!event) throw notFound();
      return event;
    },

    /** Other events of the same assignee that overlap this one (warning only). */
    async conflicts(user: SessionUser, organizationId: string, event: CalendarEvent): Promise<CalendarConflict[]> {
      const tenant = await tenantAccess.authorize(user, organizationId, "calendar:read");
      if (event.organizationId !== tenant.organizationId) throw notFound();
      return conflictsOf(event);
    },

    /** Next events that have not ended, for the dashboard (mine) or a project page. */
    async listUpcoming(
      user: SessionUser,
      organizationId: string,
      { mine = false, projectId, limit = 5 }: { mine?: boolean; projectId?: string; limit?: number },
    ): Promise<UpcomingEvent[]> {
      const tenant = await tenantAccess.authorize(user, organizationId, "calendar:read");
      return events.listUpcoming(tenant.organizationId, {
        from: now(),
        limit,
        projectId,
        userId: mine ? tenant.userId : undefined,
      });
    },

    /** Clients, projects, tasks and possible assignees of the organization, for forms and filters. */
    async formOptions(user: SessionUser, organizationId: string): Promise<CalendarFormOptions> {
      const tenant = await tenantAccess.authorize(user, organizationId, "calendar:read");
      const [options, memberList] = await Promise.all([
        events.formOptions(tenant.organizationId),
        members.listMembers(tenant.organizationId),
      ]);
      const assignees = memberList
        .filter((member) => roleHasPermission(member.role, "calendar:assignable"))
        .map(({ id, name, email }) => ({ id, name, email }));
      return { ...options, assignees };
    },

    async create(user: SessionUser, organizationId: string, data: CalendarEventCreateData): Promise<SavedEvent> {
      const tenant = await tenantAccess.authorize(user, organizationId, "calendar:write");
      const { links, details } = await checkLinks(tenant.organizationId, {
        clientId: data.clientId ?? null,
        projectId: data.projectId ?? null,
        taskId: data.taskId ?? null,
      });
      details.push(
        ...(data.assignedToId ? await checkAssignee(tenant.organizationId, data.assignedToId) : []),
        ...checkTiming(data.startDateTime, data.endDateTime),
      );
      if (details.length > 0) throw invalid(details);

      // The creator is the authenticated user, never a value from the request.
      const event = await events.create(tenant.organizationId, tenant.userId, { ...data, ...links });
      return { event, conflicts: await conflictsOf(event) };
    },

    /** Full or partial update. EMPLOYEE may only change events they created or are assigned to. */
    async update(
      user: SessionUser,
      organizationId: string,
      eventId: string,
      data: CalendarEventUpdateData,
    ): Promise<SavedEvent> {
      const tenant = await tenantAccess.authorize(user, organizationId, "calendar:write");
      const current = await events.findById(tenant.organizationId, eventId);
      if (!current) throw notFound();
      if (!canModifyEvent(tenant.role, tenant.userId, current)) throw new ForbiddenError();

      // Partial updates: links and dates are checked together with the stored values.
      const { links, details } = await checkLinks(tenant.organizationId, {
        clientId: data.clientId !== undefined ? data.clientId : current.clientId,
        projectId: data.projectId !== undefined ? data.projectId : current.projectId,
        taskId: data.taskId !== undefined ? data.taskId : current.taskId,
      });
      if (data.assignedToId && data.assignedToId !== current.assignedToId) {
        details.push(...(await checkAssignee(tenant.organizationId, data.assignedToId)));
      }
      details.push(
        ...checkTiming(data.startDateTime ?? current.startDateTime, data.endDateTime ?? current.endDateTime),
      );
      if (details.length > 0) throw invalid(details);

      const event = await events.update(tenant.organizationId, eventId, { ...data, ...links });
      if (!event) throw notFound();
      return { event, conflicts: await conflictsOf(event) };
    },

    async delete(user: SessionUser, organizationId: string, eventId: string): Promise<void> {
      const tenant = await tenantAccess.authorize(user, organizationId, "calendar:write");
      const current = await events.findById(tenant.organizationId, eventId);
      if (!current) throw notFound();
      if (!canModifyEvent(tenant.role, tenant.userId, current)) throw new ForbiddenError();
      if (!(await events.delete(tenant.organizationId, eventId))) throw notFound();
    },
  };
}

export type CalendarEventService = ReturnType<typeof createCalendarEventService>;

export const calendarEventService = createCalendarEventService({
  calendarEventRepository,
  taskRepository,
  membershipRepository,
  tenantAccess: tenantAccessService,
});
