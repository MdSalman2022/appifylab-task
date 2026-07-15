import { Router } from "express";

import { createCommentController } from "../controllers/comment-controller.js";
import { createPostController } from "../controllers/post-controller.js";
import { createRequireAuthentication } from "../middleware/require-authentication.js";
import { validatePostImageOwnership } from "../middleware/validate-post-image-ownership.js";
import type { AuthModel } from "../models/auth-model.js";
import type { CommentModel } from "../models/comment-model.js";
import type { PostModel } from "../models/post-model.js";

export function createPostRoutes(
  authModel: AuthModel,
  postModel: PostModel,
  commentModel: CommentModel,
) {
  const router = Router();
  const controller = createPostController(postModel);
  const commentController = createCommentController(postModel, commentModel);

  router.use(createRequireAuthentication(authModel));
  router
    .route("/")
    .post(validatePostImageOwnership, controller.create)
    .get(controller.list);
  router
    .route("/:postId/comments")
    .get(commentController.list)
    .post(commentController.create);
  router
    .route("/:postId")
    .patch(validatePostImageOwnership, controller.update)
    .delete(controller.remove);
  router
    .route("/:postId/likes")
    .get(controller.listLikers)
    .post(controller.like)
    .delete(controller.unlike);

  return router;
}
