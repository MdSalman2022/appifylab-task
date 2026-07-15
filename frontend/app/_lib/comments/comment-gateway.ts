import {
  notFoundResponse,
  proxyJsonApiRequest,
  uuidPathSegmentPattern,
} from "../api/api-gateway";
import { COMMENTS_API_PATH } from "../api/api-paths";

function isAllowedRequest(method: string, path: string[]) {
  if (path.length !== 2 || !uuidPathSegmentPattern.test(path[0])) {
    return false;
  }
  if (path[1] === "replies") return method === "GET";
  if (path[1] === "likes") {
    return method === "GET" || method === "POST" || method === "DELETE";
  }
  return false;
}

export function proxyCommentRequest(request: Request, path: string[]) {
  if (!isAllowedRequest(request.method, path)) return notFoundResponse();
  return proxyJsonApiRequest(
    request,
    `${COMMENTS_API_PATH}/${path.join("/")}`,
    "The comment service is unavailable",
  );
}
