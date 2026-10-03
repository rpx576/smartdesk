import { z } from "zod";
import { getEnv } from "@/config/env";
import type { SessionUser } from "@/server/domain/user";
import { UnauthenticatedError } from "@/server/errors/app-error";
import { userRepository } from "@/server/repositories/user.repository";

export const DEV_USER_HEADER = "x-dev-user-id";

/**
 * Authentication seam: resolves WHO is calling. Authorization (what they may
 * do) lives in `tenant-access.service.ts`.
 *
 * TODO(auth): replace the body with the Auth.js session lookup (`auth()`).
 * Until then the only way to authenticate is the development bypass, which is
 * disabled in production, so production requests are always rejected.
 */
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  if (!getEnv().authDevBypass) return null;

  const userId = z.uuid().safeParse(request.headers.get(DEV_USER_HEADER));
  if (!userId.success) return null;

  return userRepository.findById(userId.data);
}

export async function requireSessionUser(request: Request): Promise<SessionUser> {
  const user = await getSessionUser(request);
  if (!user) throw new UnauthenticatedError();
  return user;
}
