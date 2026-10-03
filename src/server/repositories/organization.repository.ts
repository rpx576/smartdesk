import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db/prisma";
import type { Organization } from "@/server/domain/organization";
import type { SessionUser } from "@/server/domain/user";
import { ConflictError } from "@/server/errors/app-error";

export type NewOrganizationWithOwner = {
  organization: { name: string; slug: string };
  owner: { email: string; name: string; passwordHash: string };
};

export const organizationRepository = {
  /** Creates the organization, its first user and the ADMIN membership atomically. */
  async createWithOwner({
    organization,
    owner,
  }: NewOrganizationWithOwner): Promise<{ organization: Organization; owner: SessionUser }> {
    try {
      const created = await getPrisma().organization.create({
        data: {
          ...organization,
          memberships: { create: { role: "ADMIN", user: { create: owner } } },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          memberships: { select: { user: { select: { id: true, email: true, name: true } } } },
        },
      });
      const { memberships, ...org } = created;
      return { organization: org, owner: memberships[0].user };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("An account with this email already exists");
      }
      throw error;
    }
  },
};

export type OrganizationRepository = typeof organizationRepository;
