import NextAuth, { AuthError, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { logger } from "@/server/logger";
import { authService } from "@/server/services/auth.service";
import { loginSchema } from "@/server/validation/auth.schema";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

/**
 * Auth.js configuration (authentication only).
 *
 * The JWT carries just the user id (`sub`). Roles are per organization and are
 * always read from the database by the authorization layer, so membership
 * changes take effect immediately instead of when the token expires.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        return authService.verifyCredentials(parsed.data);
      },
    }),
  ],
  logger: {
    error(error) {
      // Expected outcomes, not server faults: failed logins (already logged by
      // the auth service) and invalid/tampered session cookies. Match on
      // Auth.js' stable `type`; class names are minified in production builds.
      const type = error instanceof AuthError ? error.type : undefined;
      if (type === "CredentialsSignin") return;
      if (type === "JWTSessionError") {
        logger.warn("Invalid session token");
        return;
      }
      logger.error("Auth.js error", { error });
    },
    warn(code) {
      logger.warn("Auth.js warning", { code });
    },
    debug() {},
  },
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
