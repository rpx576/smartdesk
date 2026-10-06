import { getPrisma } from "@/server/db/prisma";
import type { Membership, OrganizationMember, OrganizationWithRole } from "@/server/domain/organization";

export const membershipRepository = {
  async find(userId: string, organizationId: string): Promise<Membership | null> {
    return getPrisma().membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      select: { userId: true, organizationId: true, role: true },
    });
  },

  /** Members of the organization (user data + role), for assignee selectors. */
  async listMembers(organizationId: string): Promise<OrganizationMember[]> {
    const memberships = await getPrisma().membership.findMany({
      where: { organizationId },
      select: { role: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: [{ user: { name: "asc" } }, { user: { email: "asc" } }],
    });
    return memberships.map(({ role, user }) => ({ ...user, role }));
  },

  async listOrganizationsForUser(userId: string): Promise<OrganizationWithRole[]> {
    const memberships = await getPrisma().membership.findMany({
      where: { userId },
      select: {
        role: true,
        organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { organization: { name: "asc" } },
    });
    return memberships.map(({ role, organization }) => ({ ...organization, role }));
  },
};

export type MembershipRepository = typeof membershipRepository;
