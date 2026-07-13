import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";

import type { AuthModel, StoredUser } from "../models/auth-model.js";
import { loginSchema, registrationSchema } from "../schemas/auth-schemas.js";
import { validateInput } from "../schemas/validation.js";
import type { Authentication } from "../services/authentication-service.js";
import {
  clearSessionCookie,
  createSession,
  hashSessionToken,
  SESSION_COOKIE,
  setSessionCookie,
} from "../services/session-service.js";

function publicUser(user: StoredUser) {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export function createAuthController(
  model: AuthModel,
  authentication: Authentication,
) {
  return {
    register: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const input = validateInput(
          registrationSchema,
          request.body,
          response,
          "Invalid registration details",
        );
        if (!input) return;

        if (await model.findUserByEmail(input.email)) {
          response.status(409).json({
            error: {
              code: "EMAIL_ALREADY_EXISTS",
              message: "An account already exists for this email",
            },
          });
          return;
        }

        const user = await model.createUser({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          passwordHash: await bcrypt.hash(input.password, 12),
        });
        const token = await createSession(model, user.id);
        setSessionCookie(response, token, true);
        response.status(201).json({ data: { user: publicUser(user) } });
      } catch (error) {
        next(error);
      }
    },

    login: (request: Request, response: Response, next: NextFunction) => {
      const input = validateInput(
        loginSchema,
        request.body,
        response,
        "Invalid login details",
      );
      if (!input) return;

      request.body = input;
      authentication.authenticate(
        "local",
        { session: false },
        (error: unknown, user: Express.User | false | null) => {
          if (error) {
            next(error);
            return;
          }
          if (!user) {
            response.status(401).json({
              error: {
                code: "INVALID_CREDENTIALS",
                message: "Invalid credentials",
              },
            });
            return;
          }

          void createSession(model, user.id)
            .then((token) => {
              setSessionCookie(response, token, input.rememberMe);
              response.json({ data: { user: publicUser(user) } });
            })
            .catch(next);
        },
      )(request, response, next);
    },

    currentUser: (request: Request, response: Response) => {
      response.json({ data: { user: publicUser(request.user!) } });
    },

    logout: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const token = request.cookies[SESSION_COOKIE] as string | undefined;
        if (token) await model.deleteSession(hashSessionToken(token));
        clearSessionCookie(response);
        response.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  };
}
