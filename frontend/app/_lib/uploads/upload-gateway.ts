import { notFoundResponse, proxyJsonApiRequest } from "../api/api-gateway";
import { UPLOADS_API_PATH } from "../api/api-paths";

export function proxyUploadRequest(request: Request, path: string[]) {
  if (
    request.method !== "POST" ||
    path.length !== 2 ||
    path[0] !== "post-images" ||
    path[1] !== "presign"
  ) {
    return notFoundResponse();
  }
  return proxyJsonApiRequest(
    request,
    `${UPLOADS_API_PATH}/post-images/presign`,
    "The upload service is unavailable",
  );
}
