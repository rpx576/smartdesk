import { redirect } from "next/navigation";
import { cache } from "react";
import type { SessionUser } from "@/server/domain/user";
import { UnauthenticatedError } from "@/server/errors/app-error";
import { userRepository } from "@/server/repositories/user.repository";
import { auth } from "./auth";

/**
 * Authentication seam: resolves WHO is calling from the Auth.js session.
 * Authorization (what they may do in an organization) lives in
 * `tenant-access.service.ts`.
 *
 * The user is re-read from the database so a deleted account loses access
 * immediately, even with a still-valid token. Memoized per request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return userRepository.findById(userId);
});

/** For Route Handlers and Server Actions: throws 401 when not signed in. */
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new UnauthenticatedError();
  return user;
}

/** For pages: redirects to the login page when not signed in. */
export async function requirePageUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
