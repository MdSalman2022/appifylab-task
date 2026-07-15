import { z } from "zod";

import { postUserSchema } from "../posts/post-contract";

export const usersResponseSchema = z.object({
  data: z.object({ users: z.array(postUserSchema) }),
});

export type CommunityUser = z.infer<typeof postUserSchema>;
