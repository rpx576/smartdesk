import { hashPassword } from "@/server/auth/password";
import type { Organization } from "@/server/domain/organization";
import type { SessionUser } from "@/server/domain/user";
import { ConflictError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import {
  organizationRepository,
  type OrganizationRepository,
} from "@/server/repositories/organization.repository";
import { userRepository, type UserRepository } from "@/server/repositories/user.repository";
import type { AccountInput, OrganizationNameInput } from "@/server/validation/auth.schema";
import { makeSlug } from "./auth.service";

/**
 * SmartHub accounts. One account signs in to every product; SmartDesk only
 * adds organizations to it (the account itself never belongs to SmartDesk).
 */
export function createAccountService(deps: {
  userRepository: Pick<UserRepository, "existsByEmail" | "create">;
  organizationRepository: Pick<OrganizationRepository, "createForUser">;
}) {
  return {
    /** SmartHub sign-up: just the account, no organization. */
    async register(input: AccountInput): Promise<SessionUser> {
      if (await deps.userRepository.existsByEmail(input.email)) {
        throw new ConflictError("An account with this email already exists");
      }

      const user = await deps.userRepository.create({
        email: input.email,
        name: input.name,
        passwordHash: await hashPassword(input.password),
      });
      logger.info("Account registered", { userId: user.id });
      return user;
    },

    /** Starts SmartDesk: a new organization whose ADMIN is the signed-in account. */
    async createOrganization(user: SessionUser, input: OrganizationNameInput): Promise<Organization> {
      const organization = await deps.organizationRepository.createForUser(user.id, {
        name: input.organizationName,
        slug: makeSlug(input.organizationName),
      });
      logger.info("Organization created", { organizationId: organization.id });
      return organization;
    },
  };
}

export const accountService = createAccountService({ userRepository, organizationRepository });
