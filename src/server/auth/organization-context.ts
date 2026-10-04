import { cookies } from "next/headers";
import { cache } from "react";
import type { OrganizationWithRole } from "@/server/domain/organization";
import type { SessionUser } from "@/server/domain/user";
import { organizationService } from "@/server/services/organization.service";
import { requirePageUser } from "./session";

/** Remembers which organization the user last selected. A hint, never trusted. */
export const ACTIVE_ORGANIZATION_COOKIE = "sd_active_org";

export type AppContext = {
  user: SessionUser;
  /** Null when the user does not belong to any organization. */
  organization: OrganizationWithRole | null;
  organizations: OrganizationWithRole[];
};

/**
 * Who is signed in and which organization the app pages work on. Identity
 * comes from Auth.js; the organization is always one the user is a member of
 * (checked against the database). Memoized per request.
 */
export const getAppContext = cache(async (): Promise<AppContext> => {
  const user = await requirePageUser();
  const preferred = (await cookies()).get(ACTIVE_ORGANIZATION_COOKIE)?.value;
  const resolved = await organizationService.resolveActive(user, preferred);

  return {
    user,
    organization: resolved?.active ?? null,
    organizations: resolved?.organizations ?? [],
  };
});
