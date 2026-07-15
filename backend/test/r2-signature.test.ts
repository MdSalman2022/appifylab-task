import { describe, expect, it } from "vitest";

import { createR2PostImageStorage } from "../src/services/r2-post-image-storage.js";

describe("R2 upload signature", () => {
  it("binds the browser upload to the declared content length", async () => {
    const storage = createR2PostImageStorage({
      accountId: "account-id",
      bucketName: "appifylab-media",
      accessKeyId: "access-key",
      secretAccessKey: "secret-key",
    });

    const upload = await storage.createPostImageUpload({
      userId: "a68d741c-79b7-4412-b1a5-bca41d56bfff",
      fileName: "photo.png",
      contentType: "image/png",
      size: 4096,
    });
    const signedHeaders =
      new URL(upload.uploadUrl).searchParams.get("X-Amz-SignedHeaders") ?? "";

    expect(signedHeaders.split(";")).toContain("content-length");
  });
});
