import { getPrisma } from "@/server/db/prisma";
import type { SessionUser } from "@/server/domain/user";

export const userRepository = {
  async findById(id: string): Promise<SessionUser | null> {
    return getPrisma().user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    });
  },
};

export type UserRepository = typeof userRepository;
