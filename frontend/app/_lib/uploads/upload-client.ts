import { ApiError, requestJson } from "../api/api-client";
import { UPLOADS_API_PATH } from "../api/api-paths";
import {
  postImageUploadResponseSchema,
  type PostImageUpload,
} from "./upload-contract";

const MAX_POST_IMAGE_BYTES = 5 * 1024 * 1024;
const allowedPostImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function validatePostImage(file: File) {
  if (!allowedPostImageTypes.has(file.type)) {
    throw new ApiError(
      "INVALID_IMAGE_TYPE",
      "Choose a JPEG, PNG, or WebP image",
      422,
    );
  }
  if (file.size < 1 || file.size > MAX_POST_IMAGE_BYTES) {
    throw new ApiError(
      "INVALID_IMAGE_SIZE",
      "Choose an image no larger than 5 MB",
      422,
    );
  }
}

async function requestPostImageUpload(file: File): Promise<PostImageUpload> {
  const response = await requestJson(
    `${UPLOADS_API_PATH}/post-images/presign`,
    {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      }),
    },
    postImageUploadResponseSchema,
  );
  return response.data.upload;
}

export async function uploadPostImage(file: File): Promise<string> {
  validatePostImage(file);
  const upload = await requestPostImageUpload(file);

  let response: Response;
  try {
    response = await fetch(upload.uploadUrl, {
      method: "PUT",
      headers: upload.requiredHeaders,
      body: file,
    });
  } catch {
    throw new ApiError(
      "UPLOAD_NETWORK_ERROR",
      "Unable to upload the image. Please try again.",
      0,
    );
  }
  if (!response.ok) {
    throw new ApiError(
      "UPLOAD_FAILED",
      "The image upload failed. Please try again.",
      response.status,
    );
  }

  return upload.key;
}
