import { getPrismaClient } from "../lib/prisma.js";

export type StoredUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string | null;
};

export type StoredSession = {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};

export type AuthStore = {
  findUserByEmail(email: string): Promise<StoredUser | null>;
  findUserById(id: string): Promise<StoredUser | null>;
  createUser(input: Omit<StoredUser, "id">): Promise<StoredUser>;
  createSession(input: Omit<StoredSession, "id">): Promise<void>;
  findSessionByTokenHash(tokenHash: string): Promise<StoredSession | null>;
  deleteSession(tokenHash: string): Promise<void>;
};

export function createPrismaAuthStore(): AuthStore {
  return {
    findUserByEmail: (email) => getPrismaClient().user.findUnique({ where: { email } }),
    findUserById: (id) => getPrismaClient().user.findUnique({ where: { id } }),
    createUser: (data) => getPrismaClient().user.create({ data }),
    async createSession(data) {
      await getPrismaClient().session.create({ data });
    },
    findSessionByTokenHash: (tokenHash) =>
      getPrismaClient().session.findUnique({ where: { tokenHash } }),
    async deleteSession(tokenHash) {
      await getPrismaClient().session.deleteMany({ where: { tokenHash } });
    },
  };
}
