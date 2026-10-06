import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db/prisma";
import type {
  Project,
  ProjectCreateData,
  ProjectListFilter,
  ProjectUpdateData,
} from "@/server/domain/project";
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

function toDomain(row: ProjectRow): Project {
  return {
    ...row,
    budget: toNumber(row.budget),
    estimatedHours: toNumber(row.estimatedHours),
    // No tasks module yet: real progress will be computed from tasks later.
    progress: 0,
  };
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
    return { items: rows.map(toDomain), total };
  },

  async findById(organizationId: string, id: string): Promise<Project | null> {
    const row = await getPrisma().project.findFirst({
      where: { id, organizationId },
      include: projectInclude,
    });
    return row ? toDomain(row) : null;
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
      return toDomain(row);
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
      return toDomain(row);
    } catch (error) {
      if (isPrismaError(error, "P2025")) return null;
      if (isPrismaError(error, "P2003")) throw new ValidationError(CLIENT_MISMATCH);
      throw error;
    }
  },

  /** Returns false when the project does not exist in this organization. */
  async delete(organizationId: string, id: string): Promise<boolean> {
    const { count } = await getPrisma().project.deleteMany({ where: { id, organizationId } });
    return count > 0;
  },
};

export type ProjectRepository = typeof projectRepository;
