import { z } from "zod";

import { POST_IMAGE_CONTENT_TYPES } from "../services/post-image-storage.js";

export const createPostImageUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(POST_IMAGE_CONTENT_TYPES),
  size: z.number().int().min(1).max(5 * 1024 * 1024),
});
