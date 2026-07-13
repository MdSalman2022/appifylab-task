import { z } from "zod";

const postFields = {
  content: z.string().trim().max(5_000).nullable().optional(),
  imageKey: z.string().trim().min(1).max(512).nullable().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
} as const;

export const createPostSchema = z
  .object(postFields)
  .transform((input) => ({
    ...input,
    visibility: input.visibility ?? ("PUBLIC" as const),
  }))
  .refine(({ content, imageKey }) => Boolean(content || imageKey), {
    message: "A post requires text or an image",
    path: ["content"],
  });

export const updatePostSchema = z
  .object(postFields)
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field is required",
  });

export const listPostsSchema = z.object({
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const listPostLikersSchema = listPostsSchema;

export const postIdParamsSchema = z.object({ postId: z.uuid() });
