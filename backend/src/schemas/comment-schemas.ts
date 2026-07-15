import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(2_000),
  parentId: z.uuid().nullable().optional(),
});

export const listCommentsSchema = z.object({
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const commentIdParamsSchema = z.object({ commentId: z.uuid() });
