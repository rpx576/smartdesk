import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db/prisma";
import type { CalendarFilter, CalendarTask } from "@/server/domain/calendar-event";
import {
  OPEN_TASK_STATUSES,
  type Task,
  type TaskCreateData,
  type TaskListFilter,
  type TaskSort,
  type TaskSummary,
  type TaskWriteData,
} from "@/server/domain/task";
import { ValidationError } from "@/server/errors/app-error";
import { paginationArgs } from "./project.repository";

function isPrismaError(error: unknown, code: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

const person = { select: { id: true, name: true, email: true } } as const;

const taskInclude = {
  project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
  assignee: person,
  createdBy: person,
} satisfies Prisma.TaskInclude;

type TaskRow = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

const toNumber = (value: Prisma.Decimal | null) => (value === null ? null : value.toNumber());

function toDomain(row: TaskRow): Task {
  return { ...row, estimatedHours: toNumber(row.estimatedHours), actualHours: toNumber(row.actualHours) };
}

/**
 * Query conditions for a task list. `organizationId` always comes first, so
 * search (which also looks at the project's name) and filters can only narrow
 * results inside the tenant, never widen them.
 */
export function buildTaskWhere(
  organizationId: string,
  { search, status, priority, projectId, assigneeId, dueFrom, dueTo }: Omit<TaskListFilter, "page" | "pageSize" | "sort">,
): Prisma.TaskWhereInput {
  return {
    organizationId,
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(projectId ? { projectId } : {}),
    ...(assigneeId ? { assigneeId } : {}),
    ...(dueFrom || dueTo
      ? { dueDate: { ...(dueFrom ? { gte: dueFrom } : {}), ...(dueTo ? { lte: dueTo } : {}) } }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { project: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

/** Stable ordering for each sort option (id last, so pages never overlap). */
export function taskOrderBy(sort: TaskSort = "recent"): Prisma.TaskOrderByWithRelationInput[] {
  switch (sort) {
    case "due":
      // Soonest first; tasks without a due date go last.
      return [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }, { id: "desc" }];
    case "priority":
      // Enum order is LOW < MEDIUM < HIGH < CRITICAL, so desc = most urgent first.
      return [{ priority: "desc" }, { dueDate: { sort: "asc", nulls: "last" } }, { id: "desc" }];
    default:
      return [{ createdAt: "desc" }, { id: "desc" }];
  }
}

/** Calendar days `[firstDay, lastDay]` as stored calendar dates (UTC midnight). */
export type CalendarDayRange = { firstDay: Date; lastDay: Date };

const calendarTaskSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  startDate: true,
  dueDate: true,
  project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
  assignee: person,
} satisfies Prisma.TaskSelect;

/**
 * Tasks visible in a period: they need a due date, and their span (start date,
 * or the due date alone, up to the due date) must touch `[firstDay, lastDay]`.
 * CANCELLED tasks are hidden unless that status is asked for explicitly.
 * Always scoped to the organization first; filters only narrow.
 */
export function buildTaskRangeWhere(
  organizationId: string,
  { firstDay, lastDay }: CalendarDayRange,
  { mine, projectId, userId, taskStatus, search }: Omit<CalendarFilter, "show" | "eventType">,
  viewerId: string,
): Prisma.TaskWhereInput {
  const and: Prisma.TaskWhereInput[] = [
    { OR: [{ startDate: null, dueDate: { lte: lastDay } }, { startDate: { lte: lastDay } }] },
  ];
  if (mine) and.push({ assigneeId: viewerId });
  if (search) {
    and.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { project: { name: { contains: search, mode: "insensitive" } } },
        { project: { client: { name: { contains: search, mode: "insensitive" } } } },
      ],
    });
  }
  return {
    organizationId,
    dueDate: { gte: firstDay },
    status: taskStatus ?? { not: "CANCELLED" },
    ...(projectId ? { projectId } : {}),
    ...(userId ? { assigneeId: userId } : {}),
    AND: and,
  };
}

const PROJECT_OR_ASSIGNEE_MISMATCH = "Project or assignee does not belong to the organization";

/**
 * Every method takes `organizationId` and includes it in the query, so a task
 * from another tenant can never be read or modified by id alone. The composite
 * foreign keys (project_id, organization_id) and (assignee_id, organization_id)
 * additionally make the database reject a project or assignee from another
 * organization.
 */
export const taskRepository = {
  async list(organizationId: string, filter: TaskListFilter): Promise<{ items: Task[]; total: number }> {
    const where = buildTaskWhere(organizationId, filter);
    const prisma = getPrisma();
    const [rows, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: taskOrderBy(filter.sort),
        ...paginationArgs(filter.page, filter.pageSize),
      }),
      prisma.task.count({ where }),
    ]);
    return { items: rows.map(toDomain), total };
  },

  /** All tasks of one project (for the project page), most urgent first. */
  async listByProject(organizationId: string, projectId: string, limit: number): Promise<Task[]> {
    const rows = await getPrisma().task.findMany({
      where: { organizationId, projectId },
      include: taskInclude,
      orderBy: [{ status: "asc" }, ...taskOrderBy("due")],
      take: limit,
    });
    return rows.map(toDomain);
  },

  async findById(organizationId: string, id: string): Promise<Task | null> {
    const row = await getPrisma().task.findFirst({ where: { id, organizationId }, include: taskInclude });
    return row ? toDomain(row) : null;
  },

  /** Open / overdue / completed counts for the dashboard. `today` is a calendar date. */
  async summary(organizationId: string, today: Date): Promise<TaskSummary> {
    const prisma = getPrisma();
    const open = { organizationId, status: { in: [...OPEN_TASK_STATUSES] } };
    const [openCount, overdue, completed] = await Promise.all([
      prisma.task.count({ where: open }),
      prisma.task.count({ where: { ...open, dueDate: { lt: today } } }),
      prisma.task.count({ where: { organizationId, status: "COMPLETED" } }),
    ]);
    return { open: openCount, overdue, completed };
  },

  async create(
    organizationId: string,
    createdById: string,
    data: TaskCreateData & { completedAt: Date | null },
  ): Promise<Task> {
    try {
      const row = await getPrisma().task.create({
        data: { ...data, organizationId, createdById },
        include: taskInclude,
      });
      return toDomain(row);
    } catch (error) {
      if (isPrismaError(error, "P2003")) throw new ValidationError(PROJECT_OR_ASSIGNEE_MISMATCH);
      throw error;
    }
  },

  /** Returns null when the task does not exist in this organization. */
  async update(organizationId: string, id: string, data: TaskWriteData): Promise<Task | null> {
    try {
      const row = await getPrisma().task.update({
        where: { id, organizationId },
        data,
        include: taskInclude,
      });
      return toDomain(row);
    } catch (error) {
      if (isPrismaError(error, "P2025")) return null;
      if (isPrismaError(error, "P2003")) throw new ValidationError(PROJECT_OR_ASSIGNEE_MISMATCH);
      throw error;
    }
  },

  /**
   * Tasks to show on the calendar for the calendar days `[firstDay, lastDay]`
   * (UTC-midnight dates), with only the fields the calendar needs.
   */
  async listInRange(
    organizationId: string,
    range: CalendarDayRange,
    filter: CalendarFilter,
    viewerId: string,
    limit: number,
  ): Promise<{ items: CalendarTask[]; truncated: boolean }> {
    const rows = await getPrisma().task.findMany({
      where: buildTaskRangeWhere(organizationId, range, filter, viewerId),
      select: calendarTaskSelect,
      orderBy: [{ dueDate: "asc" }, { id: "asc" }],
      take: limit + 1,
    });
    return { items: rows.slice(0, limit), truncated: rows.length > limit };
  },

  /** Open tasks due in `[from, to]` (calendar dates), soonest first; optionally only one member's. */
  async listUpcomingDue(
    organizationId: string,
    { from, to, assigneeId, limit }: { from: Date; to: Date; assigneeId?: string; limit: number },
  ): Promise<CalendarTask[]> {
    return getPrisma().task.findMany({
      where: {
        organizationId,
        status: { in: [...OPEN_TASK_STATUSES] },
        dueDate: { gte: from, lte: to },
        ...(assigneeId ? { assigneeId } : {}),
      },
      select: calendarTaskSelect,
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { id: "asc" }],
      take: limit,
    });
  },

  /** Returns false when the task does not exist in this organization. Its calendar events are unlinked, not deleted. */
  async delete(organizationId: string, id: string): Promise<boolean> {
    const { count } = await getPrisma().$transaction(async (tx) => {
      await tx.calendarEvent.updateMany({ where: { organizationId, taskId: id }, data: { taskId: null } });
      return tx.task.deleteMany({ where: { id, organizationId } });
    });
    return count > 0;
  },
};

export type TaskRepository = typeof taskRepository;
