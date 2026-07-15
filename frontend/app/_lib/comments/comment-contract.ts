import { z } from "zod";

import { postUserSchema } from "../posts/post-contract";

export const commentSchema = z.object({
  id: z.uuid(),
  postId: z.uuid(),
  authorId: z.uuid(),
  parentId: z.uuid().nullable(),
  content: z.string(),
  likeCount: z.number().int().nonnegative(),
  replyCount: z.number().int().nonnegative(),
  viewerHasLiked: z.boolean(),
  createdAt: z.iso.datetime(),
  author: postUserSchema,
});

export const commentResponseSchema = z.object({
  data: z.object({ comment: commentSchema }),
});

export const commentPageResponseSchema = z.object({
  data: z.object({
    comments: z.array(commentSchema),
    nextCursor: z.uuid().nullable(),
  }),
});

export const commentLikersResponseSchema = z.object({
  data: z.object({
    users: z.array(postUserSchema),
    nextCursor: z.uuid().nullable(),
  }),
});

export type FeedComment = z.infer<typeof commentSchema>;
export type CommentPage = z.infer<typeof commentPageResponseSchema>["data"];
export type CommentLikersPage = z.infer<
  typeof commentLikersResponseSchema
>["data"];

export type CreateCommentInput = {
  content: string;
  parentId?: string;
};
