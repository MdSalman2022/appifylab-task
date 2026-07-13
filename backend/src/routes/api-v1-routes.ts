import { Router } from "express";

import type { AuthModel } from "../models/auth-model.js";
import type { PostModel } from "../models/post-model.js";
import { createAuthRoutes } from "./auth-routes.js";
import { createPostRoutes } from "./post-routes.js";

export function createApiV1Routes(authModel: AuthModel, postModel: PostModel) {
  const router = Router();

  router.use("/auth", createAuthRoutes(authModel));
  router.use("/posts", createPostRoutes(authModel, postModel));

  return router;
}
