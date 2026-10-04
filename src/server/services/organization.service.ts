import type { OrganizationWithRole } from "@/server/domain/organization";
import type { SessionUser } from "@/server/domain/user";
import {
  membershipRepository,
  type MembershipRepository,
} from "@/server/repositories/membership.repository";

export type ActiveOrganization = {
  active: OrganizationWithRole;
  organizations: OrganizationWithRole[];
};

export function createOrganizationService(deps: {
  membershipRepository: Pick<MembershipRepository, "listOrganizationsForUser">;
}) {
  return {
    /** Organizations the user belongs to, with their role in each. */
    listForUser(user: SessionUser): Promise<OrganizationWithRole[]> {
      return deps.membershipRepository.listOrganizationsForUser(user.id);
    },

    /**
     * Picks the organization the UI works on. `preferredId` (e.g. from a
     * cookie) is only a hint: it is honoured solely when the user is a member,
     * otherwise the first membership is used. Null when the user has none.
     */
    async resolveActive(
      user: SessionUser,
      preferredId?: string,
    ): Promise<ActiveOrganization | null> {
      const organizations = await deps.membershipRepository.listOrganizationsForUser(user.id);
      if (organizations.length === 0) return null;

      const active = organizations.find((org) => org.id === preferredId) ?? organizations[0];
      return { active, organizations };
    },
  };
}

export const organizationService = createOrganizationService({ membershipRepository });
