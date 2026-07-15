import { Router } from "express";

import { createCommentController } from "../controllers/comment-controller.js";
import { createRequireAuthentication } from "../middleware/require-authentication.js";
import type { AuthModel } from "../models/auth-model.js";
import type { CommentModel } from "../models/comment-model.js";
import type { PostModel } from "../models/post-model.js";

export function createCommentRoutes(
  authModel: AuthModel,
  postModel: PostModel,
  commentModel: CommentModel,
) {
  const router = Router();
  const controller = createCommentController(postModel, commentModel);

  router.use(createRequireAuthentication(authModel));
  router.get("/:commentId/replies", controller.listReplies);
  router
    .route("/:commentId/likes")
    .get(controller.listLikers)
    .post(controller.like)
    .delete(controller.unlike);

  return router;
}
