import type { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { describe, expect, it, vi } from "vitest";

import { createR2PostImageStorage } from "../src/services/r2-post-image-storage.js";

describe("R2 post image storage", () => {
  it("signs an isolated key with the declared type and byte length", async () => {
    const signUrl = vi
      .fn()
      .mockImplementation(
        async (
          _client: S3Client,
          command: PutObjectCommand,
          options: { expiresIn: number },
        ) => {
          expect(command.input).toMatchObject({
            Bucket: "appifylab-media",
            ContentType: "image/webp",
            ContentLength: 2048,
          });
          expect(options.expiresIn).toBe(300);
          return "https://example.r2.cloudflarestorage.com/signed";
        },
      );
    const storage = createR2PostImageStorage(
      {
        accountId: "account-id",
        bucketName: "appifylab-media",
        accessKeyId: "access-key",
        secretAccessKey: "secret-key",
      },
      signUrl,
    );

    const upload = await storage.createPostImageUpload({
      userId: "a68d741c-79b7-4412-b1a5-bca41d56bfff",
      fileName: "ignored-name.png",
      contentType: "image/webp",
      size: 2048,
    });

    expect(upload.key).toMatch(
      /^users\/a68d741c-79b7-4412-b1a5-bca41d56bfff\/posts\/[0-9a-f-]+\.webp$/,
    );
    expect(upload.requiredHeaders).toEqual({
      "Content-Type": "image/webp",
    });
  });
});
