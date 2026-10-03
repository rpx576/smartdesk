import { randomBytes } from "node:crypto";
import { getDummyHash, hashPassword, verifyPassword } from "@/server/auth/password";
import type { Organization } from "@/server/domain/organization";
import type { SessionUser } from "@/server/domain/user";
import { ConflictError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import {
  organizationRepository,
  type OrganizationRepository,
} from "@/server/repositories/organization.repository";
import { userRepository, type UserRepository } from "@/server/repositories/user.repository";
import type { LoginInput, RegisterInput } from "@/server/validation/auth.schema";

/** URL-safe slug with a random suffix so organization names never collide. */
export function makeSlug(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = randomBytes(3).toString("hex");
  return base ? `${base}-${suffix}` : `org-${suffix}`;
}

export function createAuthService(deps: {
  userRepository: Pick<UserRepository, "findCredentialsByEmail" | "existsByEmail">;
  organizationRepository: Pick<OrganizationRepository, "createWithOwner">;
}) {
  return {
    /**
     * Authentication: returns the user for valid credentials, otherwise null.
     * The hash comparison runs even for unknown emails to avoid leaking which
     * accounts exist through response timing.
     */
    async verifyCredentials({ email, password }: LoginInput): Promise<SessionUser | null> {
      const user = await deps.userRepository.findCredentialsByEmail(email);
      const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));

      if (!user?.passwordHash || !valid) {
        logger.warn("Failed login attempt");
        return null;
      }
      return { id: user.id, email: user.email, name: user.name };
    },

    /** Self-service sign-up: a new organization whose first user is its ADMIN. */
    async registerOrganization(
      input: RegisterInput,
    ): Promise<{ organization: Organization; owner: SessionUser }> {
      if (await deps.userRepository.existsByEmail(input.email)) {
        throw new ConflictError("An account with this email already exists");
      }

      const result = await deps.organizationRepository.createWithOwner({
        organization: { name: input.organizationName, slug: makeSlug(input.organizationName) },
        owner: {
          email: input.email,
          name: input.name,
          passwordHash: await hashPassword(input.password),
        },
      });
      logger.info("Organization registered", { organizationId: result.organization.id });
      return result;
    },
  };
}

export const authService = createAuthService({ userRepository, organizationRepository });
