import type { RequestHandler } from "express";

import { isPostImageKeyOwnedByUser } from "../services/post-image-key.js";

function readImageKey(body: unknown) {
  if (typeof body !== "object" || body === null || !("imageKey" in body)) {
    return undefined;
  }
  return (body as { imageKey?: unknown }).imageKey;
}

export const validatePostImageOwnership: RequestHandler = (
  request,
  response,
  next,
) => {
  const imageKey = readImageKey(request.body);
  if (
    imageKey === undefined ||
    imageKey === null ||
    typeof imageKey !== "string" ||
    isPostImageKeyOwnedByUser(imageKey.trim(), request.user!.id)
  ) {
    next();
    return;
  }

  response.status(422).json({
    error: {
      code: "INVALID_IMAGE_KEY",
      message: "Post image does not belong to this user",
    },
  });
};
