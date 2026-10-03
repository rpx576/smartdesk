import type { OrganizationWithRole } from "@/server/domain/organization";
import type { SessionUser } from "@/server/domain/user";
import {
  membershipRepository,
  type MembershipRepository,
} from "@/server/repositories/membership.repository";

export function createOrganizationService(deps: {
  membershipRepository: Pick<MembershipRepository, "listOrganizationsForUser">;
}) {
  return {
    /** Organizations the user belongs to, with their role in each. */
    listForUser(user: SessionUser): Promise<OrganizationWithRole[]> {
      return deps.membershipRepository.listOrganizationsForUser(user.id);
    },
  };
}

export const organizationService = createOrganizationService({ membershipRepository });
