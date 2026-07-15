import { z } from "zod";

export const listUsersSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(8),
});
