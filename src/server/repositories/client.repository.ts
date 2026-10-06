import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db/prisma";
import type {
  Client,
  ClientCreateData,
  ClientListFilter,
  ClientSummary,
  ClientOption,
  ClientUpdateData,
} from "@/server/domain/client";
import { ConflictError } from "@/server/errors/app-error";

function isPrismaError(error: unknown, code: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

const EMAIL_CONFLICT = "A client with this email already exists";
export const CLIENT_HAS_PROJECTS = "The client has projects and cannot be deleted";

/**
 * Every method takes `organizationId` and includes it in the query, so a
 * record from another tenant can never be read or modified by id alone.
 */
export const clientRepository = {
  async list(
    organizationId: string,
    { search, status, page, pageSize }: ClientListFilter,
  ): Promise<{ items: Client[]; total: number }> {
    const where: Prisma.ClientWhereInput = {
      organizationId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { company: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const prisma = getPrisma();
    const [items, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.client.count({ where }),
    ]);
    return { items, total };
  },

  async summary(organizationId: string): Promise<ClientSummary> {
    const groups = await getPrisma().client.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { _all: true },
    });
    const byStatus: ClientSummary["byStatus"] = { LEAD: 0, ACTIVE: 0, INACTIVE: 0 };
    for (const group of groups) byStatus[group.status] = group._count._all;
    return { total: groups.reduce((sum, group) => sum + group._count._all, 0), byStatus };
  },

  /** Most recently created clients first. */
  async listRecent(organizationId: string, limit: number): Promise<Client[]> {
    return getPrisma().client.findMany({
      where: { organizationId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
    });
  },

  /** Id and name of every client in the organization, for selectors. */
  async listOptions(organizationId: string): Promise<ClientOption[]> {
    return getPrisma().client.findMany({
      where: { organizationId },
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
  },

  async findById(organizationId: string, id: string): Promise<Client | null> {
    return getPrisma().client.findFirst({ where: { id, organizationId } });
  },

  async create(organizationId: string, data: ClientCreateData): Promise<Client> {
    try {
      return await getPrisma().client.create({ data: { ...data, organizationId } });
    } catch (error) {
      if (isPrismaError(error, "P2002")) throw new ConflictError(EMAIL_CONFLICT);
      throw error;
    }
  },

  /** Returns null when the client does not exist in this organization. */
  async update(organizationId: string, id: string, data: ClientUpdateData): Promise<Client | null> {
    try {
      return await getPrisma().client.update({ where: { id, organizationId }, data });
    } catch (error) {
      if (isPrismaError(error, "P2025")) return null;
      if (isPrismaError(error, "P2002")) throw new ConflictError(EMAIL_CONFLICT);
      throw error;
    }
  },

  /**
   * Returns false when the client does not exist in this organization. Throws
   * ConflictError while the client still has projects (the database blocks it).
   */
  async delete(organizationId: string, id: string): Promise<boolean> {
    try {
      const { count } = await getPrisma().client.deleteMany({ where: { id, organizationId } });
      return count > 0;
    } catch (error) {
      if (isPrismaError(error, "P2003")) throw new ConflictError(CLIENT_HAS_PROJECTS);
      throw error;
    }
  },
};

export type ClientRepository = typeof clientRepository;
