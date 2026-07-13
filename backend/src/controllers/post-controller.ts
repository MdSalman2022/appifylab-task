import type { NextFunction, Request, Response } from "express";

import type { PostModel, StoredPost } from "../models/post-model.js";
import {
  createPostSchema,
  listPostLikersSchema,
  listPostsSchema,
  postIdParamsSchema,
  updatePostSchema,
} from "../schemas/post-schemas.js";
import { validateInput } from "../schemas/validation.js";

async function findAccessiblePost(
  model: PostModel,
  postId: string,
  viewerId: string,
  response: Response,
): Promise<StoredPost | null> {
  const post = await model.findPostById(postId, viewerId);
  if (!post || (post.visibility === "PRIVATE" && post.authorId !== viewerId)) {
    response.status(404).json({
      error: { code: "POST_NOT_FOUND", message: "Post not found" },
    });
    return null;
  }
  return post;
}

export function createPostController(model: PostModel) {
  return {
    create: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const input = validateInput(
          createPostSchema,
          request.body,
          response,
          "Invalid post details",
        );
        if (!input) return;

        const post = await model.createPost({
          authorId: request.user!.id,
          content: input.content || null,
          imageKey: input.imageKey || null,
          visibility: input.visibility,
        });
        response.status(201).json({ data: { post } });
      } catch (error) {
        next(error);
      }
    },

    list: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const input = validateInput(
          listPostsSchema,
          request.query,
          response,
          "Invalid feed query",
        );
        if (!input) return;

        const posts = await model.listVisiblePosts({
          viewerId: request.user!.id,
          cursor: input.cursor,
          limit: input.limit + 1,
        });
        const hasNextPage = posts.length > input.limit;
        const page = hasNextPage ? posts.slice(0, input.limit) : posts;
        response.json({
          data: {
            posts: page,
            nextCursor: hasNextPage ? page.at(-1)!.id : null,
          },
        });
      } catch (error) {
        next(error);
      }
    },

    update: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const params = validateInput(
          postIdParamsSchema,
          request.params,
          response,
          "Invalid post identifier",
        );
        if (!params) return;
        const input = validateInput(
          updatePostSchema,
          request.body,
          response,
          "Invalid post details",
        );
        if (!input) return;

        const existing = await model.findPostById(
          params.postId,
          request.user!.id,
        );
        if (!existing) {
          response.status(404).json({
            error: { code: "POST_NOT_FOUND", message: "Post not found" },
          });
          return;
        }
        if (existing.authorId !== request.user!.id) {
          response.status(403).json({
            error: {
              code: "FORBIDDEN",
              message: "You cannot modify this post",
            },
          });
          return;
        }

        const nextContent = Object.hasOwn(input, "content")
          ? input.content
          : existing.content;
        const nextImageKey = Object.hasOwn(input, "imageKey")
          ? input.imageKey
          : existing.imageKey;
        if (!nextContent && !nextImageKey) {
          response.status(422).json({
            error: {
              code: "VALIDATION_ERROR",
              message: "A post requires text or an image",
              details: { content: ["A post requires text or an image"] },
            },
          });
          return;
        }

        const post = await model.updatePost(
          params.postId,
          input,
          request.user!.id,
        );
        response.json({ data: { post } });
      } catch (error) {
        next(error);
      }
    },

    remove: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const params = validateInput(
          postIdParamsSchema,
          request.params,
          response,
          "Invalid post identifier",
        );
        if (!params) return;

        const existing = await model.findPostById(
          params.postId,
          request.user!.id,
        );
        if (!existing) {
          response.status(404).json({
            error: { code: "POST_NOT_FOUND", message: "Post not found" },
          });
          return;
        }
        if (existing.authorId !== request.user!.id) {
          response.status(403).json({
            error: {
              code: "FORBIDDEN",
              message: "You cannot delete this post",
            },
          });
          return;
        }

        await model.deletePost(params.postId);
        response.status(204).send();
      } catch (error) {
        next(error);
      }
    },

    like: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const params = validateInput(
          postIdParamsSchema,
          request.params,
          response,
          "Invalid post identifier",
        );
        if (!params) return;
        const post = await findAccessiblePost(
          model,
          params.postId,
          request.user!.id,
          response,
        );
        if (!post) return;

        const likedPost = await model.likePost(params.postId, request.user!.id);
        response.json({ data: { post: likedPost } });
      } catch (error) {
        next(error);
      }
    },

    unlike: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const params = validateInput(
          postIdParamsSchema,
          request.params,
          response,
          "Invalid post identifier",
        );
        if (!params) return;
        const post = await findAccessiblePost(
          model,
          params.postId,
          request.user!.id,
          response,
        );
        if (!post) return;

        const unlikedPost = await model.unlikePost(
          params.postId,
          request.user!.id,
        );
        response.json({ data: { post: unlikedPost } });
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
          postIdParamsSchema,
          request.params,
          response,
          "Invalid post identifier",
        );
        if (!params) return;
        const query = validateInput(
          listPostLikersSchema,
          request.query,
          response,
          "Invalid likers query",
        );
        if (!query) return;
        const post = await findAccessiblePost(
          model,
          params.postId,
          request.user!.id,
          response,
        );
        if (!post) return;

        const users = await model.listPostLikers({
          postId: params.postId,
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
