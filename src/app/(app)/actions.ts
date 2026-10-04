"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { getEnv } from "@/config/env";
import { ACTIVE_ORGANIZATION_COOKIE } from "@/server/auth/organization-context";
import { requireSessionUser } from "@/server/auth/session";
import { organizationService } from "@/server/services/organization.service";

/**
 * Switches the organization the app pages work on. The id is only stored when
 * the user is a member; data access is still authorized on every request.
 */
export async function switchOrganization(formData: FormData): Promise<void> {
  const user = await requireSessionUser();
  const organizationId = z.uuid().safeParse(formData.get("organizationId"));
  if (!organizationId.success) return;

  const resolved = await organizationService.resolveActive(user, organizationId.data);
  if (resolved?.active.id !== organizationId.data) return;

  (await cookies()).set(ACTIVE_ORGANIZATION_COOKIE, organizationId.data, {
    httpOnly: true,
    sameSite: "lax",
    secure: getEnv().nodeEnv === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
