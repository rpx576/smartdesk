import { getPrisma } from "@/server/db/prisma";
import type { SessionUser, UserCredentials } from "@/server/domain/user";

export const userRepository = {
  async findById(id: string): Promise<SessionUser | null> {
    return getPrisma().user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    });
  },

  async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    return getPrisma().user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
  },

  async existsByEmail(email: string): Promise<boolean> {
    const user = await getPrisma().user.findUnique({ where: { email }, select: { id: true } });
    return user !== null;
  },
};

export type UserRepository = typeof userRepository;
