import { requestJson } from "../api/api-client";
import { USERS_API_PATH } from "../api/api-paths";
import { usersResponseSchema, type CommunityUser } from "./user-contract";

export async function listCommunityUsers(
  limit = 8,
): Promise<CommunityUser[]> {
  const response = await requestJson(
    `${USERS_API_PATH}?limit=${limit}`,
    { method: "GET" },
    usersResponseSchema,
  );
  return response.data.users;
}
