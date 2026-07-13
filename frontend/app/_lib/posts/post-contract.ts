import { z } from "zod";

export const postVisibilitySchema = z.enum(["PUBLIC", "PRIVATE"]);

export const postUserSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  avatarKey: z.string().nullable(),
});

export const postSchema = z.object({
  id: z.uuid(),
  authorId: z.uuid(),
  content: z.string().nullable(),
  imageKey: z.string().nullable(),
  visibility: postVisibilitySchema,
  likeCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
  viewerHasLiked: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  author: postUserSchema,
});

export const postResponseSchema = z.object({
  data: z.object({ post: postSchema }),
});

export const postPageResponseSchema = z.object({
  data: z.object({
    posts: z.array(postSchema),
    nextCursor: z.uuid().nullable(),
  }),
});

export const postLikersResponseSchema = z.object({
  data: z.object({
    users: z.array(postUserSchema),
    nextCursor: z.uuid().nullable(),
  }),
});

export type FeedPost = z.infer<typeof postSchema>;
export type PostVisibility = z.infer<typeof postVisibilitySchema>;
export type PostPage = z.infer<typeof postPageResponseSchema>["data"];
export type PostLiker = z.infer<typeof postUserSchema>;
export type PostLikersPage = z.infer<typeof postLikersResponseSchema>["data"];

export type CreatePostInput = {
  content?: string;
  imageKey?: string;
  visibility: PostVisibility;
};

export type UpdatePostInput = Partial<CreatePostInput>;
