import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { authResponseSchema, type AuthUser } from "./auth-contract";
import { getApiUrl } from "./api-url";
import { AUTH_API_PATH } from "../api/api-paths";

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  const response = await fetch(`${getApiUrl()}${AUTH_API_PATH}/me`, {
    headers: { cookie: `session=${session}` },
    cache: "no-store",
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Unable to verify the current session");

  const parsed = authResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("The authentication service returned an invalid response");
  return parsed.data.data.user;
});

export async function requireCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
