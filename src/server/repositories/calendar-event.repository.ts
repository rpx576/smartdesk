import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db/prisma";
import {
  MAX_EVENT_DURATION_MS,
  type CalendarConflict,
  type CalendarEvent,
  type CalendarEventCreateData,
  type CalendarEventUpdateData,
  type CalendarFilter,
  type CalendarFormOptions,
  type UpcomingEvent,
} from "@/server/domain/calendar-event";
import { ValidationError } from "@/server/errors/app-error";

function isPrismaError(error: unknown, code: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

const person = { select: { id: true, name: true, email: true } } as const;

const eventInclude = {
  createdBy: person,
  // The assignee relation goes through the membership (same-tenant guarantee).
  assignedTo: { select: { user: person } },
  client: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
  task: { select: { id: true, title: true } },
} satisfies Prisma.CalendarEventInclude;

type EventRow = Prisma.CalendarEventGetPayload<{ include: typeof eventInclude }>;

function toDomain({ assignedTo, ...row }: EventRow): CalendarEvent {
  return { ...row, assignedTo: assignedTo?.user ?? null };
}

/** Linked records found inside the organization, with their parents (null = not found there). */
export type ResolvedLinks = {
  client: { id: string } | null;
  project: { id: string; clientId: string } | null;
  task: { id: string; projectId: string; clientId: string } | null;
};

/** Instants `[start, end)` of a visible period. */
export type InstantRange = { start: Date; end: Date };

/**
 * Events overlapping `[start, end)`. Events last at most MAX_EVENT_DURATION_MS,
 * so the start time is also bounded from below and the
 * (organization_id, start_date_time) index can serve the query.
 */
export function overlapWhere({ start, end }: InstantRange): Prisma.CalendarEventWhereInput {
  return {
    startDateTime: { gte: new Date(start.getTime() - MAX_EVENT_DURATION_MS), lt: end },
    endDateTime: { gt: start },
  };
}

/**
 * Query conditions for the events of a period. `organizationId` always comes
 * first, so filters and search (which also look at project and client names)
 * can only narrow results inside the tenant, never widen them.
 */
export function buildEventRangeWhere(
  organizationId: string,
  range: InstantRange,
  { mine, projectId, userId, eventType, search }: Omit<CalendarFilter, "show" | "taskStatus">,
  viewerId: string,
): Prisma.CalendarEventWhereInput {
  const and: Prisma.CalendarEventWhereInput[] = [];
  if (mine) and.push({ OR: [{ assignedToId: viewerId }, { createdById: viewerId }] });
  if (search) {
    and.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { project: { name: { contains: search, mode: "insensitive" } } },
        { client: { name: { contains: search, mode: "insensitive" } } },
      ],
    });
  }
  return {
    organizationId,
    ...overlapWhere(range),
    ...(eventType ? { type: eventType } : {}),
    ...(projectId ? { projectId } : {}),
    ...(userId ? { assignedToId: userId } : {}),
    ...(and.length > 0 ? { AND: and } : {}),
  };
}

/**
 * Other timed events of the same assignee overlapping `[start, end)`. All-day
 * events (reminders, deliveries) do not block anyone's hours, so they never
 * count as conflicts.
 */
export function buildConflictWhere(
  organizationId: string,
  assignedToId: string,
  range: InstantRange,
  excludeId?: string,
): Prisma.CalendarEventWhereInput {
  return {
    organizationId,
    assignedToId,
    allDay: false,
    ...overlapWhere(range),
    ...(excludeId ? { id: { not: excludeId } } : {}),
  };
}

const chronological = [{ startDateTime: "asc" }, { endDateTime: "asc" }, { id: "asc" }] satisfies Prisma.CalendarEventOrderByWithRelationInput[];

const LINK_MISMATCH = "Assignee, client, project or task does not belong to the organization";

/**
 * Every method takes `organizationId` and includes it in the query, so an
 * event from another tenant can never be read or modified by id alone. The
 * composite foreign keys additionally make the database reject an assignee,
 * client, project or task from another organization.
 */
export const calendarEventRepository = {
  /** Events of a period, chronological. `truncated` when there were more than `limit`. */
  async listInRange(
    organizationId: string,
    range: InstantRange,
    filter: CalendarFilter,
    viewerId: string,
    limit: number,
  ): Promise<{ items: CalendarEvent[]; truncated: boolean }> {
    const rows = await getPrisma().calendarEvent.findMany({
      where: buildEventRangeWhere(organizationId, range, filter, viewerId),
      include: eventInclude,
      orderBy: chronological,
      take: limit + 1,
    });
    return { items: rows.slice(0, limit).map(toDomain), truncated: rows.length > limit };
  },

  /** Next events that have not ended yet, optionally only a member's or a project's. */
  async listUpcoming(
    organizationId: string,
    { from, limit, userId, projectId }: { from: Date; limit: number; userId?: string; projectId?: string },
  ): Promise<UpcomingEvent[]> {
    return getPrisma().calendarEvent.findMany({
      where: {
        organizationId,
        endDateTime: { gt: from },
        ...(projectId ? { projectId } : {}),
        ...(userId ? { OR: [{ assignedToId: userId }, { createdById: userId }] } : {}),
      },
      select: {
        id: true,
        title: true,
        type: true,
        startDateTime: true,
        endDateTime: true,
        allDay: true,
        location: true,
        project: { select: { id: true, name: true } },
      },
      orderBy: chronological,
      take: limit,
    });
  },

  async findById(organizationId: string, id: string): Promise<CalendarEvent | null> {
    const row = await getPrisma().calendarEvent.findFirst({ where: { id, organizationId }, include: eventInclude });
    return row ? toDomain(row) : null;
  },

  async findConflicts(
    organizationId: string,
    assignedToId: string,
    range: InstantRange,
    excludeId?: string,
  ): Promise<CalendarConflict[]> {
    return getPrisma().calendarEvent.findMany({
      where: buildConflictWhere(organizationId, assignedToId, range, excludeId),
      select: { id: true, title: true, startDateTime: true, endDateTime: true },
      orderBy: chronological,
      take: 10,
    });
  },

  /** Clients, projects (with their client) and tasks (with their project) for the event form. */
  async formOptions(organizationId: string): Promise<Omit<CalendarFormOptions, "assignees">> {
    const prisma = getPrisma();
    const [clients, projects, tasks] = await Promise.all([
      prisma.client.findMany({
        where: { organizationId },
        select: { id: true, name: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
      }),
      prisma.project.findMany({
        where: { organizationId },
        select: { id: true, name: true, clientId: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
      }),
      prisma.task.findMany({
        where: { organizationId },
        select: { id: true, title: true, projectId: true },
        orderBy: [{ title: "asc" }, { id: "asc" }],
      }),
    ]);
    return { clients, projects, tasks };
  },

  /**
   * The client, project and task an event wants to link to, looked up inside
   * the organization only (null when missing or from another tenant), with
   * the parents needed to check that they are consistent with each other.
   */
  async resolveLinks(
    organizationId: string,
    { clientId, projectId, taskId }: { clientId?: string | null; projectId?: string | null; taskId?: string | null },
  ): Promise<ResolvedLinks> {
    const prisma = getPrisma();
    const [client, project, task] = await Promise.all([
      clientId ? prisma.client.findFirst({ where: { id: clientId, organizationId }, select: { id: true } }) : null,
      projectId
        ? prisma.project.findFirst({ where: { id: projectId, organizationId }, select: { id: true, clientId: true } })
        : null,
      taskId
        ? prisma.task.findFirst({
            where: { id: taskId, organizationId },
            select: { id: true, projectId: true, project: { select: { clientId: true } } },
          })
        : null,
    ]);
    return {
      client,
      project,
      task: task && { id: task.id, projectId: task.projectId, clientId: task.project.clientId },
    };
  },

  async create(organizationId: string, createdById: string, data: CalendarEventCreateData): Promise<CalendarEvent> {
    try {
      const row = await getPrisma().calendarEvent.create({
        data: { ...data, organizationId, createdById },
        include: eventInclude,
      });
      return toDomain(row);
    } catch (error) {
      if (isPrismaError(error, "P2003")) throw new ValidationError(LINK_MISMATCH);
      throw error;
    }
  },

  /** Returns null when the event does not exist in this organization. */
  async update(organizationId: string, id: string, data: CalendarEventUpdateData): Promise<CalendarEvent | null> {
    try {
      const row = await getPrisma().calendarEvent.update({
        where: { id, organizationId },
        data,
        include: eventInclude,
      });
      return toDomain(row);
    } catch (error) {
      if (isPrismaError(error, "P2025")) return null;
      if (isPrismaError(error, "P2003")) throw new ValidationError(LINK_MISMATCH);
      throw error;
    }
  },

  /** Returns false when the event does not exist in this organization. */
  async delete(organizationId: string, id: string): Promise<boolean> {
    const { count } = await getPrisma().calendarEvent.deleteMany({ where: { id, organizationId } });
    return count > 0;
  },
};

export type CalendarEventRepository = typeof calendarEventRepository;
