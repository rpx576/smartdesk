import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db/prisma";
import type { SessionUser, UserCredentials } from "@/server/domain/user";
import { ConflictError } from "@/server/errors/app-error";

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

  /** Creates a SmartHub account. Organizations are added later, per product. */
  async create(data: { email: string; name: string; passwordHash: string }): Promise<SessionUser> {
    try {
      return await getPrisma().user.create({ data, select: { id: true, email: true, name: true } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("An account with this email already exists");
      }
      throw error;
    }
  },
};

export type UserRepository = typeof userRepository;
