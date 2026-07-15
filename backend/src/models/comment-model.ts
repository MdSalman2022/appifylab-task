import { getPrismaClient } from "../lib/prisma.js";
import type { PostAuthor } from "./post-model.js";

export type StoredComment = {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  likeCount: number;
  replyCount: number;
  viewerHasLiked: boolean;
  createdAt: Date;
  author: PostAuthor;
};

export type CommentLiker = PostAuthor;

export type CommentModel = {
  createComment(input: {
    postId: string;
    authorId: string;
    parentId: string | null;
    content: string;
  }): Promise<StoredComment>;
  listComments(input: {
    postId: string;
    parentId: string | null;
    viewerId: string;
    cursor?: string;
    limit: number;
  }): Promise<StoredComment[]>;
  findCommentById(id: string, viewerId: string): Promise<StoredComment | null>;
  likeComment(commentId: string, userId: string): Promise<StoredComment>;
  unlikeComment(commentId: string, userId: string): Promise<StoredComment>;
  listCommentLikers(input: {
    commentId: string;
    cursor?: string;
    limit: number;
  }): Promise<CommentLiker[]>;
};

const commentWithAuthor = {
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarKey: true,
    },
  },
} as const;

function commentWithViewer(viewerId: string) {
  return {
    ...commentWithAuthor,
    likes: {
      where: { userId: viewerId },
      select: { userId: true },
      take: 1,
    },
  } as const;
}

function withViewerLike<T extends { likes: { userId: string }[] }>(
  comment: T,
): Omit<T, "likes"> & { viewerHasLiked: boolean } {
  const { likes, ...storedComment } = comment;
  return { ...storedComment, viewerHasLiked: likes.length > 0 };
}

async function findCommentWithViewer(commentId: string, viewerId: string) {
  const comment = await getPrismaClient().comment.findUnique({
    where: { id: commentId },
    include: commentWithViewer(viewerId),
  });
  return comment ? withViewerLike(comment) : null;
}

export function createPrismaCommentModel(): CommentModel {
  return {
    async createComment(data) {
      const comment = await getPrismaClient().$transaction(
        async (transaction) => {
          const created = await transaction.comment.create({
            data,
            include: commentWithAuthor,
          });
          await transaction.post.update({
            where: { id: data.postId },
            data: { commentCount: { increment: 1 } },
          });
          if (data.parentId) {
            await transaction.comment.update({
              where: { id: data.parentId },
              data: { replyCount: { increment: 1 } },
            });
          }
          return created;
        },
      );
      return { ...comment, viewerHasLiked: false };
    },
    async listComments({ postId, parentId, viewerId, cursor, limit }) {
      const comments = await getPrismaClient().comment.findMany({
        where: { postId, parentId },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: limit,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: commentWithViewer(viewerId),
      });
      return comments.map(withViewerLike);
    },
    findCommentById: findCommentWithViewer,
    async likeComment(commentId, userId) {
      await getPrismaClient().$transaction(async (transaction) => {
        const created = await transaction.commentLike.createMany({
          data: { commentId, userId },
          skipDuplicates: true,
        });
        if (created.count > 0) {
          await transaction.comment.update({
            where: { id: commentId },
            data: { likeCount: { increment: 1 } },
          });
        }
      });
      return (await findCommentWithViewer(commentId, userId))!;
    },
    async unlikeComment(commentId, userId) {
      await getPrismaClient().$transaction(async (transaction) => {
        const deleted = await transaction.commentLike.deleteMany({
          where: { commentId, userId },
        });
        if (deleted.count > 0) {
          await transaction.comment.update({
            where: { id: commentId },
            data: { likeCount: { decrement: 1 } },
          });
        }
      });
      return (await findCommentWithViewer(commentId, userId))!;
    },
    async listCommentLikers({ commentId, cursor, limit }) {
      const likes = await getPrismaClient().commentLike.findMany({
        where: { commentId },
        orderBy: [{ createdAt: "desc" }, { userId: "desc" }],
        take: limit,
        ...(cursor
          ? {
              cursor: { commentId_userId: { commentId, userId: cursor } },
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
