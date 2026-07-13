import { Router } from "express";

import { createAuthController } from "../controllers/auth-controller.js";
import { createRequireAuthentication } from "../middleware/require-authentication.js";
import type { AuthModel } from "../models/auth-model.js";
import {
  createAuthentication,
  type Authentication,
} from "../services/authentication-service.js";

export function createAuthRoutes(
  model: AuthModel,
  authentication: Authentication = createAuthentication(model),
) {
  const router = Router();
  const controller = createAuthController(model, authentication);

  router.use(authentication.initialize());
  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.get(
    "/me",
    createRequireAuthentication(model),
    controller.currentUser,
  );
  router.post("/logout", controller.logout);

  return router;
}
