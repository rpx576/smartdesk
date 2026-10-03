import { roleHasPermission, type Permission } from "@/server/auth/permissions";
import type { Role } from "@/server/domain/role";
import type { SessionUser } from "@/server/domain/user";
import { ForbiddenError, NotFoundError } from "@/server/errors/app-error";
import {
  membershipRepository,
  type MembershipRepository,
} from "@/server/repositories/membership.repository";

/** Proof that a user may act inside an organization with a given role. */
export type TenantContext = {
  userId: string;
  organizationId: string;
  role: Role;
};

export function createTenantAccessService(deps: {
  membershipRepository: Pick<MembershipRepository, "find">;
}) {
  return {
    /**
     * Authorization gate for every tenant-scoped operation: the user must be a
     * member of the organization AND their role must hold the permission.
     *
     * Non-members get 404 rather than 403 so the existence of other
     * organizations is not disclosed.
     */
    async authorize(
      user: SessionUser,
      organizationId: string,
      permission: Permission,
    ): Promise<TenantContext> {
      const membership = await deps.membershipRepository.find(user.id, organizationId);
      if (!membership) throw new NotFoundError("Organization not found");
      if (!roleHasPermission(membership.role, permission)) throw new ForbiddenError();

      return { userId: user.id, organizationId, role: membership.role };
    },
  };
}

export type TenantAccessService = ReturnType<typeof createTenantAccessService>;

export const tenantAccessService = createTenantAccessService({ membershipRepository });
