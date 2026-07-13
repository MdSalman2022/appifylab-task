import { Router } from "express";

import { createPostController } from "../controllers/post-controller.js";
import { createRequireAuthentication } from "../middleware/require-authentication.js";
import type { AuthModel } from "../models/auth-model.js";
import type { PostModel } from "../models/post-model.js";

export function createPostRoutes(authModel: AuthModel, postModel: PostModel) {
  const router = Router();
  const controller = createPostController(postModel);

  router.use(createRequireAuthentication(authModel));
  router.route("/").post(controller.create).get(controller.list);
  router
    .route("/:postId")
    .patch(controller.update)
    .delete(controller.remove);
  router
    .route("/:postId/likes")
    .get(controller.listLikers)
    .post(controller.like)
    .delete(controller.unlike);

  return router;
}
