import {
  notFoundResponse,
  proxyJsonApiRequest,
  uuidPathSegmentPattern,
} from "../api/api-gateway";
import { POSTS_API_PATH } from "../api/api-paths";

function isAllowedRequest(method: string, path: string[]) {
  if (path.length === 0) return method === "GET" || method === "POST";
  if (path.length === 1 && uuidPathSegmentPattern.test(path[0])) {
    return method === "PATCH" || method === "DELETE";
  }
  if (path.length === 2 && uuidPathSegmentPattern.test(path[0])) {
    if (path[1] === "comments") return method === "GET" || method === "POST";
    if (path[1] === "likes") {
      return method === "GET" || method === "POST" || method === "DELETE";
    }
  }
  return false;
}

export function proxyPostRequest(request: Request, path: string[]) {
  if (!isAllowedRequest(request.method, path)) return notFoundResponse();
  const suffix = path.length ? `/${path.join("/")}` : "";
  return proxyJsonApiRequest(
    request,
    `${POSTS_API_PATH}${suffix}`,
    "The post service is unavailable",
  );
}
