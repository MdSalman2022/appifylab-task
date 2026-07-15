import type { NextFunction, Request, Response } from "express";

import { createPostImageUploadSchema } from "../schemas/upload-schemas.js";
import { validateInput } from "../schemas/validation.js";
import type { PostImageStorage } from "../services/post-image-storage.js";

export function createUploadController(storage: PostImageStorage) {
  return {
    createPostImageUpload: async (
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const input = validateInput(
          createPostImageUploadSchema,
          request.body,
          response,
          "Invalid image details",
        );
        if (!input) return;

        const upload = await storage.createPostImageUpload({
          ...input,
          userId: request.user!.id,
        });
        response.status(201).json({ data: { upload } });
      } catch (error) {
        next(error);
      }
    },
  };
}
