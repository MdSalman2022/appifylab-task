import { createHash, randomBytes } from "node:crypto";

import type { Response } from "express";

import type { AuthModel, StoredUser } from "../models/auth-model.js";

export const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1_000;

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(model: AuthModel, userId: string) {
  const token = randomBytes(32).toString("base64url");
  await model.createSession({
    tokenHash: hashSessionToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  });
  return token;
}

export async function findSessionUser(
  model: AuthModel,
  token: string | undefined,
): Promise<StoredUser | null> {
  if (!token) return null;
  const session = await model.findSessionByTokenHash(hashSessionToken(token));
  if (!session || session.expiresAt <= new Date()) return null;
  return model.findUserById(session.userId);
}

export function setSessionCookie(
  response: Response,
  token: string,
  persistent: boolean,
) {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    ...(persistent ? { maxAge: SESSION_DURATION_MS } : {}),
  });
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(SESSION_COOKIE, { path: "/" });
}
