import type { NextFunction, Request, Response } from "express";

import type {
  CommentModel,
  StoredComment,
} from "../models/comment-model.js";
import type { PostModel } from "../models/post-model.js";
import {
  commentIdParamsSchema,
  createCommentSchema,
  listCommentsSchema,
} from "../schemas/comment-schemas.js";
import { postIdParamsSchema } from "../schemas/post-schemas.js";
import { validateInput } from "../schemas/validation.js";

async function canAccessPost(
  postModel: PostModel,
  postId: string,
  viewerId: string,
  response: Response,
) {
  const post = await postModel.findPostById(postId, viewerId);
  if (!post || (post.visibility === "PRIVATE" && post.authorId !== viewerId)) {
    response.status(404).json({
      error: { code: "POST_NOT_FOUND", message: "Post not found" },
    });
    return false;
  }
  return true;
}

async function findAccessibleComment(
  commentModel: CommentModel,
  postModel: PostModel,
  commentId: string,
  viewerId: string,
  response: Response,
): Promise<StoredComment | null> {
  const comment = await commentModel.findCommentById(commentId, viewerId);
  if (!comment) {
    response.status(404).json({
      error: { code: "COMMENT_NOT_FOUND", message: "Comment not found" },
    });
    return null;
  }
  if (!(await canAccessPost(postModel, comment.postId, viewerId, response))) {
    return null;
  }
  return comment;
}

function sendCommentPage(
  response: Response,
  comments: StoredComment[],
  limit: number,
) {
  const hasNextPage = comments.length > limit;
  const page = hasNextPage ? comments.slice(0, limit) : comments;
  response.json({
    data: {
      comments: page,
      nextCursor: hasNextPage ? page.at(-1)!.id : null,
    },
  });
}

export function createCommentController(
  postModel: PostModel,
  commentModel: CommentModel,
) {
  return {
    create: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const params = validateInput(
          postIdParamsSchema,
          request.params,
          response,
          "Invalid post identifier",
        );
        if (!params) return;
        const input = validateInput(
          createCommentSchema,
          request.body,
          response,
          "Invalid comment details",
        );
        if (!input) return;
        if (
          !(await canAccessPost(
            postModel,
            params.postId,
            request.user!.id,
            response,
          ))
        ) {
          return;
        }

        if (input.parentId) {
          const parent = await commentModel.findCommentById(
            input.parentId,
            request.user!.id,
          );
          if (
            !parent ||
            parent.postId !== params.postId ||
            parent.parentId !== null
          ) {
            response.status(422).json({
              error: {
                code: "INVALID_PARENT_COMMENT",
                message: "Replies can only target a top-level comment",
              },
            });
            return;
          }
        }

        const comment = await commentModel.createComment({
          postId: params.postId,
          authorId: request.user!.id,
          parentId: input.parentId ?? null,
          content: input.content,
        });
        response.status(201).json({ data: { comment } });
      } catch (error) {
        next(error);
      }
    },

    list: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const params = validateInput(
          postIdParamsSchema,
          request.params,
          response,
          "Invalid post identifier",
        );
        if (!params) return;
        const query = validateInput(
          listCommentsSchema,
          request.query,
          response,
          "Invalid comments query",
        );
        if (!query) return;
        if (
          !(await canAccessPost(
            postModel,
            params.postId,
            request.user!.id,
            response,
          ))
        ) {
          return;
        }

        const comments = await commentModel.listComments({
          postId: params.postId,
          parentId: null,
          viewerId: request.user!.id,
          cursor: query.cursor,
          limit: query.limit + 1,
        });
        sendCommentPage(response, comments, query.limit);
      } catch (error) {
        next(error);
      }
    },

    listReplies: async (
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const params = validateInput(
          commentIdParamsSchema,
          request.params,
          response,
          "Invalid comment identifier",
        );
        if (!params) return;
        const query = validateInput(
          listCommentsSchema,
          request.query,
          response,
          "Invalid replies query",
        );
        if (!query) return;
        const parent = await findAccessibleComment(
          commentModel,
          postModel,
          params.commentId,
          request.user!.id,
          response,
        );
        if (!parent) return;
        if (parent.parentId !== null) {
          response.status(422).json({
            error: {
              code: "INVALID_PARENT_COMMENT",
              message: "Replies can only be listed for a top-level comment",
            },
          });
          return;
        }

        const comments = await commentModel.listComments({
          postId: parent.postId,
          parentId: parent.id,
          viewerId: request.user!.id,
          cursor: query.cursor,
          limit: query.limit + 1,
        });
        sendCommentPage(response, comments, query.limit);
      } catch (error) {
        next(error);
      }
    },

    like: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const params = validateInput(
          commentIdParamsSchema,
          request.params,
          response,
          "Invalid comment identifier",
        );
        if (!params) return;
        const comment = await findAccessibleComment(
          commentModel,
          postModel,
          params.commentId,
          request.user!.id,
          response,
        );
        if (!comment) return;

        const likedComment = await commentModel.likeComment(
          params.commentId,
          request.user!.id,
        );
        response.json({ data: { comment: likedComment } });
      } catch (error) {
        next(error);
      }
    },

    unlike: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const params = validateInput(
          commentIdParamsSchema,
          request.params,
          response,
          "Invalid comment identifier",
        );
        if (!params) return;
        const comment = await findAccessibleComment(
          commentModel,
          postModel,
          params.commentId,
          request.user!.id,
          response,
        );
        if (!comment) return;

        const unlikedComment = await commentModel.unlikeComment(
          params.commentId,
          request.user!.id,
        );
        response.json({ data: { comment: unlikedComment } });
      } catch (error) {
        next(error);
      }
    },

    listLikers: async (
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const params = validateInput(
          commentIdParamsSchema,
          request.params,
          response,
          "Invalid comment identifier",
        );
        if (!params) return;
        const query = validateInput(
          listCommentsSchema,
          request.query,
          response,
          "Invalid likers query",
        );
        if (!query) return;
        const comment = await findAccessibleComment(
          commentModel,
          postModel,
          params.commentId,
          request.user!.id,
          response,
        );
        if (!comment) return;

        const users = await commentModel.listCommentLikers({
          commentId: params.commentId,
          cursor: query.cursor,
          limit: query.limit + 1,
        });
        const hasNextPage = users.length > query.limit;
        const page = hasNextPage ? users.slice(0, query.limit) : users;
        response.json({
          data: {
            users: page,
            nextCursor: hasNextPage ? page.at(-1)!.id : null,
          },
        });
      } catch (error) {
        next(error);
      }
    },
  };
}
