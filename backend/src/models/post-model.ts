import { getPrismaClient } from "../lib/prisma.js";

export type PostVisibility = "PUBLIC" | "PRIVATE";

export type PostAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  avatarKey: string | null;
};

export type StoredPost = {
  id: string;
  authorId: string;
  content: string | null;
  imageKey: string | null;
  visibility: PostVisibility;
  likeCount: number;
  commentCount: number;
  viewerHasLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: PostAuthor;
};

export type PostLiker = PostAuthor;

export type PostModel = {
  createPost(input: {
    authorId: string;
    content: string | null;
    imageKey: string | null;
    visibility: PostVisibility;
  }): Promise<StoredPost>;
  listVisiblePosts(input: {
    viewerId: string;
    cursor?: string;
    limit: number;
  }): Promise<StoredPost[]>;
  findPostById(id: string, viewerId: string): Promise<StoredPost | null>;
  updatePost(
    id: string,
    input: Partial<Pick<StoredPost, "content" | "imageKey" | "visibility">>,
    viewerId: string,
  ): Promise<StoredPost>;
  deletePost(id: string): Promise<void>;
  likePost(postId: string, userId: string): Promise<StoredPost>;
  unlikePost(postId: string, userId: string): Promise<StoredPost>;
  listPostLikers(input: {
    postId: string;
    cursor?: string;
    limit: number;
  }): Promise<PostLiker[]>;
};

const postWithAuthor = {
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarKey: true,
    },
  },
} as const;

function postWithViewer(viewerId: string) {
  return {
    ...postWithAuthor,
    likes: {
      where: { userId: viewerId },
      select: { userId: true },
      take: 1,
    },
  } as const;
}

function withViewerLike<
  T extends { likes: { userId: string }[] },
>(post: T): Omit<T, "likes"> & { viewerHasLiked: boolean } {
  const { likes, ...storedPost } = post;
  return { ...storedPost, viewerHasLiked: likes.length > 0 };
}

async function findPostWithViewer(postId: string, viewerId: string) {
  const post = await getPrismaClient().post.findUnique({
    where: { id: postId },
    include: postWithViewer(viewerId),
  });
  return post ? withViewerLike(post) : null;
}

export function createPrismaPostModel(): PostModel {
  return {
    async createPost(data) {
      const post = await getPrismaClient().post.create({
        data,
        include: postWithAuthor,
      });
      return { ...post, viewerHasLiked: false };
    },
    async listVisiblePosts({ viewerId, cursor, limit }) {
      const posts = await getPrismaClient().post.findMany({
        where: {
          OR: [{ visibility: "PUBLIC" }, { authorId: viewerId }],
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: postWithViewer(viewerId),
      });
      return posts.map(withViewerLike);
    },
    findPostById: findPostWithViewer,
    async updatePost(id, data, viewerId) {
      await getPrismaClient().post.update({ where: { id }, data });
      return (await findPostWithViewer(id, viewerId))!;
    },
    async deletePost(id) {
      await getPrismaClient().post.delete({ where: { id } });
    },
    async likePost(postId, userId) {
      await getPrismaClient().$transaction(async (transaction) => {
        const created = await transaction.postLike.createMany({
          data: { postId, userId },
          skipDuplicates: true,
        });
        if (created.count > 0) {
          await transaction.post.update({
            where: { id: postId },
            data: { likeCount: { increment: 1 } },
          });
        }
      });
      return (await findPostWithViewer(postId, userId))!;
    },
    async unlikePost(postId, userId) {
      await getPrismaClient().$transaction(async (transaction) => {
        const deleted = await transaction.postLike.deleteMany({
          where: { postId, userId },
        });
        if (deleted.count > 0) {
          await transaction.post.update({
            where: { id: postId },
            data: { likeCount: { decrement: 1 } },
          });
        }
      });
      return (await findPostWithViewer(postId, userId))!;
    },
    async listPostLikers({ postId, cursor, limit }) {
      const likes = await getPrismaClient().postLike.findMany({
        where: { postId },
        orderBy: [{ createdAt: "desc" }, { userId: "desc" }],
        take: limit,
        ...(cursor
          ? {
              cursor: { postId_userId: { postId, userId: cursor } },
              skip: 1,
            }
          : {}),
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarKey: true,
            },
          },
        },
      });
      return likes.map(({ user }) => user);
    },
  };
}
