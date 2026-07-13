import type {
  AuthModel,
  StoredSession,
  StoredUser,
} from "../../src/models/auth-model.js";

export function createInMemoryAuthModel(): AuthModel {
  const users: StoredUser[] = [];
  const sessions: StoredSession[] = [];

  return {
    async findUserByEmail(email) {
      return users.find((user) => user.email === email) ?? null;
    },
    async findUserById(id) {
      return users.find((user) => user.id === id) ?? null;
    },
    async createUser(input) {
      const user = { ...input, id: crypto.randomUUID() };
      users.push(user);
      return user;
    },
    async createSession(input) {
      sessions.push({ ...input, id: crypto.randomUUID() });
    },
    async findSessionByTokenHash(tokenHash) {
      return sessions.find((session) => session.tokenHash === tokenHash) ?? null;
    },
    async deleteSession(tokenHash) {
      const index = sessions.findIndex(
        (session) => session.tokenHash === tokenHash,
      );
      if (index >= 0) sessions.splice(index, 1);
    },
  };
}
