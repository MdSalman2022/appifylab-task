import type { NextFunction, Request, Response } from "express";

import type { UserModel } from "../models/user-model.js";
import { listUsersSchema } from "../schemas/user-schemas.js";
import { validateInput } from "../schemas/validation.js";

export function createUserController(model: UserModel) {
  return {
    list: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const input = validateInput(
          listUsersSchema,
          request.query,
          response,
          "Invalid users query",
        );
        if (!input) return;

        const users = await model.listOtherUsers({
          viewerId: request.user!.id,
          limit: input.limit,
        });
        response.json({ data: { users } });
      } catch (error) {
        next(error);
      }
    },
  };
}
