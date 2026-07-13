import { createHash, randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import { Router, type Response } from "express";
import { z } from "zod";

import {
  createAuthentication,
  type Authentication,
} from "./authentication.js";
import type { AuthStore, StoredUser } from "./auth-store.js";

const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1_000;

const registrationSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.email().trim().toLowerCase().max(320),
  password: z.string().min(12).max(128),
});

const loginSchema = z.object({
  email: z.email().trim().toLowerCase().max(320),
  password: z.string().min(1).max(128),
});

function publicUser(user: StoredUser) {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function setSessionCookie(response: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS,
  });
}

async function createSession(store: AuthStore, userId: string) {
  const token = randomBytes(32).toString("base64url");
  await store.createSession({
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  });
  return token;
}

export function createAuthRouter(
  store: AuthStore,
  authentication: Authentication = createAuthentication(store),
) {
  const router = Router();

  router.use(authentication.initialize());

  router.post("/register", async (request, response, next) => {
    try {
      const parsed = registrationSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(422).json({
          error: { code: "VALIDATION_ERROR", message: "Invalid registration details" },
        });
        return;
      }

      if (await store.findUserByEmail(parsed.data.email)) {
        response.status(409).json({
          error: { code: "EMAIL_ALREADY_EXISTS", message: "An account already exists for this email" },
        });
        return;
      }

      const user = await store.createUser({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
      });
      const token = await createSession(store, user.id);
      setSessionCookie(response, token);
      response.status(201).json({ data: { user: publicUser(user) } });
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", (request, response, next) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(422).json({
        error: { code: "VALIDATION_ERROR", message: "Invalid login details" },
      });
      return;
    }

    request.body = parsed.data;
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
            error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
          });
          return;
        }

        void createSession(store, user.id)
          .then((token) => {
            setSessionCookie(response, token);
            response.json({ data: { user: publicUser(user) } });
          })
          .catch(next);
      },
    )(request, response, next);
  });

  router.get("/me", async (request, response) => {
    const token = request.cookies[SESSION_COOKIE] as string | undefined;
    const session = token ? await store.findSessionByTokenHash(hashToken(token)) : null;
    if (!session || session.expiresAt <= new Date()) {
      response.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    const user = await store.findUserById(session.userId);
    if (!user) {
      response.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    response.json({ data: { user: publicUser(user) } });
  });

  router.post("/logout", async (request, response) => {
    const token = request.cookies[SESSION_COOKIE] as string | undefined;
    if (token) await store.deleteSession(hashToken(token));
    response.clearCookie(SESSION_COOKIE, { path: "/" });
    response.status(204).send();
  });

  return router;
}
