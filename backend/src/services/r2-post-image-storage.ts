import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

import type {
  PostImageContentType,
  PostImageStorage,
} from "./post-image-storage.js";

const UPLOAD_EXPIRY_SECONDS = 300;

export type R2StorageConfig = {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
};

type SignUrl = typeof getSignedUrl;

const extensionByContentType: Record<PostImageContentType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function readR2StorageConfig(): R2StorageConfig {
  return {
    accountId: requiredEnvironmentVariable("R2_ACCOUNT_ID"),
    bucketName: requiredEnvironmentVariable("R2_BUCKET_NAME"),
    accessKeyId: requiredEnvironmentVariable("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnvironmentVariable("R2_SECRET_ACCESS_KEY"),
  };
}

export function createR2PostImageStorage(
  configured?: R2StorageConfig,
  signUrl: SignUrl = getSignedUrl,
): PostImageStorage {
  let client: S3Client | undefined;
  let config: R2StorageConfig | undefined = configured;

  function getStorage() {
    config ??= readR2StorageConfig();
    client ??= new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    return { client, config };
  }

  return {
    async createPostImageUpload({ userId, contentType, size }) {
      const storage = getStorage();
      const extension = extensionByContentType[contentType];
      const key = `users/${userId}/posts/${randomUUID()}.${extension}`;
      const command = new PutObjectCommand({
        Bucket: storage.config.bucketName,
        Key: key,
        ContentType: contentType,
        ContentLength: size,
        CacheControl: "public, max-age=31536000, immutable",
      });
      const uploadUrl = await signUrl(storage.client, command, {
        expiresIn: UPLOAD_EXPIRY_SECONDS,
        signableHeaders: new Set(["content-type"]),
      });

      return {
        key,
        uploadUrl,
        expiresAt: new Date(
          Date.now() + UPLOAD_EXPIRY_SECONDS * 1_000,
        ).toISOString(),
        requiredHeaders: { "Content-Type": contentType },
      };
    },
  };
}
