import { Router } from "express";

import { createUploadController } from "../controllers/upload-controller.js";
import { createRequireAuthentication } from "../middleware/require-authentication.js";
import type { AuthModel } from "../models/auth-model.js";
import type { PostImageStorage } from "../services/post-image-storage.js";

export function createUploadRoutes(
  authModel: AuthModel,
  storage: PostImageStorage,
) {
  const router = Router();
  const controller = createUploadController(storage);

  router.use(createRequireAuthentication(authModel));
  router.post(
    "/post-images/presign",
    controller.createPostImageUpload,
  );

  return router;
}
