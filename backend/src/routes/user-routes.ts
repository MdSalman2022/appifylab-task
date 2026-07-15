import { Router } from "express";

import { createUserController } from "../controllers/user-controller.js";
import { createRequireAuthentication } from "../middleware/require-authentication.js";
import type { AuthModel } from "../models/auth-model.js";
import type { UserModel } from "../models/user-model.js";

export function createUserRoutes(authModel: AuthModel, userModel: UserModel) {
  const router = Router();
  const controller = createUserController(userModel);

  router.use(createRequireAuthentication(authModel));
  router.get("/", controller.list);

  return router;
}
