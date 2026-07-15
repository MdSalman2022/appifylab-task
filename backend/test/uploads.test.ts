import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "../src/app.js";
import type { PostImageStorage } from "../src/services/post-image-storage.js";
import { createInMemoryAuthModel } from "./support/in-memory-auth-model.js";

const AUTH_BASE = "/api/v1/auth";
const UPLOADS_BASE = "/api/v1/uploads";

function createTestApp(storage: PostImageStorage) {
  const authModel = createInMemoryAuthModel();
  return createApp({
    checkDatabase: async () => true,
    authModel,
    postImageStorage: storage,
  });
}

async function registerUser(app: ReturnType<typeof createTestApp>) {
  const response = await request(app).post(`${AUTH_BASE}/register`).send({
    firstName: "Salman",
    lastName: "Ahmed",
    email: "salman@example.com",
    password: "StrongPassword123!",
  });
  return response.headers["set-cookie"][0] as string;
}

describe("post image uploads", () => {
  it("requires authentication before issuing an upload URL", async () => {
    const storage: PostImageStorage = {
      createPostImageUpload: vi.fn(),
    };
    const app = createTestApp(storage);

    const response = await request(app)
      .post(`${UPLOADS_BASE}/post-images/presign`)
      .send({
        fileName: "photo.jpg",
        contentType: "image/jpeg",
        size: 1024,
      });

    expect(response.status).toBe(401);
    expect(storage.createPostImageUpload).not.toHaveBeenCalled();
  });

  it("returns a short-lived upload authorization for a valid image", async () => {
    const storage: PostImageStorage = {
      createPostImageUpload: vi.fn().mockResolvedValue({
        key: "users/user-id/posts/image-id.jpg",
        uploadUrl: "https://account.r2.cloudflarestorage.com/upload",
        expiresAt: "2026-07-14T12:05:00.000Z",
        requiredHeaders: { "Content-Type": "image/jpeg" },
      }),
    };
    const app = createTestApp(storage);
    const cookie = await registerUser(app);

    const response = await request(app)
      .post(`${UPLOADS_BASE}/post-images/presign`)
      .set("Cookie", cookie)
      .send({
        fileName: "photo.jpg",
        contentType: "image/jpeg",
        size: 1024,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.upload).toMatchObject({
      key: "users/user-id/posts/image-id.jpg",
      requiredHeaders: { "Content-Type": "image/jpeg" },
    });
    expect(storage.createPostImageUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: expect.any(String),
        contentType: "image/jpeg",
        size: 1024,
      }),
    );
  });

  it.each([
    [{ fileName: "photo.gif", contentType: "image/gif", size: 1024 }],
    [{ fileName: "photo.jpg", contentType: "image/jpeg", size: 0 }],
    [
      {
        fileName: "photo.jpg",
        contentType: "image/jpeg",
        size: 5 * 1024 * 1024 + 1,
      },
    ],
  ])("rejects unsafe upload metadata", async (input) => {
    const storage: PostImageStorage = {
      createPostImageUpload: vi.fn(),
    };
    const app = createTestApp(storage);
    const cookie = await registerUser(app);

    const response = await request(app)
      .post(`${UPLOADS_BASE}/post-images/presign`)
      .set("Cookie", cookie)
      .send(input);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(storage.createPostImageUpload).not.toHaveBeenCalled();
  });
});
