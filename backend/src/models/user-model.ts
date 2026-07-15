import { getPrismaClient } from "../lib/prisma.js";
import type { PostAuthor } from "./post-model.js";

export type PublicUser = PostAuthor;

export type UserModel = {
  listOtherUsers(input: {
    viewerId: string;
    limit: number;
  }): Promise<PublicUser[]>;
};

export function createPrismaUserModel(): UserModel {
  return {
    listOtherUsers({ viewerId, limit }) {
      return getPrismaClient().user.findMany({
        where: { id: { not: viewerId } },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarKey: true,
        },
      });
    },
  };
}
