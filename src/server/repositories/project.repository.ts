import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db/prisma";
import type {
  Project,
  ProjectCreateData,
  ProjectListFilter,
  ProjectStatus,
  ProjectUpdateData,
} from "@/server/domain/project";
import {
  computeProgress,
  emptyTaskCounts,
  type ProjectOption,
  type TaskCounts,
  type TaskStatus,
} from "@/server/domain/task";
import { ValidationError } from "@/server/errors/app-error";

function isPrismaError(error: unknown, code: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

const projectInclude = {
  client: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ProjectInclude;

type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

const toNumber = (value: Prisma.Decimal | null) => (value === null ? null : value.toNumber());

function toDomain(row: ProjectRow, counts: TaskCounts): Project {
  const { percent, completed, considered } = computeProgress(counts);
  return {
    ...row,
    budget: toNumber(row.budget),
    estimatedHours: toNumber(row.estimatedHours),
    progress: percent,
    taskStats: { completed, considered },
  };
}

/** Folds `groupBy(projectId, status)` rows into task counts per project. */
export function countsByProject(
  groups: { projectId: string; status: TaskStatus; _count: { _all: number } }[],
): Map<string, TaskCounts> {
  const result = new Map<string, TaskCounts>();
  for (const { projectId, status, _count } of groups) {
    const counts = result.get(projectId) ?? emptyTaskCounts();
    counts[status] += _count._all;
    result.set(projectId, counts);
  }
  return result;
}

/**
 * Task counts for a set of projects with ONE grouped query (no N+1), scoped
 * to the organization like every other query here.
 */
async function taskCountsFor(organizationId: string, projectIds: string[]): Promise<Map<string, TaskCounts>> {
  if (projectIds.length === 0) return new Map();
  const groups = await getPrisma().task.groupBy({
    by: ["projectId", "status"],
    where: { organizationId, projectId: { in: projectIds } },
    _count: { _all: true },
  });
  return countsByProject(groups);
}

async function withProgress(organizationId: string, rows: ProjectRow[]): Promise<Project[]> {
  const counts = await taskCountsFor(organizationId, rows.map((row) => row.id));
  return rows.map((row) => toDomain(row, counts.get(row.id) ?? emptyTaskCounts()));
}

/**
 * Query conditions for a project list. `organizationId` is always the first
 * condition, so search (which also looks at the client's name) and filters can
 * only narrow results inside the tenant, never widen them.
 */
export function buildProjectWhere(
  organizationId: string,
  { search, status, priority, clientId }: Omit<ProjectListFilter, "page" | "pageSize">,
): Prisma.ProjectWhereInput {
  return {
    organizationId,
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(clientId ? { clientId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { client: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

export function paginationArgs(page: number, pageSize: number) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

const CLIENT_MISMATCH = "Client does not belong to the organization";

/**
 * Every method takes `organizationId` and includes it in the query, so a
 * project from another tenant can never be read or modified by id alone. The
 * composite foreign key (client_id, organization_id) additionally makes the
 * database reject a client from another organization.
 */
export const projectRepository = {
  async list(
    organizationId: string,
    filter: ProjectListFilter,
  ): Promise<{ items: Project[]; total: number }> {
    const where = buildProjectWhere(organizationId, filter);
    const prisma = getPrisma();
    const [rows, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: projectInclude,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...paginationArgs(filter.page, filter.pageSize),
      }),
      prisma.project.count({ where }),
    ]);
    return { items: await withProgress(organizationId, rows), total };
  },

  async findById(organizationId: string, id: string): Promise<Project | null> {
    const row = await getPrisma().project.findFirst({
      where: { id, organizationId },
      include: projectInclude,
    });
    return row ? (await withProgress(organizationId, [row]))[0] : null;
  },

  /** Cheap existence check inside the organization (no includes). */
  async existsInOrganization(organizationId: string, id: string): Promise<boolean> {
    const row = await getPrisma().project.findFirst({ where: { id, organizationId }, select: { id: true } });
    return row !== null;
  },

  /** Projects of the organization for selectors, with their client's name. */
  async listOptions(organizationId: string): Promise<ProjectOption[]> {
    const rows = await getPrisma().project.findMany({
      where: { organizationId },
      select: { id: true, name: true, client: { select: { name: true } } },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
    return rows.map(({ id, name, client }) => ({ id, name, clientName: client.name }));
  },

  async countByStatus(organizationId: string): Promise<Record<ProjectStatus, number>> {
    const groups = await getPrisma().project.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { _all: true },
    });
    const counts: Record<ProjectStatus, number> = { PLANNING: 0, ACTIVE: 0, ON_HOLD: 0, COMPLETED: 0, CANCELLED: 0 };
    for (const group of groups) counts[group.status] = group._count._all;
    return counts;
  },

  async create(
    organizationId: string,
    createdById: string,
    data: ProjectCreateData,
  ): Promise<Project> {
    try {
      const row = await getPrisma().project.create({
        data: { ...data, organizationId, createdById },
        include: projectInclude,
      });
      // A new project has no tasks yet.
      return toDomain(row, emptyTaskCounts());
    } catch (error) {
      if (isPrismaError(error, "P2003")) throw new ValidationError(CLIENT_MISMATCH);
      throw error;
    }
  },

  /** Returns null when the project does not exist in this organization. */
  async update(
    organizationId: string,
    id: string,
    data: ProjectUpdateData,
  ): Promise<Project | null> {
    try {
      const row = await getPrisma().project.update({
        where: { id, organizationId },
        data,
        include: projectInclude,
      });
      return (await withProgress(organizationId, [row]))[0];
    } catch (error) {
      if (isPrismaError(error, "P2025")) return null;
      if (isPrismaError(error, "P2003")) throw new ValidationError(CLIENT_MISMATCH);
      throw error;
    }
  },

  /** Returns false when the project does not exist in this organization. Its tasks are deleted too. */
  async delete(organizationId: string, id: string): Promise<boolean> {
    const { count } = await getPrisma().project.deleteMany({ where: { id, organizationId } });
    return count > 0;
  },
};

export type ProjectRepository = typeof projectRepository;
