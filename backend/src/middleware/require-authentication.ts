import type { NextFunction, Request, Response } from "express";

import type { AuthModel } from "../models/auth-model.js";
import { findSessionUser, SESSION_COOKIE } from "../services/session-service.js";

export function createRequireAuthentication(model: AuthModel) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const token = request.cookies[SESSION_COOKIE] as string | undefined;
      const user = await findSessionUser(model, token);
      if (!user) {
        response.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        });
        return;
      }

      request.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
