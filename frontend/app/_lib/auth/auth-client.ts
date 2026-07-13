import { requestEmpty, requestJson } from "../api/api-client";
import {
  authResponseSchema,
  type AuthUser,
  type LoginInput,
  type RegistrationInput,
} from "./auth-contract";

export { ApiError } from "../api/api-client";

export function login(input: LoginInput): Promise<AuthUser> {
  return requestJson(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify(input) },
    authResponseSchema,
  ).then((response) => response.data.user);
}

export function register(input: RegistrationInput): Promise<AuthUser> {
  return requestJson(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify(input) },
    authResponseSchema,
  ).then((response) => response.data.user);
}

export async function logout(): Promise<void> {
  await requestEmpty("/api/auth/logout", { method: "POST" });
}
