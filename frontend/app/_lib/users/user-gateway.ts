import { notFoundResponse, proxyJsonApiRequest } from "../api/api-gateway";
import { USERS_API_PATH } from "../api/api-paths";

export function proxyUserRequest(request: Request, path: string[]) {
  if (request.method !== "GET" || path.length !== 0) {
    return notFoundResponse();
  }
  return proxyJsonApiRequest(
    request,
    USERS_API_PATH,
    "The user service is unavailable",
  );
}
