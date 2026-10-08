"use server";

import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/app/(auth)/actions";
import { getEnv } from "@/config/env";
import { ACTIVE_ORGANIZATION_COOKIE } from "@/server/auth/organization-context";
import { requireSessionUser } from "@/server/auth/session";
import { logger } from "@/server/logger";
import { accountService } from "@/server/services/account.service";
import { organizationNameSchema } from "@/server/validation/auth.schema";

/** Creates the first SmartDesk organization of the signed-in SmartHub account. */
export async function createOrganization(_state: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get("organizationName");
  const values = { organizationName: typeof name === "string" ? name : "" };
  const parsed = organizationNameSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  let organizationId: string;
  try {
    const user = await requireSessionUser();
    organizationId = (await accountService.createOrganization(user, parsed.data)).id;
  } catch (error) {
    unstable_rethrow(error);
    logger.error("Organization creation failed", { error });
    return { error: "No se ha podido crear la empresa. Inténtalo de nuevo en unos segundos.", values };
  }

  (await cookies()).set(ACTIVE_ORGANIZATION_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: getEnv().nodeEnv === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/smartdesk/dashboard");
}
