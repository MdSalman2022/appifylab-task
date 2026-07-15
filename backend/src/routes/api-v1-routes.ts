import { Router } from "express";

import type { AuthModel } from "../models/auth-model.js";
import type { CommentModel } from "../models/comment-model.js";
import type { PostModel } from "../models/post-model.js";
import type { UserModel } from "../models/user-model.js";
import type { PostImageStorage } from "../services/post-image-storage.js";
import { createAuthRoutes } from "./auth-routes.js";
import { createCommentRoutes } from "./comment-routes.js";
import { createPostRoutes } from "./post-routes.js";
import { createUploadRoutes } from "./upload-routes.js";
import { createUserRoutes } from "./user-routes.js";

export function createApiV1Routes(
  authModel: AuthModel,
  postModel: PostModel,
  commentModel: CommentModel,
  postImageStorage: PostImageStorage,
  userModel: UserModel,
) {
  const router = Router();

  router.use("/auth", createAuthRoutes(authModel));
  router.use("/posts", createPostRoutes(authModel, postModel, commentModel));
  router.use(
    "/comments",
    createCommentRoutes(authModel, postModel, commentModel),
  );
  router.use("/uploads", createUploadRoutes(authModel, postImageStorage));
  router.use("/users", createUserRoutes(authModel, userModel));

  return router;
}
