import type { AuthModel, StoredUser } from "../../src/models/auth-model.js";
import type { UserModel } from "../../src/models/user-model.js";
import { createInMemoryAuthModel } from "./in-memory-auth-model.js";

export function createInMemoryUserModels(): {
  authModel: AuthModel;
  userModel: UserModel;
} {
  const authModel = createInMemoryAuthModel();
  const users: StoredUser[] = [];
  const trackingAuthModel: AuthModel = {
    ...authModel,
    async createUser(input) {
      const user = await authModel.createUser(input);
      users.push(user);
      return user;
    },
  };

  return {
    authModel: trackingAuthModel,
    userModel: {
      async listOtherUsers({ viewerId, limit }) {
        return users
          .filter((user) => user.id !== viewerId)
          .slice(0, limit)
          .map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarKey: null,
          }));
      },
    },
  };
}
